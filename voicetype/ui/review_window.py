"""
Review window - Shows original transcript and improved version side by side
Allows user to edit, regenerate with different styles, and accept/paste
"""
import objc
from AppKit import (
    NSWindow, NSView, NSColor, NSMakeRect, NSScreen, NSTextField,
    NSButton, NSFont, NSScrollView, NSTextView,
    NSWindowStyleMaskBorderless,
    NSBackingStoreBuffered, NSFloatingWindowLevel, NSApp
)
from Foundation import NSObject

_review_window = None
_current_transcript = ""
_current_refined = ""
_current_style = "Clean"
_accept_callback = None


class DraggableView(NSView):
    """Custom view that handles drag and click events"""

    def init(self):
        self = objc.super(DraggableView, self).init()
        if self:
            self.controller = None
            self.mouse_down_point = None
            self.window_origin = None
            self.did_drag = False
        return self

    def mouseDown_(self, event):
        """Track mouse down for drag detection"""
        self.mouse_down_point = event.locationInWindow()
        self.window_origin = self.window().frame().origin
        self.did_drag = False

    def mouseDragged_(self, event):
        """Handle dragging the window"""
        if self.mouse_down_point is None:
            return

        self.did_drag = True
        current_location = event.locationInWindow()
        dx = current_location.x - self.mouse_down_point.x
        dy = current_location.y - self.mouse_down_point.y

        new_origin = (
            self.window_origin.x + dx,
            self.window_origin.y + dy
        )
        self.window().setFrameOrigin_(new_origin)

    def mouseUp_(self, event):
        """Handle mouse up - close if clicked without dragging"""
        if not self.did_drag and self.controller:
            # Click without drag = close the window
            self.controller.autoClose_(None)

        self.mouse_down_point = None
        self.window_origin = None
        self.did_drag = False


class ReviewWindowController(NSObject):
    """Controller for the review window"""

    def init(self):
        self = objc.super(ReviewWindowController, self).init()
        if self:
            self.window = None
            self.original_textview = None
            self.refined_textview = None
            self.style_buttons = {}
            self.is_editing = False
            self.mouse_down_point = None
            self.window_origin = None
            self.did_drag = False
            self._create_window()
        return self

    def _create_window(self):
        screen = NSScreen.mainScreen()
        screen_frame = screen.frame()

        # Larger window to show full text
        width = 580
        height = 120
        x = (screen_frame.size.width - width) / 2
        y = 150  # Near bottom of screen

        style = NSWindowStyleMaskBorderless  # No title bar

        self.window = NSWindow.alloc().initWithContentRect_styleMask_backing_defer_(
            NSMakeRect(x, y, width, height),
            style,
            NSBackingStoreBuffered,
            False
        )

        self.window.setLevel_(NSFloatingWindowLevel)
        self.window.setOpaque_(False)
        self.window.setBackgroundColor_(NSColor.clearColor())
        self.window.setHasShadow_(True)

        # Create draggable background view - BLACK with rounded corners
        content = self.window.contentView()
        bg_view = DraggableView.alloc().initWithFrame_(NSMakeRect(0, 0, width, height))
        bg_view.controller = self  # Link back to controller for close action
        bg_view.setWantsLayer_(True)
        bg_view.layer().setBackgroundColor_(NSColor.blackColor().CGColor())
        bg_view.layer().setCornerRadius_(15)
        content.addSubview_(bg_view)

        padding = 15
        btn_h = 28

        # Hidden original text (for reference)
        self.original_textview = NSTextField.alloc().initWithFrame_(NSMakeRect(-1000, 0, 1, 1))
        self.original_textview.setStringValue_("")
        bg_view.addSubview_(self.original_textview)

        # Large text display area at top - use NSScrollView with NSTextView for scrolling
        text_width = width - (padding * 2)
        text_height = 55

        # Create scroll view
        scroll_view = NSScrollView.alloc().initWithFrame_(
            NSMakeRect(padding, height - padding - text_height, text_width, text_height)
        )
        scroll_view.setHasVerticalScroller_(True)
        scroll_view.setHasHorizontalScroller_(False)
        scroll_view.setAutohidesScrollers_(True)
        scroll_view.setBorderType_(0)  # No border
        scroll_view.setBackgroundColor_(NSColor.colorWithCalibratedRed_green_blue_alpha_(0.2, 0.2, 0.22, 1.0))

        # Create text view inside scroll view
        self.refined_textview = NSTextView.alloc().initWithFrame_(
            NSMakeRect(0, 0, text_width, text_height)
        )
        self.refined_textview.setString_("")
        self.refined_textview.setFont_(NSFont.systemFontOfSize_(13))
        self.refined_textview.setTextColor_(NSColor.whiteColor())
        self.refined_textview.setBackgroundColor_(NSColor.colorWithCalibratedRed_green_blue_alpha_(0.2, 0.2, 0.22, 1.0))
        self.refined_textview.setEditable_(False)
        self.refined_textview.setSelectable_(True)

        scroll_view.setDocumentView_(self.refined_textview)
        bg_view.addSubview_(scroll_view)

        # Bottom row with buttons
        btn_y = 12

        # ✗ Red close button - left side
        close_btn = NSButton.alloc().initWithFrame_(NSMakeRect(padding, btn_y, 32, btn_h))
        close_btn.setTitle_("✗")
        close_btn.setBezelStyle_(1)
        close_btn.setFont_(NSFont.boldSystemFontOfSize_(16))
        close_btn.setTarget_(self)
        close_btn.setAction_(objc.selector(self.onCancel_, signature=b"v@:@"))
        close_btn.setToolTip_("Reject suggestion")
        close_btn.setContentTintColor_(NSColor.systemRedColor())
        bg_view.addSubview_(close_btn)

        # Style buttons in the middle
        btn_x = padding + 45
        styles = [
            ("Clean", "Clean", "Clean - Fix grammar & punctuation"),
            ("Format", "Format", "Format - Professional structure"),
            ("Email", "Email", "Email - Professional email format"),
            ("Code", "Code", "Code - Format as code comments"),
            ("Notes", "Notes", "Notes - Bullet points")
        ]

        for i, (style_key, style_label, tooltip) in enumerate(styles):
            btn = NSButton.alloc().initWithFrame_(NSMakeRect(btn_x + (i * 65), btn_y, 60, btn_h))
            btn.setTitle_(style_label)
            btn.setBezelStyle_(1)
            btn.setFont_(NSFont.systemFontOfSize_(11))
            btn.setTarget_(self)
            btn.setAction_(objc.selector(self.onStyleChange_, signature=b"v@:@"))
            btn.setTag_(hash(style_key))
            btn.setToolTip_(tooltip)
            self.style_buttons[style_key] = btn
            bg_view.addSubview_(btn)

        # 📋 Copy button - before accept
        copy_btn = NSButton.alloc().initWithFrame_(NSMakeRect(width - padding - 70, btn_y, 32, btn_h))
        copy_btn.setTitle_("📋")
        copy_btn.setBezelStyle_(1)
        copy_btn.setFont_(NSFont.systemFontOfSize_(14))
        copy_btn.setTarget_(self)
        copy_btn.setAction_(objc.selector(self.onCopy_, signature=b"v@:@"))
        copy_btn.setToolTip_("Copy to clipboard")
        bg_view.addSubview_(copy_btn)

        # ✓ Green accept button - right side
        accept_btn = NSButton.alloc().initWithFrame_(NSMakeRect(width - padding - 32, btn_y, 32, btn_h))
        accept_btn.setTitle_("✓")
        accept_btn.setBezelStyle_(1)
        accept_btn.setFont_(NSFont.boldSystemFontOfSize_(16))
        accept_btn.setKeyEquivalent_("\r")
        accept_btn.setTarget_(self)
        accept_btn.setAction_(objc.selector(self.onAccept_, signature=b"v@:@"))
        accept_btn.setToolTip_("Accept and replace (Enter)")
        accept_btn.setContentTintColor_(NSColor.systemGreenColor())
        bg_view.addSubview_(accept_btn)

        # Update button states
        self._updateStyleButtons()

    def _updateStyleButtons(self):
        """Update button appearance based on current style"""
        global _current_style
        for style_key, btn in self.style_buttons.items():
            if style_key == _current_style:
                # Selected style - blue tint to show it's active
                btn.setContentTintColor_(NSColor.systemBlueColor())
                btn.setBezelStyle_(4)  # Rounded rect
            else:
                # Unselected - gray/white
                btn.setContentTintColor_(NSColor.labelColor())
                btn.setBezelStyle_(1)  # Regular rounded

    def onStyleChange_(self, sender):
        """Handle style button click"""
        global _current_style, _current_transcript

        # Cancel auto-close since user is interacting
        self._cancelAutoClose()

        # Find which button was clicked
        for style_key, btn in self.style_buttons.items():
            if sender == btn:
                _current_style = style_key
                break

        self._updateStyleButtons()

        # Show loading state
        self.refined_textview.setString_("⏳ Formatting...")

        # Regenerate with new style in background thread
        if _current_transcript:
            import threading
            def regenerate():
                self._regenerate_with_style(_current_transcript, _current_style)
            threading.Thread(target=regenerate, daemon=True).start()

    @objc.python_method
    def _regenerate_with_style(self, text, style):
        """Regenerate the refined text with a new style"""
        global _current_refined

        # Call the AI enhancer
        try:
            from voicetype.settings import load_config
            from voicetype.ai_enhancer import AIEnhancer

            config = load_config()
            enhancer = AIEnhancer(config["api_key"])

            # Style is already the mode name (Clean, Format, Email, Notes)
            mode = style

            refined = enhancer.enhance(text, mode=mode)
            _current_refined = refined

            # Update UI on main thread
            from AppKit import NSOperationQueue
            def update_ui():
                self.refined_textview.setString_(refined)
            NSOperationQueue.mainQueue().addOperationWithBlock_(update_ui)
        except Exception as e:
            print(f"Error regenerating: {e}")
            # Show error on main thread
            from AppKit import NSOperationQueue
            def show_error():
                self.refined_textview.setString_(f"Error: {e}")
            NSOperationQueue.mainQueue().addOperationWithBlock_(show_error)

    def onCopy_(self, sender):
        """Handle copy button - copy refined text to clipboard"""
        global _current_refined
        import pyperclip
        import rumps

        self._cancelAutoClose()

        # Copy refined text to clipboard
        pyperclip.copy(_current_refined)
        print(f"Copied to clipboard: {_current_refined[:50]}...")

        # Show notification
        rumps.notification("Codiris Voice", "Copied!", "Text copied to clipboard")

    def onCancel_(self, sender):
        """Handle cancel button - just close, keep original text"""
        self._cancelAutoClose()
        self.window.orderOut_(None)
        print(f"Cancelled - keeping original text")

    def onAccept_(self, sender):
        """Handle accept button - replace original with refined text"""
        global _accept_callback, _current_refined, _current_style
        import time
        import subprocess
        import pyperclip

        # Cancel auto-close
        self._cancelAutoClose()

        print(f"=== ACCEPT CLICKED ===")

        # Get the full refined text
        final_text = _current_refined
        print(f"Final text to paste: {final_text}")

        # Copy refined text to clipboard
        pyperclip.copy(final_text)
        print(f"Copied to clipboard")

        # Close window
        self.window.orderOut_(None)

        # Wait for focus to return to previous app
        time.sleep(0.3)

        # Select all (Cmd+A) then paste (Cmd+V) to replace original with refined
        try:
            # Cmd+A to select original text
            subprocess.run([
                'osascript', '-e',
                'tell application "System Events" to keystroke "a" using command down'
            ], check=True, capture_output=True)
            time.sleep(0.1)

            # Cmd+V to paste refined text (replaces selection)
            subprocess.run([
                'osascript', '-e',
                'tell application "System Events" to keystroke "v" using command down'
            ], check=True, capture_output=True)
            print(f"Replaced with refined text")
        except Exception as e:
            print(f"Replace failed: {e}")
            import rumps
            rumps.notification("Codiris Voice", "Copied!", "Select text and press Cmd+V to replace")

        # Add to history with style tag
        try:
            from voicetype.ui.web_ui import add_to_history
            style_label = f"[{_current_style.upper()}] "
            add_to_history(style_label + final_text)
            print(f"Added to history: {style_label}{final_text[:30]}...")
        except Exception as e:
            print(f"Error adding to history: {e}")

        print(f"=== ACCEPT DONE ===")

    @objc.python_method
    def showReviewWindow(self, original_text, refined_text, style):
        """Show the window with the given texts - called from Python only"""
        global _current_transcript, _current_refined, _current_style, _accept_callback

        print(f"=== SUGGESTION BUBBLE SHOW ===")
        print(f"Original: {original_text}")
        print(f"Improved: {refined_text}")

        # Reset interaction flag for new suggestion
        self._user_interacted = False

        _current_transcript = original_text
        _current_refined = refined_text
        _current_style = style

        # Just show the suggestion bubble - text already pasted by main.py
        self.original_textview.setStringValue_(original_text)
        # Show full text in larger window
        self.refined_textview.setString_(refined_text)
        self._updateStyleButtons()

        # Show window as a bubble above everything
        from AppKit import NSFloatingWindowLevel
        self.window.setLevel_(NSFloatingWindowLevel + 100)
        self.window.makeKeyAndOrderFront_(None)
        self.window.orderFrontRegardless()
        # Don't center - keep it at bottom position
        NSApp.activateIgnoringOtherApps_(True)

        print(f"Bubble shown with suggestion: {refined_text[:50]}")

        # No auto-close - window stays until user clicks Accept or Cancel

        print(f"=== END REVIEW WINDOW SHOW ===")

    def autoPaste_(self, timer):
        """Automatically paste the improved text after delay"""
        print(f"=== AUTO-PASTE TRIGGERED ===")
        self.onAccept_(None)

    def autoClose_(self, timer):
        """Auto-close the bubble after showing suggestion - only if not interacted"""
        if hasattr(self, '_user_interacted') and self._user_interacted:
            print(f"=== AUTO-CLOSE SKIPPED (user interacted) ===")
            return
        print(f"=== AUTO-CLOSING BUBBLE ===")
        self.window.orderOut_(None)

    def _cancelAutoClose(self):
        """Cancel the auto-close timer when user interacts"""
        self._user_interacted = True
        if hasattr(self, 'auto_close_timer') and self.auto_close_timer:
            self.auto_close_timer.invalidate()
            self.auto_close_timer = None
            print(f"Auto-close timer cancelled")

    @objc.python_method
    def hideReviewWindow(self):
        """Hide the window - called from Python only"""
        if self.window:
            self.window.orderOut_(None)


def get_review_window():
    """Get or create the review window"""
    global _review_window
    if _review_window is None:
        _review_window = ReviewWindowController.alloc().init()
    return _review_window


def show_review(original_text, refined_text, style="professional", on_accept=None):
    """Show the review window with original and refined text"""
    global _accept_callback
    _accept_callback = on_accept

    window = get_review_window()
    window.showReviewWindow(original_text, refined_text, style)


def hide_review():
    """Hide the review window"""
    window = get_review_window()
    window.hideReviewWindow()
