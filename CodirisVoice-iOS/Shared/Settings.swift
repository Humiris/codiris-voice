import SwiftUI
import Security

// MARK: - AI Modes
enum AIMode: String, CaseIterable, Codable {
    case raw = "Raw"
    case clean = "Clean"
    case format = "Format"
    case email = "Email"
    case code = "Code"
    case notes = "Notes"
    case superPrompt = "Super Prompt"

    var displayName: String { rawValue }

    var shortName: String {
        switch self {
        case .superPrompt: return "Super"
        default: return rawValue
        }
    }

    var icon: String {
        switch self {
        case .raw: return "waveform"
        case .clean: return "text.badge.checkmark"
        case .format: return "text.alignleft"
        case .email: return "envelope"
        case .code: return "chevron.left.forwardslash.chevron.right"
        case .notes: return "list.bullet"
        case .superPrompt: return "sparkles"
        }
    }

    var description: String {
        switch self {
        case .raw:
            return "No processing - exact transcription of your speech"
        case .clean:
            return "Fix grammar, punctuation, and capitalization"
        case .format:
            return "Professional formatting with proper structure"
        case .email:
            return "Convert speech into professional email format"
        case .code:
            return "Format as code comments or documentation"
        case .notes:
            return "Structure as meeting notes with bullet points"
        case .superPrompt:
            return "Transform speech into powerful AI prompts (context-aware)"
        }
    }
}

// MARK: - Settings Manager
class SettingsManager: ObservableObject {
    static let shared = SettingsManager()

    private let defaults: UserDefaults
    private let appGroupID = "group.com.codiris.voice"

    // Published properties
    @Published var currentMode: AIMode {
        didSet { saveMode() }
    }

    @Published var language: String {
        didSet { defaults.set(language, forKey: "language") }
    }

    @Published var useAppleSpeech: Bool {
        didSet { defaults.set(useAppleSpeech, forKey: "useAppleSpeech") }
    }

    @Published var autoDetectContext: Bool {
        didSet { defaults.set(autoDetectContext, forKey: "autoDetectContext") }
    }

    @Published var hapticFeedback: Bool {
        didSet { defaults.set(hapticFeedback, forKey: "hapticFeedback") }
    }

    @Published var accentColor: Color {
        didSet { saveAccentColor() }
    }

    @Published var isKeyboardEnabled: Bool = false
    @Published var hasFullAccess: Bool = false

    var hasAPIKey: Bool {
        getAPIKey() != nil
    }

    var maskedAPIKey: String {
        guard let key = getAPIKey(), key.count > 8 else {
            return "Not set"
        }
        return String(repeating: "*", count: key.count - 4) + key.suffix(4)
    }

    private init() {
        // Use app group for shared defaults between app and extension
        defaults = UserDefaults(suiteName: appGroupID) ?? .standard

        // Load saved values
        if let modeString = defaults.string(forKey: "currentMode"),
           let mode = AIMode(rawValue: modeString) {
            currentMode = mode
        } else {
            currentMode = .raw
        }

        language = defaults.string(forKey: "language") ?? "auto"
        useAppleSpeech = defaults.bool(forKey: "useAppleSpeech")
        autoDetectContext = defaults.object(forKey: "autoDetectContext") as? Bool ?? true
        hapticFeedback = defaults.object(forKey: "hapticFeedback") as? Bool ?? true

        // Load accent color
        if let colorData = defaults.data(forKey: "accentColor"),
           let uiColor = try? NSKeyedUnarchiver.unarchivedObject(ofClass: UIColor.self, from: colorData) {
            accentColor = Color(uiColor)
        } else {
            accentColor = .blue
        }

        // Check keyboard status
        checkKeyboardStatus()
    }

    private func saveMode() {
        defaults.set(currentMode.rawValue, forKey: "currentMode")
    }

    private func saveAccentColor() {
        let uiColor = UIColor(accentColor)
        if let colorData = try? NSKeyedArchiver.archivedData(withRootObject: uiColor, requiringSecureCoding: false) {
            defaults.set(colorData, forKey: "accentColor")
        }
    }

    func checkKeyboardStatus() {
        // Check if our keyboard is in the list of enabled keyboards
        if let keyboards = UserDefaults.standard.object(forKey: "AppleKeyboards") as? [String] {
            isKeyboardEnabled = keyboards.contains { $0.contains("com.codiris.voice.keyboard") }
        }

        // Check if we have full access (required for network calls)
        hasFullAccess = UIPasteboard.general.hasStrings
    }

    // MARK: - Secure API Key Storage

    func setAPIKey(_ key: String) {
        let data = key.data(using: .utf8)!
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: "openai_api_key",
            kSecAttrAccessGroup as String: appGroupID,
            kSecValueData as String: data
        ]

        // Delete existing item
        SecItemDelete(query as CFDictionary)

        // Add new item
        SecItemAdd(query as CFDictionary, nil)
    }

    func getAPIKey() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: "openai_api_key",
            kSecAttrAccessGroup as String: appGroupID,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let key = String(data: data, encoding: .utf8) else {
            return nil
        }

        return key
    }

    func deleteAPIKey() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: "openai_api_key",
            kSecAttrAccessGroup as String: appGroupID
        ]
        SecItemDelete(query as CFDictionary)
    }
}
