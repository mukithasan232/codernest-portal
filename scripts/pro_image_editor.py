import os
import io
import threading
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, colorchooser
from PIL import Image, ImageEnhance, ImageTk

try:
    from rembg import remove, new_session
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False

# ──────────────────────────────────────────────────────────────
# Drag & Drop helper (tkinterdnd2 is optional)
# Install with: pip install tkinterdnd2
# ──────────────────────────────────────────────────────────────
import importlib

_dnd_mod = importlib.util.find_spec("tkinterdnd2")
if _dnd_mod is not None:
    import tkinterdnd2 as _dnd_lib  # type: ignore[import-not-found]
    BASE_CLASS = _dnd_lib.TkinterDnD.Tk
    DND_FILES = _dnd_lib.DND_FILES
    DND_AVAILABLE = True
else:
    BASE_CLASS = tk.Tk  # type: ignore[assignment]
    DND_FILES = None
    DND_AVAILABLE = False


class ProStudio(BASE_CLASS):
    """CoderNest Advanced Pro Image Studio"""

    # ── Init ──────────────────────────────────────────────────
    def __init__(self):
        super().__init__()
        self.title("CoderNest Pro Image Studio")
        self.geometry("1100x700")
        self.minsize(900, 600)
        self.configure(bg="#1e1e2e")

        # State
        self.original_image: Image.Image | None = None   # PIL image (original)
        self.result_image:   Image.Image | None = None   # PIL image (processed)
        self.original_path:  str = ""
        self.rembg_session = None
        self.bg_color: str | None = None
        self._tk_orig: ImageTk.PhotoImage | None = None
        self._tk_res:  ImageTk.PhotoImage | None = None

        # ── Styles ───────────────────────────────────────────
        style = ttk.Style(self)
        style.theme_use("clam")
        style.configure(".", background="#1e1e2e", foreground="#cdd6f4",
                        fieldbackground="#313244", troughcolor="#313244",
                        selectbackground="#89b4fa", selectforeground="#1e1e2e")
        style.configure("TFrame",       background="#1e1e2e")
        style.configure("TLabelframe",  background="#1e1e2e", foreground="#89b4fa",
                        bordercolor="#45475a", relief="flat")
        style.configure("TLabelframe.Label", background="#1e1e2e",
                        foreground="#89b4fa", font=("Segoe UI", 9, "bold"))
        style.configure("TLabel",       background="#1e1e2e", foreground="#cdd6f4")
        style.configure("TCheckbutton", background="#1e1e2e", foreground="#cdd6f4")
        style.configure("TRadiobutton", background="#1e1e2e", foreground="#cdd6f4")
        style.configure("TScale",       background="#1e1e2e")
        style.configure("TCombobox",    fieldbackground="#313244",
                        background="#313244", foreground="#cdd6f4")
        style.map("TCombobox", fieldbackground=[("readonly","#313244")],
                               foreground=[("readonly","#cdd6f4")])
        style.configure("Accent.TButton", background="#89b4fa", foreground="#1e1e2e",
                        font=("Segoe UI", 10, "bold"), padding=8)
        style.map("Accent.TButton",
                  background=[("active","#b4befe")],
                  foreground=[("active","#1e1e2e")])
        style.configure("Danger.TButton", background="#f38ba8", foreground="#1e1e2e",
                        font=("Segoe UI", 9, "bold"), padding=6)
        style.map("Danger.TButton",
                  background=[("active","#eba0ac")],
                  foreground=[("active","#1e1e2e")])
        style.configure("TButton", background="#313244", foreground="#cdd6f4",
                        font=("Segoe UI", 9), padding=6)
        style.map("TButton",
                  background=[("active","#45475a")],
                  foreground=[("active","#cdd6f4")])
        style.configure("TProgressbar", troughcolor="#313244",
                        background="#89b4fa", thickness=8)

        self._build_ui()

    # ── UI ───────────────────────────────────────────────────
    def _build_ui(self):
        root = ttk.Frame(self, padding=10)
        root.pack(fill=tk.BOTH, expand=True)
        root.columnconfigure(0, weight=3)   # previews
        root.columnconfigure(1, weight=1)   # controls
        root.rowconfigure(0, weight=1)

        # ── Left: preview panes ──────────────────────────────
        preview_frame = ttk.Frame(root)
        preview_frame.grid(row=0, column=0, sticky="nsew", padx=(0, 10))
        preview_frame.rowconfigure(1, weight=1)
        preview_frame.columnconfigure(0, weight=1)
        preview_frame.columnconfigure(1, weight=1)

        # Drop zone / file label
        drop_frame = ttk.Frame(preview_frame)
        drop_frame.grid(row=0, column=0, columnspan=2, sticky="ew", pady=(0, 8))

        self.path_lbl = ttk.Label(drop_frame, text="No image loaded",
                                  font=("Segoe UI", 9), foreground="#6c7086")
        self.path_lbl.pack(side=tk.LEFT, fill=tk.X, expand=True)

        ttk.Button(drop_frame, text="📂 Open Image", command=self._browse).pack(side=tk.RIGHT, padx=(5, 0))
        ttk.Button(drop_frame, text="↩ Reset", style="Danger.TButton",
                   command=self._reset).pack(side=tk.RIGHT, padx=(5, 0))

        # Before canvas
        before_lf = ttk.LabelFrame(preview_frame, text=" Before ", padding=4)
        before_lf.grid(row=1, column=0, sticky="nsew", padx=(0, 4))
        self.before_canvas = tk.Canvas(before_lf, bg="#11111b",
                                       highlightthickness=0)
        self.before_canvas.pack(fill=tk.BOTH, expand=True)

        # After canvas
        after_lf = ttk.LabelFrame(preview_frame, text=" After (Result) ", padding=4)
        after_lf.grid(row=1, column=1, sticky="nsew", padx=(4, 0))
        self.after_canvas = tk.Canvas(after_lf, bg="#11111b",
                                      highlightthickness=0)
        self.after_canvas.pack(fill=tk.BOTH, expand=True)

        # Drag & drop on both canvases
        if DND_AVAILABLE:
            for c in (self.before_canvas, self.after_canvas):
                c.drop_target_register(DND_FILES)
                c.dnd_bind("<<Drop>>", lambda e: self._load_image(e.data.strip("{}")))

        # Status / progress
        status_frame = ttk.Frame(preview_frame)
        status_frame.grid(row=2, column=0, columnspan=2, sticky="ew", pady=(8, 0))

        self.status_var = tk.StringVar(value="Ready — open an image to get started.")
        ttk.Label(status_frame, textvariable=self.status_var,
                  font=("Segoe UI", 9), foreground="#a6e3a1").pack(side=tk.LEFT)

        self.progress = ttk.Progressbar(status_frame, mode="indeterminate", length=120)
        self.progress.pack(side=tk.RIGHT)

        # ── Right: controls ──────────────────────────────────
        ctrl = ttk.Frame(root, padding=(0, 0))
        ctrl.grid(row=0, column=1, sticky="nsew")

        # ── BG Removal block ─────────────────────────────────
        bg_lf = ttk.LabelFrame(ctrl, text=" 🎭 Background Removal ", padding=10)
        bg_lf.pack(fill=tk.X, pady=(0, 8))

        self.use_rembg = tk.BooleanVar(value=True)
        ttk.Checkbutton(bg_lf, text="Enable BG Removal", variable=self.use_rembg).pack(anchor=tk.W)

        self.mask_only = tk.BooleanVar(value=False)
        ttk.Checkbutton(bg_lf, text="Output mask only", variable=self.mask_only).pack(anchor=tk.W, pady=(2, 6))

        color_row = ttk.Frame(bg_lf)
        color_row.pack(fill=tk.X)
        ttk.Label(color_row, text="Replace BG:").pack(side=tk.LEFT)
        self.color_swatch = tk.Label(color_row, text="  transparent  ",
                                     bg="#313244", fg="#6c7086", relief="flat",
                                     cursor="hand2")
        self.color_swatch.pack(side=tk.LEFT, padx=5)
        self.color_swatch.bind("<Button-1>", lambda e: self._pick_color())

        ttk.Button(color_row, text="✕ Clear",
                   command=self._clear_color).pack(side=tk.RIGHT)

        # ── Resize block ─────────────────────────────────────
        rz_lf = ttk.LabelFrame(ctrl, text=" 📐 Resize ", padding=10)
        rz_lf.pack(fill=tk.X, pady=(0, 8))

        self.use_resize = tk.BooleanVar(value=False)
        ttk.Checkbutton(rz_lf, text="Enable Resize", variable=self.use_resize).pack(anchor=tk.W, pady=(0, 6))

        rz_grid = ttk.Frame(rz_lf)
        rz_grid.pack(fill=tk.X)
        rz_grid.columnconfigure(1, weight=1)
        rz_grid.columnconfigure(3, weight=1)

        ttk.Label(rz_grid, text="W:").grid(row=0, column=0, sticky=tk.W, padx=(0, 4))
        self.width_var = tk.StringVar()
        ttk.Entry(rz_grid, textvariable=self.width_var, width=7).grid(row=0, column=1, sticky=tk.EW, padx=(0, 8))
        ttk.Label(rz_grid, text="H:").grid(row=0, column=2, sticky=tk.W, padx=(0, 4))
        self.height_var = tk.StringVar()
        ttk.Entry(rz_grid, textvariable=self.height_var, width=7).grid(row=0, column=3, sticky=tk.EW)

        self.keep_ratio = tk.BooleanVar(value=True)
        ttk.Checkbutton(rz_lf, text="Keep aspect ratio", variable=self.keep_ratio).pack(anchor=tk.W, pady=(4, 0))

        # ── Retouch block ─────────────────────────────────────
        rt_lf = ttk.LabelFrame(ctrl, text=" ✨ Retouch / Enhance ", padding=10)
        rt_lf.pack(fill=tk.X, pady=(0, 8))

        self.use_retouch = tk.BooleanVar(value=False)
        ttk.Checkbutton(rt_lf, text="Enable Retouch", variable=self.use_retouch).pack(anchor=tk.W, pady=(0, 6))

        sliders = [
            ("Sharpness", "sharpness_var", 1.0, 0.0, 4.0),
            ("Brightness", "brightness_var", 1.0, 0.0, 3.0),
            ("Contrast",   "contrast_var",   1.0, 0.0, 3.0),
        ]
        for label, attr, default, lo, hi in sliders:
            row = ttk.Frame(rt_lf)
            row.pack(fill=tk.X, pady=2)
            ttk.Label(row, text=label, width=10).pack(side=tk.LEFT)
            var = tk.DoubleVar(value=default)
            setattr(self, attr, var)
            ttk.Scale(row, from_=lo, to=hi, variable=var,
                      orient=tk.HORIZONTAL).pack(side=tk.LEFT, fill=tk.X, expand=True)
            ttk.Label(row, textvariable=var, width=4).pack(side=tk.RIGHT)

        # ── Output block ─────────────────────────────────────
        out_lf = ttk.LabelFrame(ctrl, text=" 💾 Output ", padding=10)
        out_lf.pack(fill=tk.X, pady=(0, 8))

        ttk.Label(out_lf, text="Format:").pack(anchor=tk.W)
        self.out_format = tk.StringVar(value="PNG")
        ttk.Combobox(out_lf, textvariable=self.out_format,
                     values=["PNG", "JPEG", "WEBP", "BMP"],
                     state="readonly").pack(fill=tk.X, pady=(2, 8))

        self.auto_save = tk.BooleanVar(value=True)
        ttk.Checkbutton(out_lf, text="Auto-save (same folder as input)",
                        variable=self.auto_save).pack(anchor=tk.W)

        # ── Process button ────────────────────────────────────
        self.proc_btn = ttk.Button(ctrl, text="⚡ Process Image",
                                   style="Accent.TButton",
                                   command=self._start_processing)
        self.proc_btn.pack(fill=tk.X, pady=(8, 4))

        ttk.Button(ctrl, text="📥 Save As…",
                   command=self._save_as).pack(fill=tk.X)

        # Bind resize to refresh previews
        self.bind("<Configure>", lambda e: self.after(50, self._refresh_previews))

    # ── File Handling ─────────────────────────────────────────
    def _browse(self):
        path = filedialog.askopenfilename(
            filetypes=[("Images", "*.png *.jpg *.jpeg *.webp *.bmp *.tiff")])
        if path:
            self._load_image(path)

    def _load_image(self, path: str):
        try:
            path = path.strip()
            img = Image.open(path).convert("RGBA")
            self.original_image = img
            self.result_image = None
            self.original_path = path
            self.path_lbl.config(text=os.path.basename(path),
                                 foreground="#a6e3a1")
            self.status_var.set(f"Loaded: {os.path.basename(path)}"
                                f"  ({img.width}×{img.height})")
            self._refresh_previews()
        except Exception as ex:
            messagebox.showerror("Load Error", str(ex))

    def _reset(self):
        self.result_image = None
        self.status_var.set("Reset — original image restored.")
        self._refresh_previews()

    # ── Preview ───────────────────────────────────────────────
    def _fit(self, img: Image.Image, canvas: tk.Canvas) -> ImageTk.PhotoImage:
        cw = canvas.winfo_width()  or 400
        ch = canvas.winfo_height() or 350
        img.thumbnail((cw, ch), Image.Resampling.LANCZOS)
        return ImageTk.PhotoImage(img)

    def _draw_canvas(self, canvas: tk.Canvas, img: Image.Image | None,
                     attr: str, label: str):
        canvas.delete("all")
        cw = canvas.winfo_width()  or 400
        ch = canvas.winfo_height() or 350
        if img is None:
            canvas.create_text(cw//2, ch//2, text=label,
                               fill="#45475a", font=("Segoe UI", 11))
            return
        # Draw checkered background (transparency indicator)
        sq = 16
        for row in range(0, ch, sq):
            for col in range(0, cw, sq):
                color = "#1e1e2e" if (row // sq + col // sq) % 2 == 0 else "#313244"
                canvas.create_rectangle(col, row, col+sq, row+sq,
                                        fill=color, outline="")
        tk_img = self._fit(img.copy(), canvas)
        setattr(self, attr, tk_img)            # prevent GC
        x = cw // 2
        y = ch // 2
        canvas.create_image(x, y, anchor=tk.CENTER, image=tk_img)

    def _refresh_previews(self):
        self._draw_canvas(self.before_canvas, self.original_image,
                          "_tk_orig", "Drop an image here\nor click Open")
        self._draw_canvas(self.after_canvas,
                          self.result_image if self.result_image else self.original_image,
                          "_tk_res",  "Result will appear here")

    # ── Color Picker ──────────────────────────────────────────
    def _pick_color(self):
        color = colorchooser.askcolor(title="Select Background Color")
        if color and color[1]:
            self.bg_color = color[1]
            self.color_swatch.config(bg=color[1], fg="#1e1e2e",
                                     text=f"  {color[1]}  ")

    def _clear_color(self):
        self.bg_color = None
        self.color_swatch.config(bg="#313244", fg="#6c7086",
                                 text="  transparent  ")

    # ── Processing ────────────────────────────────────────────
    def _set_busy(self, busy: bool, msg: str = ""):
        if busy:
            self.proc_btn.config(state=tk.DISABLED)
            self.config(cursor="watch")
            self.status_var.set(msg)
            self.progress.start(10)
        else:
            self.proc_btn.config(state=tk.NORMAL)
            self.config(cursor="")
            self.status_var.set(msg)
            self.progress.stop()

    def _start_processing(self):
        if self.original_image is None:
            messagebox.showwarning("No Image", "Please open an image first.")
            return
        if self.use_rembg.get() and not REMBG_AVAILABLE:
            messagebox.showerror("Missing Dependency",
                                 "rembg not found.\n\nRun: pip install rembg[cpu]")
            return
        self._set_busy(True, "Processing…")
        t = threading.Thread(target=self._run_pipeline, daemon=True)
        t.start()

    def _run_pipeline(self):
        try:
            img = self.original_image.copy()

            # ── Step 1: Background Removal ────────────────────
            if self.use_rembg.get():
                self.after(0, lambda: self.status_var.set(
                    "Step 1/3 — Loading isnet-general-use model…"))
                if not self.rembg_session:
                    self.rembg_session = new_session("isnet-general-use")

                buf = io.BytesIO()
                img.save(buf, format="PNG")
                buf.seek(0)
                self.after(0, lambda: self.status_var.set(
                    "Step 1/3 — Removing background (high-precision)…"))
                out = remove(buf.read(), session=self.rembg_session,
                             only_mask=self.mask_only.get())
                img = Image.open(io.BytesIO(out)).convert("RGBA")

                if self.bg_color and not self.mask_only.get():
                    bg = Image.new("RGBA", img.size, self.bg_color)
                    bg.paste(img, mask=img.split()[3])
                    img = bg

            # ── Step 2: Retouch ───────────────────────────────
            if self.use_retouch.get():
                self.after(0, lambda: self.status_var.set(
                    "Step 2/3 — Retouching…"))
                for enhancer_cls, var in (
                    (ImageEnhance.Sharpness,  self.sharpness_var),
                    (ImageEnhance.Brightness, self.brightness_var),
                    (ImageEnhance.Contrast,   self.contrast_var),
                ):
                    img = enhancer_cls(img).enhance(var.get())

            # ── Step 3: Resize ────────────────────────────────
            if self.use_resize.get():
                self.after(0, lambda: self.status_var.set(
                    "Step 3/3 — Resizing…"))
                w_s = self.width_var.get().strip()
                h_s = self.height_var.get().strip()
                ow, oh = img.size
                try:
                    if w_s and h_s:
                        tw, th = max(1, int(w_s)), max(1, int(h_s))
                    elif w_s:
                        tw = max(1, int(w_s))
                        th = max(1, int(oh * tw / ow)) if self.keep_ratio.get() else oh
                    elif h_s:
                        th = max(1, int(h_s))
                        tw = max(1, int(ow * th / oh)) if self.keep_ratio.get() else ow
                    else:
                        raise ValueError("Enter at least Width or Height.")
                except ValueError as ve:
                    raise ValueError(f"Resize: {ve}")
                img = img.resize((tw, th), Image.Resampling.LANCZOS)

            self.result_image = img

            # ── Auto-save ─────────────────────────────────────
            saved_to = ""
            if self.auto_save.get() and self.original_path:
                saved_to = self._auto_save(img)

            # Update UI on main thread
            def _done():
                self._refresh_previews()
                msg = f"Done! {img.width}×{img.height}px"
                if saved_to:
                    msg += f" — Saved to: {os.path.basename(saved_to)}"
                self._set_busy(False, msg)

            self.after(0, _done)

        except Exception as ex:
            def _err():
                self._set_busy(False, f"Error: {ex}")
                messagebox.showerror("Processing Error",
                                     f"An error occurred:\n\n{ex}")
            self.after(0, _err)

    # ── Save Helpers ──────────────────────────────────────────
    def _auto_save(self, img: Image.Image) -> str:
        fmt = self.out_format.get()
        ext_map = {"PNG": ".png", "JPEG": ".jpg", "WEBP": ".webp", "BMP": ".bmp"}
        ext = ext_map.get(fmt, ".png")
        base = os.path.splitext(self.original_path)[0]
        out_path = f"{base}_edited{ext}"
        self._save_image(img, out_path, fmt)
        return out_path

    def _save_as(self):
        if self.result_image is None and self.original_image is None:
            messagebox.showwarning("Nothing to Save", "Process an image first.")
            return
        img = self.result_image or self.original_image
        fmt = self.out_format.get()
        ext_map = {"PNG": ".png", "JPEG": ".jpg", "WEBP": ".webp", "BMP": ".bmp"}
        ext = ext_map.get(fmt, ".png")
        path = filedialog.asksaveasfilename(
            defaultextension=ext,
            initialfile=f"output{ext}",
            filetypes=[(f"{fmt} Image", f"*{ext}"), ("All Files", "*.*")])
        if path:
            self._save_image(img, path, fmt)
            messagebox.showinfo("Saved", f"Image saved to:\n{path}")

    @staticmethod
    def _save_image(img: Image.Image, path: str, fmt: str):
        if fmt in ("JPEG", "BMP") and img.mode in ("RGBA", "P", "LA"):
            bg = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "RGBA":
                bg.paste(img, mask=img.split()[3])
            else:
                bg.paste(img)
            img = bg
        elif img.mode == "P":
            img = img.convert("RGB")
        img.save(path, format=fmt)


if __name__ == "__main__":
    app = ProStudio()
    app.mainloop()
