import os
import threading
import customtkinter as ctk
from tkinter import filedialog, messagebox, colorchooser
from PIL import Image

try:
    from rembg import remove
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False

ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class BulkImageStudio(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        self.title("CoderNest Bulk Image Studio - Professional")
        self.geometry("900x700")
        
        self.input_files = []
        self.output_dir = ""
        self.bg_image_path = ""
        self.watermark_path = ""
        
        self.setup_ui()
        
    def setup_ui(self):
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)
        
        # --- LEFT SIDEBAR (Controls) ---
        self.sidebar = ctk.CTkScrollableFrame(self, width=300, corner_radius=0)
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        
        ctk.CTkLabel(self.sidebar, text="Professional Tools", font=ctk.CTkFont(size=20, weight="bold")).pack(pady=(20, 10))
        
        # 1. Background Remover
        self.use_bg_remove = ctk.BooleanVar(value=False)
        self.bg_remove_cb = ctk.CTkCheckBox(self.sidebar, text="Remove Background", variable=self.use_bg_remove, command=self.toggle_bg_options)
        self.bg_remove_cb.pack(anchor="w", padx=20, pady=(10, 5))
        
        self.bg_options_frame = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        
        self.bg_type = ctk.StringVar(value="transparent")
        ctk.CTkRadioButton(self.bg_options_frame, text="Transparent", variable=self.bg_type, value="transparent").pack(anchor="w", pady=2)
        
        self.color_frame = ctk.CTkFrame(self.bg_options_frame, fg_color="transparent")
        self.color_frame.pack(fill="x", pady=2)
        ctk.CTkRadioButton(self.color_frame, text="Solid Color", variable=self.bg_type, value="color").pack(side="left")
        self.bg_color = "#FFFFFF"
        self.color_btn = ctk.CTkButton(self.color_frame, text="Pick Color", width=80, command=self.pick_color)
        self.color_btn.pack(side="right", padx=5)
        
        self.img_bg_frame = ctk.CTkFrame(self.bg_options_frame, fg_color="transparent")
        self.img_bg_frame.pack(fill="x", pady=2)
        ctk.CTkRadioButton(self.img_bg_frame, text="Image BG", variable=self.bg_type, value="image").pack(side="left")
        self.bg_img_btn = ctk.CTkButton(self.img_bg_frame, text="Browse", width=80, command=self.pick_bg_image)
        self.bg_img_btn.pack(side="right", padx=5)
        
        # 2. Resize
        self.use_resize = ctk.BooleanVar(value=False)
        self.resize_cb = ctk.CTkCheckBox(self.sidebar, text="Resize Images", variable=self.use_resize, command=self.toggle_resize_options)
        self.resize_cb.pack(anchor="w", padx=20, pady=(20, 5))
        
        self.resize_options_frame = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        self.width_var = ctk.StringVar()
        self.height_var = ctk.StringVar()
        ctk.CTkEntry(self.resize_options_frame, textvariable=self.width_var, placeholder_text="Width (px)").pack(fill="x", pady=2)
        ctk.CTkEntry(self.resize_options_frame, textvariable=self.height_var, placeholder_text="Height (px)").pack(fill="x", pady=2)
        
        # 3. Format Convert
        self.use_convert = ctk.BooleanVar(value=False)
        self.convert_cb = ctk.CTkCheckBox(self.sidebar, text="Convert Format", variable=self.use_convert, command=self.toggle_convert_options)
        self.convert_cb.pack(anchor="w", padx=20, pady=(20, 5))
        
        self.convert_options_frame = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        self.format_var = ctk.StringVar(value="PNG")
        self.format_menu = ctk.CTkOptionMenu(self.convert_options_frame, variable=self.format_var, values=["PNG", "JPEG", "WEBP"])
        self.format_menu.pack(fill="x", pady=2)
        
        # 4. Watermark
        self.use_watermark = ctk.BooleanVar(value=False)
        self.watermark_cb = ctk.CTkCheckBox(self.sidebar, text="Add Watermark", variable=self.use_watermark, command=self.toggle_watermark_options)
        self.watermark_cb.pack(anchor="w", padx=20, pady=(20, 5))
        
        self.watermark_options_frame = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        self.wm_btn = ctk.CTkButton(self.watermark_options_frame, text="Browse Logo", command=self.pick_watermark)
        self.wm_btn.pack(fill="x", pady=2)
        self.wm_pos = ctk.StringVar(value="Bottom-Right")
        self.wm_menu = ctk.CTkOptionMenu(self.watermark_options_frame, variable=self.wm_pos, values=["Bottom-Right", "Bottom-Left", "Top-Right", "Top-Left", "Center"])
        self.wm_menu.pack(fill="x", pady=2)
        
        if not REMBG_AVAILABLE:
            self.bg_remove_cb.configure(state="disabled", text="Remove Background (rembg missing)")
            
        # --- RIGHT MAIN AREA ---
        self.main_area = ctk.CTkFrame(self)
        self.main_area.grid(row=0, column=1, sticky="nsew", padx=20, pady=20)
        
        # Input Selection
        self.btn_select_files = ctk.CTkButton(self.main_area, text="Add Images", command=self.select_files)
        self.btn_select_files.pack(pady=(10, 10))
        
        self.files_textbox = ctk.CTkTextbox(self.main_area, height=300)
        self.files_textbox.pack(fill="both", expand=True, pady=10)
        self.files_textbox.insert("0.0", "No images selected...\n")
        self.files_textbox.configure(state="disabled")
        
        # Output Directory
        self.out_dir_frame = ctk.CTkFrame(self.main_area, fg_color="transparent")
        self.out_dir_frame.pack(fill="x", pady=10)
        self.out_dir_label = ctk.CTkLabel(self.out_dir_frame, text="Output Folder: Not selected", anchor="w")
        self.out_dir_label.pack(side="left", fill="x", expand=True)
        self.btn_out_dir = ctk.CTkButton(self.out_dir_frame, text="Choose Output", width=120, command=self.select_output_dir)
        self.btn_out_dir.pack(side="right")
        
        # Process Controls
        self.progress_bar = ctk.CTkProgressBar(self.main_area)
        self.progress_bar.pack(fill="x", pady=10)
        self.progress_bar.set(0)
        
        self.status_label = ctk.CTkLabel(self.main_area, text="Ready")
        self.status_label.pack(pady=5)
        
        self.btn_process = ctk.CTkButton(self.main_area, text="Start Bulk Processing", height=50, font=ctk.CTkFont(size=18, weight="bold"), command=self.start_processing)
        self.btn_process.pack(fill="x", pady=10)

    # --- UI Toggles ---
    def toggle_bg_options(self):
        if self.use_bg_remove.get(): self.bg_options_frame.pack(fill="x", padx=40, pady=5)
        else: self.bg_options_frame.pack_forget()

    def toggle_resize_options(self):
        if self.use_resize.get(): self.resize_options_frame.pack(fill="x", padx=40, pady=5)
        else: self.resize_options_frame.pack_forget()

    def toggle_convert_options(self):
        if self.use_convert.get(): self.convert_options_frame.pack(fill="x", padx=40, pady=5)
        else: self.convert_options_frame.pack_forget()

    def toggle_watermark_options(self):
        if self.use_watermark.get(): self.watermark_options_frame.pack(fill="x", padx=40, pady=5)
        else: self.watermark_options_frame.pack_forget()
        
    # --- File Dialogs ---
    def pick_color(self):
        color = colorchooser.askcolor(title="Choose Background Color")
        if color[1]:
            self.bg_color = color[1]
            self.color_btn.configure(text=self.bg_color)
            self.bg_type.set("color")
            
    def pick_bg_image(self):
        path = filedialog.askopenfilename(filetypes=[("Images", "*.jpg *.png *.jpeg *.webp")])
        if path:
            self.bg_image_path = path
            self.bg_img_btn.configure(text="Selected")
            self.bg_type.set("image")
            
    def pick_watermark(self):
        path = filedialog.askopenfilename(filetypes=[("PNG Images", "*.png")])
        if path:
            self.watermark_path = path
            self.wm_btn.configure(text="Logo Selected")
            
    def select_files(self):
        files = filedialog.askopenfilenames(filetypes=[("Images", "*.png *.jpg *.jpeg *.webp")])
        if files:
            self.input_files.extend(files)
            # Remove duplicates
            self.input_files = list(set(self.input_files))
            self.update_files_list()
            
    def select_output_dir(self):
        dir_path = filedialog.askdirectory()
        if dir_path:
            self.output_dir = dir_path
            self.out_dir_label.configure(text=f"Output Folder: {self.output_dir}")
            
    def update_files_list(self):
        self.files_textbox.configure(state="normal")
        self.files_textbox.delete("0.0", "end")
        for idx, f in enumerate(self.input_files):
            self.files_textbox.insert("end", f"{idx+1}. {os.path.basename(f)}\n")
        self.files_textbox.configure(state="disabled")

    # --- Processing Engine ---
    def start_processing(self):
        if not self.input_files:
            messagebox.showwarning("Warning", "No images selected!")
            return
        if not self.output_dir:
            messagebox.showwarning("Warning", "Select an output folder!")
            return
            
        self.btn_process.configure(state="disabled", text="Processing...")
        self.progress_bar.set(0)
        
        # Run in thread to prevent UI freezing
        thread = threading.Thread(target=self.process_batch)
        thread.daemon = True
        thread.start()
        
    def process_batch(self):
        total = len(self.input_files)
        success_count = 0
        
        for idx, file_path in enumerate(self.input_files):
            self.status_label.configure(text=f"Processing {idx+1}/{total}: {os.path.basename(file_path)}")
            
            try:
                self.process_single_image(file_path)
                success_count += 1
            except Exception as e:
                print(f"Failed {file_path}: {e}")
                
            progress = (idx + 1) / total
            self.progress_bar.set(progress)
            
        self.status_label.configure(text=f"Done! Successfully processed {success_count}/{total} images.")
        self.btn_process.configure(state="normal", text="Start Bulk Processing")
        messagebox.showinfo("Complete", f"Batch processing finished!\nProcessed: {success_count}/{total}")

    def process_single_image(self, file_path):
        filename = os.path.basename(file_path)
        name, ext = os.path.splitext(filename)
        
        # 1. Background Removal
        if self.use_bg_remove.get() and REMBG_AVAILABLE:
            with open(file_path, "rb") as f:
                img_data = f.read()
            out_data = remove(img_data)
            
            import io
            img = Image.open(io.BytesIO(out_data)).convert("RGBA")
            
            # Apply Custom Backgrounds
            bg_mode = self.bg_type.get()
            if bg_mode == "color":
                bg = Image.new("RGBA", img.size, self.bg_color)
                bg.paste(img, (0, 0), img)
                img = bg
            elif bg_mode == "image" and self.bg_image_path:
                bg = Image.open(self.bg_image_path).convert("RGBA")
                bg = bg.resize(img.size, Image.Resampling.LANCZOS)
                bg.paste(img, (0, 0), img)
                img = bg
        else:
            img = Image.open(file_path).convert("RGBA")

        # 2. Resize
        if self.use_resize.get():
            w = self.width_var.get()
            h = self.height_var.get()
            orig_w, orig_h = img.size
            
            target_w = int(w) if w else orig_w
            target_h = int(h) if h else orig_h
            
            if not w and h:
                target_w = int(orig_w * (target_h / orig_h))
            elif not h and w:
                target_h = int(orig_h * (target_w / orig_w))
                
            img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)

        # 3. Watermark
        if self.use_watermark.get() and self.watermark_path:
            wm = Image.open(self.watermark_path).convert("RGBA")
            
            # Scale watermark to 20% of image width
            wm_w = int(img.size[0] * 0.20)
            wm_h = int(wm.size[1] * (wm_w / wm.size[0]))
            wm = wm.resize((wm_w, wm_h), Image.Resampling.LANCZOS)
            
            pos = self.wm_pos.get()
            padding = 20
            
            if pos == "Bottom-Right":
                x = img.size[0] - wm.size[0] - padding
                y = img.size[1] - wm.size[1] - padding
            elif pos == "Bottom-Left":
                x = padding
                y = img.size[1] - wm.size[1] - padding
            elif pos == "Top-Right":
                x = img.size[0] - wm.size[0] - padding
                y = padding
            elif pos == "Top-Left":
                x = padding
                y = padding
            else: # Center
                x = (img.size[0] - wm.size[0]) // 2
                y = (img.size[1] - wm.size[1]) // 2
                
            img.paste(wm, (x, y), wm)

        # 4. Convert Format & Save
        target_ext = ext
        if self.use_convert.get():
            fmt = self.format_var.get()
            if fmt == "JPEG":
                img = img.convert("RGB")
                target_ext = ".jpg"
            elif fmt == "WEBP":
                target_ext = ".webp"
            elif fmt == "PNG":
                target_ext = ".png"
        else:
            # If original was jpg, but we did bg removal (requires transparency), force PNG
            if self.use_bg_remove.get() and self.bg_type.get() == "transparent" and ext.lower() in [".jpg", ".jpeg"]:
                target_ext = ".png"
                
        out_path = os.path.join(self.output_dir, f"{name}_edited{target_ext}")
        
        save_format = target_ext.replace(".", "").upper()
        if save_format == "JPG": save_format = "JPEG"
        
        img.save(out_path, format=save_format)

if __name__ == "__main__":
    app = BulkImageStudio()
    app.mainloop()
