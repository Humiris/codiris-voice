import SwiftUI

struct SettingsView: View {
    @StateObject private var settings = SettingsManager.shared
    @State private var showingAPIKeySheet = false
    @State private var apiKeyInput = ""
    @State private var showingDeleteConfirmation = false

    var body: some View {
        List {
            // AI Mode Section
            Section {
                NavigationLink {
                    ModeSelectionView()
                } label: {
                    HStack {
                        Label {
                            Text("AI Mode")
                        } icon: {
                            Image(systemName: settings.currentMode.icon)
                                .foregroundColor(modeColor)
                        }
                        Spacer()
                        Text(settings.currentMode.displayName)
                            .foregroundColor(.secondary)
                    }
                }
            } header: {
                Text("AI Enhancement")
            } footer: {
                Text(settings.currentMode.description)
            }

            // Context Detection
            Section {
                Toggle(isOn: $settings.autoDetectContext) {
                    Label("Smart Context", systemImage: "sparkles")
                }

                if settings.autoDetectContext {
                    HStack(spacing: 12) {
                        ContextBadge(icon: "chevron.left.forwardslash.chevron.right", label: "Code", color: .green)
                        ContextBadge(icon: "bubble.left", label: "Chat", color: .blue)
                        ContextBadge(icon: "doc.text", label: "Docs", color: .purple)
                    }
                    .padding(.vertical, 4)
                }
            } footer: {
                if settings.autoDetectContext {
                    Text("Super Prompt adapts to your context - technical in code editors, casual in messaging apps")
                }
            }

            // Speech Settings
            Section {
                Picker(selection: $settings.language) {
                    Text("Auto-detect").tag("auto")
                    Divider()
                    Text("English").tag("en")
                    Text("French").tag("fr")
                    Text("Spanish").tag("es")
                    Text("German").tag("de")
                    Text("Italian").tag("it")
                    Text("Portuguese").tag("pt")
                    Text("Chinese").tag("zh")
                    Text("Japanese").tag("ja")
                    Text("Korean").tag("ko")
                    Text("Arabic").tag("ar")
                    Text("Russian").tag("ru")
                } label: {
                    Label("Language", systemImage: "globe")
                }

                Toggle(isOn: $settings.useAppleSpeech) {
                    Label("Offline Mode", systemImage: "iphone.slash")
                }
            } header: {
                Text("Speech Recognition")
            } footer: {
                Text(settings.useAppleSpeech
                    ? "Uses Apple's on-device speech recognition"
                    : "Uses OpenAI Whisper for higher accuracy (requires internet)"
                )
            }

            // API Key Section
            Section {
                if settings.hasAPIKey {
                    HStack {
                        Label("API Key", systemImage: "key.fill")
                        Spacer()
                        Text(settings.maskedAPIKey)
                            .font(.system(.body, design: .monospaced))
                            .foregroundColor(.secondary)
                    }

                    Button(action: { showingAPIKeySheet = true }) {
                        Label("Change API Key", systemImage: "pencil")
                    }

                    Button(role: .destructive, action: { showingDeleteConfirmation = true }) {
                        Label("Remove API Key", systemImage: "trash")
                    }
                } else {
                    Button(action: { showingAPIKeySheet = true }) {
                        Label("Add OpenAI API Key", systemImage: "plus.circle.fill")
                    }
                }
            } header: {
                Text("API Configuration")
            } footer: {
                if !settings.hasAPIKey {
                    Text("Required for Whisper transcription and AI enhancement when not using offline mode")
                }
            }

            // Appearance Section
            Section {
                ColorPicker(selection: $settings.accentColor) {
                    Label("Accent Color", systemImage: "paintbrush")
                }

                Toggle(isOn: $settings.hapticFeedback) {
                    Label("Haptic Feedback", systemImage: "hand.tap")
                }
            } header: {
                Text("Appearance")
            }

            // Support Section
            Section {
                Link(destination: URL(string: "https://codiris.com/voice/help")!) {
                    Label("Help & Support", systemImage: "questionmark.circle")
                }

                Link(destination: URL(string: "https://codiris.com/voice/feedback")!) {
                    Label("Send Feedback", systemImage: "envelope")
                }

                Button(action: requestReview) {
                    Label("Rate on App Store", systemImage: "star")
                }
            } header: {
                Text("Support")
            }

            // About Section
            Section {
                HStack {
                    Label("Version", systemImage: "info.circle")
                    Spacer()
                    Text("1.0.0")
                        .foregroundColor(.secondary)
                }

                Link(destination: URL(string: "https://codiris.com")!) {
                    HStack {
                        Label("Website", systemImage: "globe")
                        Spacer()
                        Image(systemName: "arrow.up.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Link(destination: URL(string: "https://codiris.com/privacy")!) {
                    HStack {
                        Label("Privacy Policy", systemImage: "hand.raised")
                        Spacer()
                        Image(systemName: "arrow.up.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Link(destination: URL(string: "https://codiris.com/terms")!) {
                    HStack {
                        Label("Terms of Service", systemImage: "doc.text")
                        Spacer()
                        Image(systemName: "arrow.up.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            } header: {
                Text("About")
            } footer: {
                Text("Made with \u{2764} by Codiris")
                    .frame(maxWidth: .infinity)
                    .padding(.top, 8)
            }
        }
        .navigationTitle("Settings")
        .sheet(isPresented: $showingAPIKeySheet) {
            APIKeySheet(apiKey: $apiKeyInput, onSave: {
                if !apiKeyInput.isEmpty {
                    settings.setAPIKey(apiKeyInput)
                }
                showingAPIKeySheet = false
            })
        }
        .confirmationDialog("Remove API Key?", isPresented: $showingDeleteConfirmation, titleVisibility: .visible) {
            Button("Remove", role: .destructive) {
                settings.deleteAPIKey()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("You'll need to add a new API key to use Whisper transcription and AI enhancement.")
        }
    }

    private var modeColor: Color {
        switch settings.currentMode {
        case .raw: return .gray
        case .clean: return .blue
        case .format: return .purple
        case .email: return .orange
        case .code: return .green
        case .notes: return .teal
        case .superPrompt: return .pink
        }
    }

    private func requestReview() {
        if let scene = UIApplication.shared.connectedScenes.first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene {
            SKStoreReviewController.requestReview(in: scene)
        }
    }
}

// MARK: - Context Badge
struct ContextBadge: View {
    let icon: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(color)
            Text(label)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(color.opacity(0.1))
        .cornerRadius(8)
    }
}

// MARK: - Mode Selection View
struct ModeSelectionView: View {
    @StateObject private var settings = SettingsManager.shared

    var body: some View {
        List {
            ForEach(AIMode.allCases, id: \.self) { mode in
                Button(action: { settings.currentMode = mode }) {
                    HStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(colorFor(mode).opacity(0.15))
                                .frame(width: 44, height: 44)

                            Image(systemName: mode.icon)
                                .font(.system(size: 18))
                                .foregroundColor(colorFor(mode))
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text(mode.displayName)
                                .font(.body)
                                .fontWeight(.medium)
                                .foregroundColor(.primary)

                            Text(mode.description)
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .lineLimit(2)
                        }

                        Spacer()

                        if settings.currentMode == mode {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(colorFor(mode))
                                .font(.system(size: 22))
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .navigationTitle("AI Mode")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func colorFor(_ mode: AIMode) -> Color {
        switch mode {
        case .raw: return .gray
        case .clean: return .blue
        case .format: return .purple
        case .email: return .orange
        case .code: return .green
        case .notes: return .teal
        case .superPrompt: return .pink
        }
    }
}

// Import for review request
import StoreKit

#Preview {
    NavigationStack {
        SettingsView()
    }
}
