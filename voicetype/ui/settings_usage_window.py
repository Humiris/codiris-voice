"""
Settings and Usage window - Shows user settings, usage statistics, and customization options
"""
import objc
from AppKit import (
    NSWindow, NSView, NSColor, NSMakeRect, NSScreen, NSTextField, NSTextView,
    NSButton, NSFont, NSScrollView, NSBox, NSColorWell, NSSlider,
    NSWindowStyleMaskTitled, NSWindowStyleMaskClosable, NSWindowStyleMaskResizable,
    NSBackingStoreBuffered, NSFloatingWindowLevel, NSApp, NSTabView, NSTabViewItem
)
from Foundation import NSObject, NSMakeSize
import time
from datetime import datetime

_settings_window = None


class SettingsUsageWindowController(NSObject):
    """Controller for settings and usage window"""

    def init(self):
        self = objc.super(SettingsUsageWindowController, self).init()
        if self:
            self.window = None
            self.tab_view = None
            self.name_field = None
            self.picture_field = None
            self.affiliate_link_field = None
            self.color_well = None
            self.position_slider = None
            self.wrong_word_field = None
            self.correct_word_field = None
            self.words_list_view = None
            self._create_window()
        return self

    def _create_window(self):
        screen = NSScreen.mainScreen()
        screen_frame = screen.frame()

        width = 700
        height = 600
        x = (screen_frame.size.width - width) / 2
        y = (screen_frame.size.height - height) / 2

        style = (NSWindowStyleMaskTitled | NSWindowStyleMaskClosable | NSWindowStyleMaskResizable)

        self.window = NSWindow.alloc().initWithContentRect_styleMask_backing_defer_(
            NSMakeRect(x, y, width, height),
            style,
            NSBackingStoreBuffered,
            False
        )

        self.window.setTitle_("Settings & Usage")
        self.window.setMinSize_(NSMakeSize(600, 500))
        self.window.setBackgroundColor_(NSColor.whiteColor())

        content = self.window.contentView()

        # Create tab view
        self.tab_view = NSTabView.alloc().initWithFrame_(NSMakeRect(20, 20, width - 40, height - 40))

        # Usage Tab
        usage_tab = NSTabViewItem.alloc().initWithIdentifier_("usage")
        usage_tab.setLabel_("Usage")
        usage_view = self._create_usage_view(width - 40, height - 80)
        usage_tab.setView_(usage_view)
        self.tab_view.addTabViewItem_(usage_tab)

        # Settings Tab
        settings_tab = NSTabViewItem.alloc().initWithIdentifier_("settings")
        settings_tab.setLabel_("Settings")
        settings_view = self._create_settings_view(width - 40, height - 80)
        settings_tab.setView_(settings_view)
        self.tab_view.addTabViewItem_(settings_tab)

        # Customization Tab
        custom_tab = NSTabViewItem.alloc().initWithIdentifier_("customization")
        custom_tab.setLabel_("Customization")
        custom_view = self._create_customization_view(width - 40, height - 80)
        custom_tab.setView_(custom_view)
        self.tab_view.addTabViewItem_(custom_tab)

        # Word Training Tab
        training_tab = NSTabViewItem.alloc().initWithIdentifier_("training")
        training_tab.setLabel_("Word Training")
        training_view = self._create_training_view(width - 40, height - 80)
        training_tab.setView_(training_view)
        self.tab_view.addTabViewItem_(training_tab)

        content.addSubview_(self.tab_view)

    def _create_usage_view(self, width, height):
        """Create the usage statistics view"""
        view = NSView.alloc().initWithFrame_(NSMakeRect(0, 0, width, height))

        # Title
        title = NSTextField.alloc().initWithFrame_(NSMakeRect(20, height - 50, width - 40, 30))
        title.setStringValue_("Usage Statistics")
        title.setFont_(NSFont.boldSystemFontOfSize_(20))
        title.setBezeled_(False)
        title.setDrawsBackground_(False)
        title.setEditable_(False)
        title.setSelectable_(False)
        view.addSubview_(title)

        # Get usage stats
        from voicetype.settings import load_config
        config = load_config()
        usage_stats = config.get("usage_stats", {})

        # Stats cards
        y_pos = height - 120
        stats = [
            ("Total Characters", usage_stats.get("total_characters", 0), "characters transcribed"),
            ("API Requests", usage_stats.get("total_requests", 0), "Whisper + GPT calls"),
            ("Total Transcriptions", usage_stats.get("total_transcriptions", 0), "voice sessions"),
            ("This Month", usage_stats.get("month_transcriptions", 0), "transcriptions")
        ]

        for i, (label, value, desc) in enumerate(stats):
            x_pos = 20 if i % 2 == 0 else width // 2 + 10
            y = y_pos - (i // 2) * 120

            # Card background
            card = NSBox.alloc().initWithFrame_(NSMakeRect(x_pos, y, width // 2 - 30, 100))
            card.setBoxType_(3)  # Custom box
            card.setFillColor_(NSColor.colorWithCalibratedRed_green_blue_alpha_(0.98, 0.98, 1.0, 1.0))
            card.setBorderColor_(NSColor.colorWithCalibratedRed_green_blue_alpha_(0.9, 0.9, 0.95, 1.0))
            card.setBorderWidth_(1)
            card.setCornerRadius_(12)
            view.addSubview_(card)

            # Label
            label_field = NSTextField.alloc().initWithFrame_(NSMakeRect(x_pos + 15, y + 65, width // 2 - 60, 20))
            label_field.setStringValue_(label)
            label_field.setFont_(NSFont.systemFontOfSize_(11))
            label_field.setTextColor_(NSColor.grayColor())
            label_field.setBezeled_(False)
            label_field.setDrawsBackground_(False)
            label_field.setEditable_(False)
            label_field.setSelectable_(False)
            view.addSubview_(label_field)

            # Value
            value_field = NSTextField.alloc().initWithFrame_(NSMakeRect(x_pos + 15, y + 35, width // 2 - 60, 30))
            value_field.setStringValue_(str(value))
            value_field.setFont_(NSFont.boldSystemFontOfSize_(28))
            value_field.setBezeled_(False)
            value_field.setDrawsBackground_(False)
            value_field.setEditable_(False)
            value_field.setSelectable_(False)
            view.addSubview_(value_field)

            # Description
            desc_field = NSTextField.alloc().initWithFrame_(NSMakeRect(x_pos + 15, y + 15, width // 2 - 60, 15))
            desc_field.setStringValue_(desc)
            desc_field.setFont_(NSFont.systemFontOfSize_(10))
            desc_field.setTextColor_(NSColor.grayColor())
            desc_field.setBezeled_(False)
            desc_field.setDrawsBackground_(False)
            desc_field.setEditable_(False)
            desc_field.setSelectable_(False)
            view.addSubview_(desc_field)

        # Recent activity section
        activity_title = NSTextField.alloc().initWithFrame_(NSMakeRect(20, y_pos - 270, width - 40, 20))
        activity_title.setStringValue_("Recent Activity")
        activity_title.setFont_(NSFont.boldSystemFontOfSize_(14))
        activity_title.setBezeled_(False)
        activity_title.setDrawsBackground_(False)
        activity_title.setEditable_(False)
        activity_title.setSelectable_(False)
        view.addSubview_(activity_title)

        # Activity log (last 7 days)
        activity_text = NSTextField.alloc().initWithFrame_(NSMakeRect(20, 50, width - 40, 80))
        last_used = usage_stats.get("last_used", "Never")
        activity_text.setStringValue_(f"Last used: {last_used}\nAverage daily usage: {usage_stats.get('avg_daily', 0)} transcriptions")
        activity_text.setFont_(NSFont.systemFontOfSize_(12))
        activity_text.setTextColor_(NSColor.grayColor())
        activity_text.setBezeled_(False)
        activity_text.setDrawsBackground_(False)
        activity_text.setEditable_(False)
        activity_text.setSelectable_(False)
        view.addSubview_(activity_text)

        return view

    def _create_settings_view(self, width, height):
        """Create the settings view"""
        view = NSView.alloc().initWithFrame_(NSMakeRect(0, 0, width, height))

        from voicetype.settings import load_config
        config = load_config()
        user = config.get("user", {})

        # Title
        title = NSTextField.alloc().initWithFrame_(NSMakeRect(20, height - 50, width - 40, 30))
        title.setStringValue_("Account Settings")
        title.setFont_(NSFont.boldSystemFontOfSize_(20))
        title.setBezeled_(False)
        title.setDrawsBackground_(False)
        title.setEditable_(False)
        title.setSelectable_(False)
        view.addSubview_(title)

        y_pos = height - 100

        # Name field
        name_label = NSTextField.alloc().initWithFrame_(NSMakeRect(20, y_pos, 100, 20))
        name_label.setStringValue_("Your Name:")
        name_label.setFont_(NSFont.boldSystemFontOfSize_(12))
        name_label.setBezeled_(False)
        name_label.setDrawsBackground_(False)
        name_label.setEditable_(False)
        name_label.setSelectable_(False)
        view.addSubview_(name_label)

        self.name_field = NSTextField.alloc().initWithFrame_(NSMakeRect(130, y_pos - 2, width - 170, 24))
        self.name_field.setStringValue_(user.get("name", ""))
        self.name_field.setPlaceholderString_("Enter your name")
        view.addSubview_(self.name_field)

        # Save name button
        save_name_btn = NSButton.alloc().initWithFrame_(NSMakeRect(130, y_pos - 35, 120, 28))
        save_name_btn.setTitle_("Save Name")
        save_name_btn.setBezelStyle_(1)
        save_name_btn.setTarget_(self)
        save_name_btn.setAction_(objc.selector(self.onSaveName_, signature=b"v@:@"))
        view.addSubview_(save_name_btn)

        y_pos -= 80

        # Picture URL field
        picture_label = NSTextField.alloc().initWithFrame_(NSMakeRect(20, y_pos, 100, 20))
        picture_label.setStringValue_("Picture URL:")
        picture_label.setFont_(NSFont.boldSystemFontOfSize_(12))
        picture_label.setBezeled_(False)
        picture_label.setDrawsBackground_(False)
        picture_label.setEditable_(False)
        picture_label.setSelectable_(False)
        view.addSubview_(picture_label)

        self.picture_field = NSTextField.alloc().initWithFrame_(NSMakeRect(130, y_pos - 2, width - 170, 24))
        self.picture_field.setStringValue_(user.get("picture", ""))
        self.picture_field.setPlaceholderString_("Enter picture URL")
        view.addSubview_(self.picture_field)

        # Save picture button
        save_picture_btn = NSButton.alloc().initWithFrame_(NSMakeRect(130, y_pos - 35, 120, 28))
        save_picture_btn.setTitle_("Save Picture")
        save_picture_btn.setBezelStyle_(1)
        save_picture_btn.setTarget_(self)
        save_picture_btn.setAction_(objc.selector(self.onSavePicture_, signature=b"v@:@"))
        view.addSubview_(save_picture_btn)

        y_pos -= 90

        # Email (read-only)
        email_label = NSTextField.alloc().initWithFrame_(NSMakeRect(20, y_pos, 100, 20))
        email_label.setStringValue_("Email:")
        email_label.setFont_(NSFont.boldSystemFontOfSize_(12))
        email_label.setBezeled_(False)
        email_label.setDrawsBackground_(False)
        email_label.setEditable_(False)
        email_label.setSelectable_(False)
        view.addSubview_(email_label)

        email_field = NSTextField.alloc().initWithFrame_(NSMakeRect(130, y_pos, width - 170, 20))
        email_field.setStringValue_(user.get("email", "Not signed in"))
        email_field.setFont_(NSFont.systemFontOfSize_(12))
        email_field.setTextColor_(NSColor.grayColor())
        email_field.setBezeled_(False)
        email_field.setDrawsBackground_(False)
        email_field.setEditable_(False)
        email_field.setSelectable_(True)
        view.addSubview_(email_field)

        y_pos -= 60

        # Affiliate section
        affiliate_title = NSTextField.alloc().initWithFrame_(NSMakeRect(20, y_pos, width - 40, 20))
        affiliate_title.setStringValue_("Invite Friends & Earn Rewards")
        affiliate_title.setFont_(NSFont.boldSystemFontOfSize_(16))
        affiliate_title.setBezeled_(False)
        affiliate_title.setDrawsBackground_(False)
        affiliate_title.setEditable_(False)
        affiliate_title.setSelectable_(False)
        view.addSubview_(affiliate_title)

        y_pos -= 30

        affiliate_desc = NSTextField.alloc().initWithFrame_(NSMakeRect(20, y_pos, width - 40, 30))
        affiliate_desc.setStringValue_("Share your unique link with friends. Get premium features when they sign up!")
        affiliate_desc.setFont_(NSFont.systemFontOfSize_(11))
        affiliate_desc.setTextColor_(NSColor.grayColor())
        affiliate_desc.setBezeled_(False)
        affiliate_desc.setDrawsBackground_(False)
        affiliate_desc.setEditable_(False)
        affiliate_desc.setSelectable_(False)
        view.addSubview_(affiliate_desc)

        y_pos -= 50

        # Generate affiliate link
        user_id = user.get("email", "").split("@")[0] if user.get("email") else "demo"
        affiliate_link = f"https://codiris.com/voice?ref={user_id}"

        link_label = NSTextField.alloc().initWithFrame_(NSMakeRect(20, y_pos, 100, 20))
        link_label.setStringValue_("Your Link:")
        link_label.setFont_(NSFont.boldSystemFontOfSize_(12))
        link_label.setBezeled_(False)
        link_label.setDrawsBackground_(False)
        link_label.setEditable_(False)
        link_label.setSelectable_(False)
        view.addSubview_(link_label)

        self.affiliate_link_field = NSTextField.alloc().initWithFrame_(NSMakeRect(130, y_pos - 2, width - 290, 24))
        self.affiliate_link_field.setStringValue_(affiliate_link)
        self.affiliate_link_field.setEditable_(False)
        self.affiliate_link_field.setSelectable_(True)
        view.addSubview_(self.affiliate_link_field)

        # Copy link button
        copy_btn = NSButton.alloc().initWithFrame_(NSMakeRect(width - 140, y_pos - 2, 120, 28))
        copy_btn.setTitle_("Copy Link")
        copy_btn.setBezelStyle_(1)
        copy_btn.setTarget_(self)
        copy_btn.setAction_(objc.selector(self.onCopyLink_, signature=b"v@:@"))
        view.addSubview_(copy_btn)

        y_pos -= 50

        # Referrals count
        referrals = config.get("referrals", 0)
        referral_label = NSTextField.alloc().initWithFrame_(NSMakeRect(20, y_pos, width - 40, 20))
        referral_label.setStringValue_(f"Friends referred: {referrals}")
        referral_label.setFont_(NSFont.systemFontOfSize_(12))
        referral_label.setTextColor_(NSColor.grayColor())
        referral_label.setBezeled_(False)
        referral_label.setDrawsBackground_(False)
        referral_label.setEditable_(False)
        referral_label.setSelectable_(False)
        view.addSubview_(referral_label)

        return view

    def _create_customization_view(self, width, height):
        """Create the customization view for floating bar"""
        view = NSView.alloc().initWithFrame_(NSMakeRect(0, 0, width, height))

        from voicetype.settings import load_config
        config = load_config()

        # Title
        title = NSTextField.alloc().initWithFrame_(NSMakeRect(20, height - 50, width - 40, 30))
        title.setStringValue_("Floating Bar Customization")
        title.setFont_(NSFont.boldSystemFontOfSize_(20))
        title.setBezeled_(False)
        title.setDrawsBackground_(False)
        title.setEditable_(False)
        title.setSelectable_(False)
        view.addSubview_(title)

        y_pos = height - 100

        # Bar color
        color_label = NSTextField.alloc().initWithFrame_(NSMakeRect(20, y_pos, 150, 20))
        color_label.setStringValue_("Waveform Color:")
        color_label.setFont_(NSFont.boldSystemFontOfSize_(12))
        color_label.setBezeled_(False)
        color_label.setDrawsBackground_(False)
        color_label.setEditable_(False)
        color_label.setSelectable_(False)
        view.addSubview_(color_label)

        # Color well
        self.color_well = NSColorWell.alloc().initWithFrame_(NSMakeRect(180, y_pos - 5, 80, 30))
        bar_color = config.get("bar_color", "#FFFFFF")
        # Convert hex to NSColor
        color = self._hex_to_nscolor(bar_color)
        self.color_well.setColor_(color)
        self.color_well.setTarget_(self)
        self.color_well.setAction_(objc.selector(self.onColorChange_, signature=b"v@:@"))
        view.addSubview_(self.color_well)

        y_pos -= 60

        # Bar position
        position_label = NSTextField.alloc().initWithFrame_(NSMakeRect(20, y_pos, 150, 20))
        position_label.setStringValue_("Bar Position:")
        position_label.setFont_(NSFont.boldSystemFontOfSize_(12))
        position_label.setBezeled_(False)
        position_label.setDrawsBackground_(False)
        position_label.setEditable_(False)
        position_label.setSelectable_(False)
        view.addSubview_(position_label)

        # Position buttons
        position_top_btn = NSButton.alloc().initWithFrame_(NSMakeRect(180, y_pos - 2, 80, 28))
        position_top_btn.setTitle_("Top")
        position_top_btn.setBezelStyle_(1)
        position_top_btn.setTarget_(self)
        position_top_btn.setAction_(objc.selector(self.onPositionTop_, signature=b"v@:@"))
        view.addSubview_(position_top_btn)

        position_bottom_btn = NSButton.alloc().initWithFrame_(NSMakeRect(270, y_pos - 2, 80, 28))
        position_bottom_btn.setTitle_("Bottom")
        position_bottom_btn.setBezelStyle_(1)
        position_bottom_btn.setTarget_(self)
        position_bottom_btn.setAction_(objc.selector(self.onPositionBottom_, signature=b"v@:@"))
        view.addSubview_(position_bottom_btn)

        y_pos -= 60

        # Bar opacity
        opacity_label = NSTextField.alloc().initWithFrame_(NSMakeRect(20, y_pos, 150, 20))
        opacity_label.setStringValue_("Bar Opacity:")
        opacity_label.setFont_(NSFont.boldSystemFontOfSize_(12))
        opacity_label.setBezeled_(False)
        opacity_label.setDrawsBackground_(False)
        opacity_label.setEditable_(False)
        opacity_label.setSelectable_(False)
        view.addSubview_(opacity_label)

        # Opacity slider
        opacity_slider = NSSlider.alloc().initWithFrame_(NSMakeRect(180, y_pos - 5, 200, 25))
        opacity_slider.setMinValue_(0.3)
        opacity_slider.setMaxValue_(1.0)
        opacity_slider.setDoubleValue_(config.get("bar_opacity", 0.95))
        opacity_slider.setTarget_(self)
        opacity_slider.setAction_(objc.selector(self.onOpacityChange_, signature=b"v@:@"))
        view.addSubview_(opacity_slider)

        y_pos -= 60

        # Preview section
        preview_title = NSTextField.alloc().initWithFrame_(NSMakeRect(20, y_pos, width - 40, 20))
        preview_title.setStringValue_("Preview")
        preview_title.setFont_(NSFont.boldSystemFontOfSize_(14))
        preview_title.setBezeled_(False)
        preview_title.setDrawsBackground_(False)
        preview_title.setEditable_(False)
        preview_title.setSelectable_(False)
        view.addSubview_(preview_title)

        y_pos -= 100

        # Preview box
        preview_box = NSBox.alloc().initWithFrame_(NSMakeRect(20, y_pos, width - 40, 80))
        preview_box.setBoxType_(3)
        preview_box.setFillColor_(NSColor.colorWithCalibratedRed_green_blue_alpha_(0.95, 0.95, 0.95, 1.0))
        preview_box.setBorderColor_(NSColor.colorWithCalibratedRed_green_blue_alpha_(0.8, 0.8, 0.8, 1.0))
        preview_box.setBorderWidth_(1)
        preview_box.setCornerRadius_(12)
        preview_box.setTitlePosition_(0)  # No title
        view.addSubview_(preview_box)

        preview_text = NSTextField.alloc().initWithFrame_(NSMakeRect(40, y_pos + 25, width - 80, 30))
        preview_text.setStringValue_("Your customized floating bar will look like this")
        preview_text.setFont_(NSFont.systemFontOfSize_(11))
        preview_text.setTextColor_(NSColor.grayColor())
        preview_text.setBezeled_(False)
        preview_text.setDrawsBackground_(False)
        preview_text.setEditable_(False)
        preview_text.setSelectable_(False)
        preview_text.setAlignment_(1)  # Center
        view.addSubview_(preview_text)

        return view

    def _create_training_view(self, width, height):
        """Create the word training view"""
        view = NSView.alloc().initWithFrame_(NSMakeRect(0, 0, width, height))

        from voicetype.settings import load_config
        config = load_config()

        # Title
        title = NSTextField.alloc().initWithFrame_(NSMakeRect(20, height - 50, width - 40, 30))
        title.setStringValue_("Word Training")
        title.setFont_(NSFont.boldSystemFontOfSize_(20))
        title.setBezeled_(False)
        title.setDrawsBackground_(False)
        title.setEditable_(False)
        title.setSelectable_(False)
        view.addSubview_(title)

        # Description
        desc = NSTextField.alloc().initWithFrame_(NSMakeRect(20, height - 80, width - 40, 30))
        desc.setStringValue_("Train custom words so Codiris Voice recognizes them correctly")
        desc.setFont_(NSFont.systemFontOfSize_(12))
        desc.setTextColor_(NSColor.grayColor())
        desc.setBezeled_(False)
        desc.setDrawsBackground_(False)
        desc.setEditable_(False)
        desc.setSelectable_(False)
        view.addSubview_(desc)

        y_pos = height - 130

        # "Whisper hears" field
        wrong_label = NSTextField.alloc().initWithFrame_(NSMakeRect(20, y_pos, 120, 20))
        wrong_label.setStringValue_("Whisper hears:")
        wrong_label.setFont_(NSFont.boldSystemFontOfSize_(12))
        wrong_label.setBezeled_(False)
        wrong_label.setDrawsBackground_(False)
        wrong_label.setEditable_(False)
        wrong_label.setSelectable_(False)
        view.addSubview_(wrong_label)

        self.wrong_word_field = NSTextField.alloc().initWithFrame_(NSMakeRect(150, y_pos - 2, 200, 24))
        self.wrong_word_field.setPlaceholderString_("e.g., codex")
        view.addSubview_(self.wrong_word_field)

        # "Should be" field
        correct_label = NSTextField.alloc().initWithFrame_(NSMakeRect(370, y_pos, 100, 20))
        correct_label.setStringValue_("Should be:")
        correct_label.setFont_(NSFont.boldSystemFontOfSize_(12))
        correct_label.setBezeled_(False)
        correct_label.setDrawsBackground_(False)
        correct_label.setEditable_(False)
        correct_label.setSelectable_(False)
        view.addSubview_(correct_label)

        self.correct_word_field = NSTextField.alloc().initWithFrame_(NSMakeRect(480, y_pos - 2, 200, 24))
        self.correct_word_field.setPlaceholderString_("e.g., Codiris")
        view.addSubview_(self.correct_word_field)

        # Add word button
        add_btn = NSButton.alloc().initWithFrame_(NSMakeRect(150, y_pos - 40, 120, 28))
        add_btn.setTitle_("Add Word")
        add_btn.setBezelStyle_(1)
        add_btn.setTarget_(self)
        add_btn.setAction_(objc.selector(self.onAddWord_, signature=b"v@:@"))
        view.addSubview_(add_btn)

        y_pos -= 80

        # Trained words list
        list_label = NSTextField.alloc().initWithFrame_(NSMakeRect(20, y_pos, width - 40, 20))
        list_label.setStringValue_("Trained Words:")
        list_label.setFont_(NSFont.boldSystemFontOfSize_(14))
        list_label.setBezeled_(False)
        list_label.setDrawsBackground_(False)
        list_label.setEditable_(False)
        list_label.setSelectable_(False)
        view.addSubview_(list_label)

        y_pos -= 30

        # Scrollable list of trained words
        scroll_view = NSScrollView.alloc().initWithFrame_(NSMakeRect(20, 50, width - 40, y_pos - 50))
        scroll_view.setHasVerticalScroller_(True)
        scroll_view.setBorderType_(1)  # Line border

        self.words_list_view = NSTextView.alloc().initWithFrame_(NSMakeRect(0, 0, width - 60, y_pos - 50))
        self.words_list_view.setEditable_(False)
        self.words_list_view.setSelectable_(True)
        self.words_list_view.setFont_(NSFont.systemFontOfSize_(12))

        # Load and display trained words
        custom_words = config.get("custom_words", {})
        words_text = ""
        for wrong, correct in custom_words.items():
            words_text += f"{wrong} → {correct}\n"

        if not words_text:
            words_text = "No trained words yet. Add your first word above!"

        self.words_list_view.setString_(words_text)

        scroll_view.setDocumentView_(self.words_list_view)
        view.addSubview_(scroll_view)

        # Clear all button
        clear_btn = NSButton.alloc().initWithFrame_(NSMakeRect(width - 140, 15, 120, 28))
        clear_btn.setTitle_("Clear All")
        clear_btn.setBezelStyle_(1)
        clear_btn.setTarget_(self)
        clear_btn.setAction_(objc.selector(self.onClearWords_, signature=b"v@:@"))
        view.addSubview_(clear_btn)

        return view

    def _hex_to_nscolor(self, hex_color):
        """Convert hex color to NSColor"""
        hex_color = hex_color.lstrip('#')
        r = int(hex_color[0:2], 16) / 255.0
        g = int(hex_color[2:4], 16) / 255.0
        b = int(hex_color[4:6], 16) / 255.0
        return NSColor.colorWithCalibratedRed_green_blue_alpha_(r, g, b, 1.0)

    def _nscolor_to_hex(self, color):
        """Convert NSColor to hex"""
        r = int(color.redComponent() * 255)
        g = int(color.greenComponent() * 255)
        b = int(color.blueComponent() * 255)
        return f"#{r:02x}{g:02x}{b:02x}"

    def onSaveName_(self, sender):
        """Save the user's name"""
        from voicetype.settings import load_config, save_config
        config = load_config()

        new_name = self.name_field.stringValue()
        if "user" not in config:
            config["user"] = {}
        config["user"]["name"] = new_name
        save_config(config)

        # Show confirmation
        from AppKit import NSAlert
        alert = NSAlert.alloc().init()
        alert.setMessageText_("Name Saved")
        alert.setInformativeText_(f"Your name has been updated to '{new_name}'.")
        alert.runModal()

    def onSavePicture_(self, sender):
        """Save the user's picture URL"""
        from voicetype.settings import load_config, save_config
        config = load_config()

        new_picture = self.picture_field.stringValue()
        if "user" not in config:
            config["user"] = {}
        config["user"]["picture"] = new_picture
        save_config(config)

        # Show confirmation
        from AppKit import NSAlert
        alert = NSAlert.alloc().init()
        alert.setMessageText_("Picture Saved")
        alert.setInformativeText_("Your picture URL has been updated successfully.")
        alert.runModal()

    def onAddWord_(self, sender):
        """Add a custom word replacement"""
        from voicetype.settings import load_config, save_config
        config = load_config()

        wrong_word = self.wrong_word_field.stringValue().strip().lower()
        correct_word = self.correct_word_field.stringValue().strip()

        if not wrong_word or not correct_word:
            from AppKit import NSAlert
            alert = NSAlert.alloc().init()
            alert.setMessageText_("Empty Fields")
            alert.setInformativeText_("Please fill in both fields.")
            alert.runModal()
            return

        # Add to custom words dictionary
        if "custom_words" not in config:
            config["custom_words"] = {}

        config["custom_words"][wrong_word] = correct_word
        save_config(config)

        # Clear input fields
        self.wrong_word_field.setStringValue_("")
        self.correct_word_field.setStringValue_("")

        # Refresh the list
        words_text = ""
        for w, c in config["custom_words"].items():
            words_text += f"{w} → {c}\n"
        self.words_list_view.setString_(words_text)

        # Show confirmation
        from AppKit import NSAlert
        alert = NSAlert.alloc().init()
        alert.setMessageText_("Word Added")
        alert.setInformativeText_(f"'{wrong_word}' will now be replaced with '{correct_word}'")
        alert.runModal()

    def onClearWords_(self, sender):
        """Clear all custom words"""
        from voicetype.settings import load_config, save_config
        config = load_config()

        # Confirm deletion
        from AppKit import NSAlert
        alert = NSAlert.alloc().init()
        alert.setMessageText_("Clear All Words?")
        alert.setInformativeText_("This will remove all trained words. Are you sure?")
        alert.addButtonWithTitle_("Clear All")
        alert.addButtonWithTitle_("Cancel")

        response = alert.runModal()
        if response == 1000:  # First button (Clear All)
            config["custom_words"] = {}
            save_config(config)

            # Refresh the list
            self.words_list_view.setString_("No trained words yet. Add your first word above!")

    def onCopyLink_(self, sender):
        """Copy affiliate link to clipboard"""
        from AppKit import NSPasteboard
        link = self.affiliate_link_field.stringValue()
        pasteboard = NSPasteboard.generalPasteboard()
        pasteboard.clearContents()
        pasteboard.setString_forType_(link, "public.utf8-plain-text")

        # Show confirmation
        from AppKit import NSAlert
        alert = NSAlert.alloc().init()
        alert.setMessageText_("Link Copied")
        alert.setInformativeText_("Your affiliate link has been copied to clipboard.")
        alert.runModal()

    def onColorChange_(self, sender):
        """Handle color change"""
        from voicetype.settings import load_config, save_config
        config = load_config()

        color = self.color_well.color()
        hex_color = self._nscolor_to_hex(color)
        config["bar_color"] = hex_color
        save_config(config)

    def onPositionTop_(self, sender):
        """Set bar position to top"""
        from voicetype.settings import load_config, save_config
        config = load_config()
        config["bar_position"] = "top"
        save_config(config)

    def onPositionBottom_(self, sender):
        """Set bar position to bottom"""
        from voicetype.settings import load_config, save_config
        config = load_config()
        config["bar_position"] = "bottom"
        save_config(config)

    def onOpacityChange_(self, sender):
        """Handle opacity change"""
        from voicetype.settings import load_config, save_config
        config = load_config()
        config["bar_opacity"] = sender.doubleValue()
        save_config(config)

    def showWindow(self):
        """Show the window"""
        self.window.makeKeyAndOrderFront_(None)
        NSApp.activateIgnoringOtherApps_(True)


def get_settings_usage_window():
    """Get or create the settings/usage window"""
    global _settings_window
    if _settings_window is None:
        _settings_window = SettingsUsageWindowController.alloc().init()
    return _settings_window


def show_settings_usage():
    """Show the settings and usage window"""
    window = get_settings_usage_window()
    window.showWindow()


def update_usage_stats(characters_added, is_api_call=True):
    """Update usage statistics"""
    from voicetype.settings import load_config, save_config
    config = load_config()

    if "usage_stats" not in config:
        config["usage_stats"] = {
            "total_characters": 0,
            "total_requests": 0,
            "total_transcriptions": 0,
            "month_transcriptions": 0,
            "last_used": "",
            "avg_daily": 0
        }

    stats = config["usage_stats"]
    stats["total_characters"] += characters_added
    if is_api_call:
        stats["total_requests"] += 1
    stats["total_transcriptions"] += 1
    stats["month_transcriptions"] += 1
    stats["last_used"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    save_config(config)
