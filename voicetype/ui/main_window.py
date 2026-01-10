import tkinter as tk
from tkinter import ttk, scrolledtext
from PIL import Image, ImageTk
import os
from datetime import datetime

class CodirisVoiceWindow:
    def __init__(self, on_close=None):
        self.root = tk.Tk()
        self.root.title("Codiris Voice")
        self.root.geometry("600x700")
        self.root.configure(bg="#2f0df4")
        self.on_close = on_close

        # History storage
        self.history = []

        # Make window appear on top
        self.root.lift()
        self.root.attributes("-topmost", True)
        self.root.after(100, lambda: self.root.attributes("-topmost", False))

        self.setup_ui()

    def setup_ui(self):
        # Main container
        main_frame = tk.Frame(self.root, bg="#2f0df4")
        main_frame.pack(fill=tk.BOTH, expand=True, padx=30, pady=20)

        # Logo and Title
        title_frame = tk.Frame(main_frame, bg="#2f0df4")
        title_frame.pack(fill=tk.X, pady=(0, 20))

        # Load logo
        try:
            logo_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "codiris_logo.svg.png")
            if not os.path.exists(logo_path):
                logo_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "icon_idle.png")
            if os.path.exists(logo_path):
                logo_img = Image.open(logo_path).resize((60, 60), Image.LANCZOS)
                self.logo_photo = ImageTk.PhotoImage(logo_img)
                logo_label = tk.Label(title_frame, image=self.logo_photo, bg="#2f0df4")
                logo_label.pack(side=tk.LEFT)
        except:
            pass

        title_label = tk.Label(
            title_frame,
            text="Codiris Voice",
            font=("Helvetica", 28, "bold"),
            fg="white",
            bg="#2f0df4"
        )
        title_label.pack(side=tk.LEFT, padx=15)

        subtitle = tk.Label(
            main_frame,
            text="Write faster in every app using your voice",
            font=("Helvetica", 14),
            fg="#ccccff",
            bg="#2f0df4"
        )
        subtitle.pack(pady=(0, 30))

        # How to use section
        how_to_frame = tk.Frame(main_frame, bg="white", relief=tk.FLAT)
        how_to_frame.pack(fill=tk.X, pady=10)

        # Add rounded corners effect with padding
        inner_frame = tk.Frame(how_to_frame, bg="white", padx=25, pady=20)
        inner_frame.pack(fill=tk.BOTH, expand=True)

        how_title = tk.Label(
            inner_frame,
            text="How to Use",
            font=("Helvetica", 18, "bold"),
            fg="#2f0df4",
            bg="white"
        )
        how_title.pack(anchor=tk.W, pady=(0, 15))

        steps = [
            ("1", "Hold Right Option Key", "Press and hold the Right Option (⌥) key on your keyboard"),
            ("2", "Speak", "Say what you want to type while holding the key"),
            ("3", "Release", "Release the key - your speech will be transcribed and typed"),
        ]

        for num, title, desc in steps:
            step_frame = tk.Frame(inner_frame, bg="white")
            step_frame.pack(fill=tk.X, pady=8)

            # Number circle
            num_label = tk.Label(
                step_frame,
                text=num,
                font=("Helvetica", 14, "bold"),
                fg="white",
                bg="#2f0df4",
                width=3,
                height=1
            )
            num_label.pack(side=tk.LEFT, padx=(0, 15))

            text_frame = tk.Frame(step_frame, bg="white")
            text_frame.pack(side=tk.LEFT, fill=tk.X, expand=True)

            step_title = tk.Label(
                text_frame,
                text=title,
                font=("Helvetica", 13, "bold"),
                fg="#333333",
                bg="white",
                anchor=tk.W
            )
            step_title.pack(anchor=tk.W)

            step_desc = tk.Label(
                text_frame,
                text=desc,
                font=("Helvetica", 11),
                fg="#666666",
                bg="white",
                anchor=tk.W
            )
            step_desc.pack(anchor=tk.W)

        # Voice Commands section
        commands_frame = tk.Frame(main_frame, bg="white", relief=tk.FLAT)
        commands_frame.pack(fill=tk.X, pady=15)

        commands_inner = tk.Frame(commands_frame, bg="white", padx=25, pady=20)
        commands_inner.pack(fill=tk.BOTH, expand=True)

        cmd_title = tk.Label(
            commands_inner,
            text="Voice Commands",
            font=("Helvetica", 16, "bold"),
            fg="#2f0df4",
            bg="white"
        )
        cmd_title.pack(anchor=tk.W, pady=(0, 10))

        commands = [
            ('"new line"', "Insert a new line"),
            ('"new paragraph"', "Insert two new lines"),
            ('"delete that"', "Delete last transcription"),
            ('"period" / "comma"', "Insert punctuation"),
        ]

        for cmd, desc in commands:
            cmd_frame = tk.Frame(commands_inner, bg="white")
            cmd_frame.pack(fill=tk.X, pady=3)

            cmd_label = tk.Label(
                cmd_frame,
                text=cmd,
                font=("Courier", 11, "bold"),
                fg="#2f0df4",
                bg="#f0f0ff",
                padx=8,
                pady=2
            )
            cmd_label.pack(side=tk.LEFT)

            desc_label = tk.Label(
                cmd_frame,
                text=f"  →  {desc}",
                font=("Helvetica", 11),
                fg="#666666",
                bg="white"
            )
            desc_label.pack(side=tk.LEFT)

        # History section
        history_frame = tk.Frame(main_frame, bg="white", relief=tk.FLAT)
        history_frame.pack(fill=tk.BOTH, expand=True, pady=15)

        history_inner = tk.Frame(history_frame, bg="white", padx=25, pady=20)
        history_inner.pack(fill=tk.BOTH, expand=True)

        hist_title = tk.Label(
            history_inner,
            text="Transcription History",
            font=("Helvetica", 16, "bold"),
            fg="#2f0df4",
            bg="white"
        )
        hist_title.pack(anchor=tk.W, pady=(0, 10))

        self.history_text = scrolledtext.ScrolledText(
            history_inner,
            font=("Helvetica", 11),
            fg="#333333",
            bg="#f8f8ff",
            height=6,
            wrap=tk.WORD,
            relief=tk.FLAT,
            padx=10,
            pady=10
        )
        self.history_text.pack(fill=tk.BOTH, expand=True)
        self.history_text.insert(tk.END, "Your transcriptions will appear here...\n")
        self.history_text.config(state=tk.DISABLED)

        # Status bar
        self.status_var = tk.StringVar(value="Ready - Hold Right Option key to start")
        status_bar = tk.Label(
            main_frame,
            textvariable=self.status_var,
            font=("Helvetica", 12),
            fg="white",
            bg="#2f0df4",
            pady=10
        )
        status_bar.pack(fill=tk.X, pady=(10, 0))

        # Handle window close
        self.root.protocol("WM_DELETE_WINDOW", self.on_window_close)

    def add_to_history(self, text):
        """Add a transcription to history"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.history.append((timestamp, text))

        self.history_text.config(state=tk.NORMAL)
        if "Your transcriptions will appear here" in self.history_text.get("1.0", tk.END):
            self.history_text.delete("1.0", tk.END)

        self.history_text.insert(tk.END, f"[{timestamp}] {text}\n")
        self.history_text.see(tk.END)
        self.history_text.config(state=tk.DISABLED)

    def set_status(self, status):
        """Update status bar"""
        self.status_var.set(status)
        self.root.update()

    def on_window_close(self):
        """Handle window close - just hide, don't quit app"""
        self.root.withdraw()
        if self.on_close:
            self.on_close()

    def show(self):
        """Show the window"""
        self.root.deiconify()
        self.root.lift()

    def hide(self):
        """Hide the window"""
        self.root.withdraw()

    def run(self):
        """Start the main loop"""
        self.root.mainloop()

    def update(self):
        """Update the window (for use in integration)"""
        try:
            self.root.update()
        except:
            pass


def show_window():
    """Standalone function to show the window"""
    window = CodirisVoiceWindow()
    window.run()


if __name__ == "__main__":
    show_window()
