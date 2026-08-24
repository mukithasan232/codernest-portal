"""
image_processor.py — CoderNest Image Processing Backend
Usage: python3 image_processor.py <input_path> <output_path> <pipeline_json>
"""

import sys
import json
import io
import os

# ── Thread-safety fix: macOS recursive_mutex crash ───────────────────────────
# onnxruntime on macOS ignores OMP_NUM_THREADS for its internal inter-op pool.
# Hard-assign ALL threading env vars BEFORE any imports so native libs see them.
# These must be set, not just defaulted, to override any inherited parent values.
for _k, _v in {
    "OMP_NUM_THREADS":          "1",
    "OPENBLAS_NUM_THREADS":      "1",
    "MKL_NUM_THREADS":           "1",
    "VECLIB_MAXIMUM_THREADS":    "1",   # macOS Accelerate framework
    "NUMEXPR_NUM_THREADS":       "1",
    "ORT_DISABLE_ALL_TELEMETRY": "1",
}.items():
    os.environ[_k] = _v


def remove_white_spill(img):
    """
    Correct white colour-spill on semi-transparent edge pixels.
    Instead of darkening (wrong), we use the alpha channel to 'un-mix'
    the background white from the foreground colour.

    Formula (inverse alpha compositing):
        if alpha > 0:
            c_clean = (c - (1 - alpha/255) * 255) / (alpha/255)
        Clamp to [0, 255].

    This mathematically reverses the premultiplication with a white BG.
    Uses img.tobytes() instead of the deprecated img.getdata().
    """
    import struct

    # img.tobytes() returns raw RGBA bytes — 4 bytes per pixel
    raw = img.tobytes()
    width, height = img.size
    n_pixels = width * height

    cleaned_flat = bytearray(n_pixels * 4)
    for i in range(n_pixels):
        base = i * 4
        r, g, b, a = raw[base], raw[base + 1], raw[base + 2], raw[base + 3]
        if a == 0:
            # fully transparent — zero out RGB too
            cleaned_flat[base:base + 4] = bytes(4)
        elif a == 255:
            cleaned_flat[base:base + 4] = bytes([r, g, b, a])
        else:
            fa = a / 255.0
            r2 = max(0, min(255, int((r - (1 - fa) * 255) / fa)))
            g2 = max(0, min(255, int((g - (1 - fa) * 255) / fa)))
            b2 = max(0, min(255, int((b - (1 - fa) * 255) / fa)))
            cleaned_flat[base:base + 4] = bytes([r2, g2, b2, a])

    result = img.copy()
    result.frombytes(bytes(cleaned_flat))
    return result


def main():
    if len(sys.argv) < 4:
        print(json.dumps({"success": False, "error": "Usage: script input output pipeline_json"}))
        sys.exit(1)

    input_path  = sys.argv[1]
    output_path = sys.argv[2]

    try:
        pipeline = json.loads(sys.argv[3])
    except json.JSONDecodeError as e:
        print(json.dumps({"success": False, "error": f"Invalid pipeline JSON: {e}"}))
        sys.exit(1)

    actions  = json.loads(pipeline.get("actions", "[]"))
    bg_mode  = pipeline.get("bg_mode",  "transparent")
    bg_color = pipeline.get("bg_color", "#ffffff")
    defringe = max(0, min(5, int(pipeline.get("defringe", "1"))))
    width    = pipeline.get("width",    "")
    height   = pipeline.get("height",   "")
    fmt      = pipeline.get("format",   "png").upper()

    try:
        from PIL import Image, ImageFilter
    except ImportError:
        print(json.dumps({"success": False, "error": "Pillow not installed. Run: pip install Pillow"}))
        sys.exit(1)

    try:
        img = Image.open(input_path).convert("RGBA")
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Cannot open image: {e}"}))
        sys.exit(1)

    # ── Step 1: Background Removal ─────────────────────────────────────────────
    if "remove_bg" in actions:
        try:
            from rembg import remove, new_session
        except ImportError:
            print(json.dumps({"success": False, "error": "rembg not installed. Run: pip install rembg[cpu]"}))
            sys.exit(1)

        try:
            import onnxruntime as ort

            # SessionOptions is the ONLY reliable way to limit onnxruntime
            # threads on macOS — env vars alone are not respected by the
            # inter-op thread pool, causing the recursive_mutex crash.
            sess_opts = ort.SessionOptions()
            sess_opts.intra_op_num_threads = 1
            sess_opts.inter_op_num_threads = 1
            sess_opts.execution_mode      = ort.ExecutionMode.ORT_SEQUENTIAL
            sess_opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

            session = new_session("isnet-general-use", sess_options=sess_opts)

            # Feed original bytes directly — avoids re-encoding quality loss
            with open(input_path, "rb") as f:
                raw_bytes = f.read()

            out_bytes = remove(raw_bytes, session=session)
            img = Image.open(io.BytesIO(out_bytes)).convert("RGBA")

        except Exception as e:
            print(json.dumps({"success": False, "error": f"BG removal failed: {e}"}))
            sys.exit(1)

        # ── Edge Defringe (Alpha Matte Refinement) ────────────────────────────
        # Only run when defringe > 0
        # Algorithm:
        #   A) White-spill correction — mathematically un-mixes the old white
        #      background from semi-transparent edge pixels (no darkening)
        #   B) Gentle erosion (1 MinFilter pass per defringe level) — trims the
        #      outermost fringe ring from the mask
        #   C) Feather (GaussianBlur on alpha) — re-softens eroded edges so
        #      individual hair strands look natural, not clipped
        if defringe > 0:
            try:
                # Step A — un-mix white spill BEFORE touching the mask
                img = remove_white_spill(img)

                # Step B — erode alpha mask to cut off remaining fringe ring
                _, _, _, a_ch = img.split()

                a_eroded = a_ch
                for _ in range(defringe):
                    a_eroded = a_eroded.filter(ImageFilter.MinFilter(3))

                # Step C — feather the eroded boundary
                feather_r = max(0.5, defringe * 0.8)
                a_feathered = a_eroded.filter(ImageFilter.GaussianBlur(radius=feather_r))

                # Merge refined alpha back — do NOT touch RGB channels further
                r_ch, g_ch, b_ch, _ = img.split()
                img = Image.merge("RGBA", [r_ch, g_ch, b_ch, a_feathered])

            except Exception as e:
                # Defringe is best-effort — fall back to raw rembg output on error
                print(f"Defringe warning (non-fatal): {e}", file=sys.stderr)

        # ── Background Fill ────────────────────────────────────────────────────
        try:
            if bg_mode == "white":
                bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
                bg.paste(img, mask=img.split()[3])
                img = bg
            elif bg_mode == "black":
                bg = Image.new("RGBA", img.size, (0, 0, 0, 255))
                bg.paste(img, mask=img.split()[3])
                img = bg
            elif bg_mode == "color":
                hex_c = bg_color.lstrip("#")
                r_v = int(hex_c[0:2], 16)
                g_v = int(hex_c[2:4], 16)
                b_v = int(hex_c[4:6], 16)
                bg = Image.new("RGBA", img.size, (r_v, g_v, b_v, 255))
                bg.paste(img, mask=img.split()[3])
                img = bg
            # transparent: keep RGBA as-is
        except Exception as e:
            print(json.dumps({"success": False, "error": f"BG fill failed: {e}"}))
            sys.exit(1)

    # ── Step 2: Resize ─────────────────────────────────────────────────────────
    if "resize" in actions:
        try:
            ow, oh = img.size
            tw = int(width)  if width  and width  != "null" else 0
            th = int(height) if height and height != "null" else 0

            if tw <= 0 and th <= 0:
                raise ValueError("Provide at least one of width or height.")
            if tw <= 0:
                tw = max(1, int(ow * th / oh))
            if th <= 0:
                th = max(1, int(oh * tw / ow))

            img = img.resize((tw, th), Image.Resampling.LANCZOS)
        except Exception as e:
            print(json.dumps({"success": False, "error": f"Resize failed: {e}"}))
            sys.exit(1)

    # ── Step 3: Format Conversion & Save ──────────────────────────────────────
    try:
        save_fmt = fmt if fmt in ("PNG", "JPEG", "WEBP", "BMP") else "PNG"

        if save_fmt in ("JPEG", "BMP") and img.mode in ("RGBA", "P", "LA"):
            flat = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "RGBA":
                flat.paste(img, mask=img.split()[3])
            else:
                flat.paste(img)
            img = flat
        elif img.mode == "P":
            img = img.convert("RGB")

        img.save(output_path, format=save_fmt)
        print(json.dumps({"success": True, "output": output_path}))

    except Exception as e:
        print(json.dumps({"success": False, "error": f"Save failed: {e}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
