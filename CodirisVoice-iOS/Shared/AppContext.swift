import Foundation
import UIKit

// App context types
enum AppContext: String {
    case ide = "ide"
    case communication = "communication"
    case writing = "writing"
    case general = "general"
}

class AppContextDetector {
    // Known app bundle identifiers for context detection
    // Note: On iOS, keyboard extensions have limited ability to detect the host app
    // This is best-effort detection based on available information

    private static let ideApps: Set<String> = [
        "com.apple.dt.Xcode",
        "com.microsoft.VSCode",
        "com.panic.Code-iOS",
        "com.textasticapp.textastic-iphone",
        "com.omz-software.Pythonista3",
        "app.runestone.Runestone",
        "com.codeapp.Code-App",
        "com.serverbrowser.CodeEdit",
        "com.apple.Playgrounds"
    ]

    private static let communicationApps: Set<String> = [
        "com.apple.MobileSMS",
        "com.apple.mobilemail",
        "com.slack.Slack",
        "com.microsoft.teams",
        "com.whatsapp.WhatsApp",
        "org.telegram.Telegram",
        "com.facebook.Messenger",
        "com.atebits.Tweetie2",
        "com.burbn.instagram",
        "com.linkedin.LinkedIn",
        "com.discord.Discord",
        "com.tinyspeck.chatlyio"
    ]

    private static let writingApps: Set<String> = [
        "com.apple.mobilenotes",
        "com.apple.Pages",
        "com.microsoft.Word",
        "com.google.Docs",
        "md.obsidian",
        "com.evernote.iPhone.Evernote",
        "com.automattic.simplenote",
        "net.shinyfrog.bear-iOS",
        "com.luki.Craft-iOS",
        "com.notion.id"
    ]

    /// Detect the current app context
    /// Note: On iOS, keyboard extensions cannot directly determine the host app's bundle ID
    /// We use heuristics and any available information
    static func detectCurrentContext() -> AppContext {
        // In a keyboard extension, we have limited access to host app info
        // We can try to infer context from:
        // 1. Text input traits (if available)
        // 2. Keyboard type requested
        // 3. Any accessibility hints

        // For now, return general context
        // The full implementation would require:
        // - Checking UITextInputTraits
        // - Looking at keyboard type hints
        // - Analyzing the text field context

        // This is a placeholder - in production, you'd implement
        // more sophisticated detection using available signals

        return inferContextFromInputTraits()
    }

    /// Infer context from text input traits
    /// This is a best-effort approach since we can't directly access the host app
    private static func inferContextFromInputTraits() -> AppContext {
        // In a real implementation, the KeyboardViewController would pass
        // text input traits to help determine context

        // For demonstration, we default to general
        // but the keyboard view controller can override this based on:
        // - textDocumentProxy.keyboardType
        // - textDocumentProxy.returnKeyType
        // - textDocumentProxy.textContentType

        return .general
    }

    /// Determine context based on keyboard type
    /// Called from KeyboardViewController with actual input traits
    static func contextFromKeyboardType(_ keyboardType: UIKeyboardType, returnKeyType: UIReturnKeyType, contentType: UITextContentType?) -> AppContext {
        // Code-related keyboard types
        if keyboardType == .asciiCapable || keyboardType == .URL {
            // Could be code editor
            return .ide
        }

        // Email-related
        if keyboardType == .emailAddress || contentType == .emailAddress {
            return .communication
        }

        // Twitter/social content type
        if contentType == .username || contentType == .URL {
            return .communication
        }

        // Search might be general
        if returnKeyType == .search || returnKeyType == .google {
            return .general
        }

        // Send button usually means messaging
        if returnKeyType == .send {
            return .communication
        }

        return .general
    }
}
