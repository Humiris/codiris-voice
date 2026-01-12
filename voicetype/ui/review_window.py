"""
Review window - Shows original transcript and improved version side by side
Allows user to edit, regenerate with different styles, and accept/paste
"""
import objc
from AppKit import (
    NSWindow, NSView, NSColor, NSMakeRect, NSScreen, NSTextField,
    NSButton, NSFont,
    NSWindowStyleMaskBorderless,
    NSBackingStoreBuffered, NSFloatingWindowLevel, NSApp
)
from Foundation import NSObject

_review_window = None
_current_transcript = ""
_current_refined = ""
_current_style = "professional"
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

        # Compact horizontal bar - all in one line
        width = 580
        height = 40
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
        bg_view.layer().setCornerRadius_(20)
        content.addSubview_(bg_view)

        # All in ONE horizontal line: [X] [Improved text] [Pro] [Cas] [Brf] [Accept]
        padding = 10
        btn_y = 8
        btn_h = 24

        # X close button - left side
        close_btn = NSButton.alloc().initWithFrame_(NSMakeRect(padding, btn_y, 24, btn_h))
        close_btn.setTitle_("×")
        close_btn.setBezelStyle_(1)
        close_btn.setFont_(NSFont.systemFontOfSize_(14))
        close_btn.setTarget_(self)
        close_btn.setAction_(objc.selector(self.onCancel_, signature=b"v@:@"))
        close_btn.setToolTip_("Close this suggestion")
        bg_view.addSubview_(close_btn)

        # Hidden original text (for reference)
        self.original_textview = NSTextField.alloc().initWithFrame_(NSMakeRect(-1000, 0, 1, 1))
        self.original_textview.setStringValue_("")
        bg_view.addSubview_(self.original_textview)

        # Improved text button - clickable to accept
        self.refined_textview = NSButton.alloc().initWithFrame_(NSMakeRect(padding + 30, btn_y, 280, btn_h))
        self.refined_textview.setTitle_("")
        self.refined_textview.setFont_(NSFont.systemFontOfSize_(11))
        self.refined_textview.setBezelStyle_(1)
        self.refined_textview.setTarget_(self)
        self.refined_textview.setAction_(objc.selector(self.onAccept_, signature=b"v@:@"))
        self.refined_textview.setToolTip_("Click to use this improved text")
        bg_view.addSubview_(self.refined_textview)

        # Style buttons - compact with tooltips
        btn_x = padding + 320
        styles = [
            ("professional", "Pro", "Professional - Formal formatting"),
            ("casual", "Cas", "Casual - Friendly, relaxed tone"),
            ("concise", "Brf", "Brief - Short and to the point")
        ]

        for i, (style_key, style_label, tooltip) in enumerate(styles):
            btn = NSButton.alloc().initWithFrame_(NSMakeRect(btn_x + (i * 42), btn_y, 38, btn_h))
            btn.setTitle_(style_label)
            btn.setBezelStyle_(1)
            btn.setFont_(NSFont.systemFontOfSize_(10))
            btn.setTarget_(self)
            btn.setAction_(objc.selector(self.onStyleChange_, signature=b"v@:@"))
            btn.setTag_(hash(style_key))
            btn.setToolTip_(tooltip)
            self.style_buttons[style_key] = btn
            bg_view.addSubview_(btn)

        # Accept button - green
        accept_btn = NSButton.alloc().initWithFrame_(NSMakeRect(btn_x + 130, btn_y, 55, btn_h))
        accept_btn.setTitle_("Accept")
        accept_btn.setBezelStyle_(1)
        accept_btn.setFont_(NSFont.systemFontOfSize_(10))
        accept_btn.setKeyEquivalent_("\r")
        accept_btn.setTarget_(self)
        accept_btn.setAction_(objc.selector(self.onAccept_, signature=b"v@:@"))
        accept_btn.setToolTip_("Replace with improved text (Enter)")
        bg_view.addSubview_(accept_btn)

        # Update button states
        self._updateStyleButtons()

    def _updateStyleButtons(self):
        """Update button appearance based on current style"""
        global _current_style
        for style_key, btn in self.style_buttons.items():
            if style_key == _current_style:
                # Selected style - make it stand out
                btn.setBezelStyle_(4)  # Rounded rect
            else:
                btn.setBezelStyle_(1)  # Regular rounded

    def onStyleChange_(self, sender):
        """Handle style button click"""
        global _current_style, _current_transcript

        # Find which button was clicked
        for style_key, btn in self.style_buttons.items():
            if sender == btn:
                _current_style = style_key
                break

        self._updateStyleButtons()

        # Regenerate with new style
        if _current_transcript:
            self._regenerate_with_style(_current_transcript, _current_style)

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

            # Map style names to modes
            style_map = {
                "professional": "Format",
                "casual": "Clean",
                "concise": "Notes"
            }
            mode = style_map.get(style, "Format")

            refined = enhancer.enhance(text, mode=mode)
            _current_refined = refined
            self.refined_textview.setTitle_(refined)  # NSButton uses setTitle_
        except Exception as e:
            print(f"Error regenerating: {e}")

    def onCancel_(self, sender):
        """Handle cancel button"""
        self.window.orderOut_(None)

    def onAccept_(self, sender):
        """Handle accept button - paste the refined text"""
        global _accept_callback

        print(f"=== ACCEPT CLICKED ===")

        # Get the final text from button title
        final_text = self.refined_textview.title()
        print(f"Final text to paste: {final_text}")

        # Call the callback
        if _accept_callback:
            print(f"Calling accept callback...")
            _accept_callback(final_text)
            print(f"Callback completed")
        else:
            print(f"ERROR: No accept callback registered!")

        # Close window
        self.window.orderOut_(None)
        print(f"=== ACCEPT DONE ===")

    @objc.python_method
    def showReviewWindow(self, original_text, refined_text, style):
        """Show the window with the given texts - called from Python only"""
        global _current_transcript, _current_refined, _current_style, _accept_callback

        print(f"=== SUGGESTION BUBBLE SHOW ===")
        print(f"Original: {original_text}")
        print(f"Improved: {refined_text}")

        _current_transcript = original_text
        _current_refined = refined_text
        _current_style = style

        # Just show the suggestion bubble - text already pasted by main.py
        self.original_textview.setStringValue_(original_text)
        # Show shorter text in compact bar
        display_text = refined_text[:50] + "..." if len(refined_text) > 50 else refined_text
        self.refined_textview.setTitle_(display_text)
        self._updateStyleButtons()

        # Show window as a bubble above everything
        from AppKit import NSFloatingWindowLevel
        self.window.setLevel_(NSFloatingWindowLevel + 100)
        self.window.makeKeyAndOrderFront_(None)
        self.window.orderFrontRegardless()
        # Don't center - keep it at bottom position
        NSApp.activateIgnoringOtherApps_(True)

        print(f"Bubble shown with suggestion: {refined_text[:50]}")

        # Auto-close bubble after 10 seconds
        from AppKit import NSTimer
        self.auto_close_timer = NSTimer.scheduledTimerWithTimeInterval_target_selector_userInfo_repeats_(
            10.0,  # 10 seconds
            self,
            objc.selector(self.autoClose_, signature=b"v@:@"),
            None,
            False
        )

        print(f"=== END REVIEW WINDOW SHOW ===")

    def autoPaste_(self, timer):
        """Automatically paste the improved text after delay"""
        print(f"=== AUTO-PASTE TRIGGERED ===")
        self.onAccept_(None)

    def autoClose_(self, timer):
        """Auto-close the bubble after showing suggestion"""
        print(f"=== AUTO-CLOSING BUBBLE ===")
        self.window.orderOut_(None)

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
