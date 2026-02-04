import SwiftUI

struct ContentView: View {
    @StateObject private var settings = SettingsManager.shared
    @State private var showingSettings = false
    @State private var currentStep = 0
    @State private var showingAPIKeySheet = false
    @State private var apiKeyInput = ""
    @State private var showingPermissionAlert = false
    @State private var permissionAlertMessage = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header with logo
                    headerSection

                    // Status cards
                    statusSection

                    // Setup steps
                    setupStepsSection

                    // Quick actions
                    actionsSection

                    Spacer(minLength: 40)
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    NavigationLink(destination: SettingsView()) {
                        Image(systemName: "gear")
                    }
                }
            }
            .onAppear {
                settings.checkKeyboardStatus()
                checkPermissions()
            }
            .sheet(isPresented: $showingAPIKeySheet) {
                APIKeySheet(apiKey: $apiKeyInput, onSave: {
                    if !apiKeyInput.isEmpty {
                        settings.setAPIKey(apiKeyInput)
                    }
                    showingAPIKeySheet = false
                })
            }
            .alert("Permission Required", isPresented: $showingPermissionAlert) {
                Button("Open Settings") {
                    if let url = URL(string: UIApplication.openSettingsURLString) {
                        UIApplication.shared.open(url)
                    }
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text(permissionAlertMessage)
            }
        }
    }

    // MARK: - Header Section
    private var headerSection: some View {
        VStack(spacing: 16) {
            // Animated logo
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color.blue.opacity(0.2), Color.purple.opacity(0.2)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 120, height: 120)

                Image(systemName: "waveform.circle.fill")
                    .font(.system(size: 70))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.blue, .purple],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            }

            VStack(spacing: 8) {
                Text("Codiris Voice")
                    .font(.system(size: 32, weight: .bold))

                Text("AI-Powered Voice Keyboard")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.top, 20)
    }

    // MARK: - Status Section
    private var statusSection: some View {
        HStack(spacing: 12) {
            StatusCard(
                icon: "keyboard",
                title: "Keyboard",
                status: settings.isKeyboardEnabled ? "Enabled" : "Disabled",
                isActive: settings.isKeyboardEnabled
            )

            StatusCard(
                icon: "lock.open",
                title: "Full Access",
                status: settings.hasFullAccess ? "Granted" : "Required",
                isActive: settings.hasFullAccess
            )

            StatusCard(
                icon: "key",
                title: "API Key",
                status: settings.hasAPIKey ? "Set" : "Needed",
                isActive: settings.hasAPIKey
            )
        }
    }

    // MARK: - Setup Steps Section
    private var setupStepsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Setup Guide")
                .font(.headline)
                .padding(.horizontal, 4)

            VStack(spacing: 12) {
                SetupStepCard(
                    number: 1,
                    title: "Add Keyboard",
                    description: "Go to Settings → General → Keyboard → Keyboards → Add New Keyboard → Codiris Voice",
                    isComplete: settings.isKeyboardEnabled,
                    action: {
                        openKeyboardSettings()
                    }
                )

                SetupStepCard(
                    number: 2,
                    title: "Enable Full Access",
                    description: "Tap Codiris Voice in your keyboards list and enable \"Allow Full Access\" for voice and AI features",
                    isComplete: settings.hasFullAccess,
                    action: {
                        openKeyboardSettings()
                    }
                )

                SetupStepCard(
                    number: 3,
                    title: "Set API Key",
                    description: "Add your OpenAI API key for Whisper transcription and AI text enhancement",
                    isComplete: settings.hasAPIKey,
                    action: {
                        showingAPIKeySheet = true
                    }
                )

                SetupStepCard(
                    number: 4,
                    title: "Start Using",
                    description: "Switch to Codiris Voice keyboard in any app and tap the microphone to speak",
                    isComplete: settings.isKeyboardEnabled && settings.hasFullAccess,
                    action: nil
                )
            }
        }
    }

    // MARK: - Actions Section
    private var actionsSection: some View {
        VStack(spacing: 12) {
            Button(action: openKeyboardSettings) {
                HStack {
                    Image(systemName: "gear")
                    Text("Open Keyboard Settings")
                    Spacer()
                    Image(systemName: "arrow.up.right")
                        .font(.caption)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(12)
            }

            if !settings.hasAPIKey {
                Button(action: { showingAPIKeySheet = true }) {
                    HStack {
                        Image(systemName: "key.fill")
                        Text("Add OpenAI API Key")
                        Spacer()
                        Image(systemName: "plus")
                            .font(.caption)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.orange)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
            }

            // Test voice button
            if settings.isKeyboardEnabled && settings.hasFullAccess {
                NavigationLink(destination: TestVoiceView()) {
                    HStack {
                        Image(systemName: "mic.fill")
                        Text("Test Voice Input")
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.caption)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color(.systemGray5))
                    .foregroundColor(.primary)
                    .cornerRadius(12)
                }
            }
        }
    }

    // MARK: - Helper Methods
    private func openKeyboardSettings() {
        if let url = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(url)
        }
    }

    private func checkPermissions() {
        SpeechRecognizerService.requestPermissions { granted in
            if !granted {
                permissionAlertMessage = "Codiris Voice needs microphone and speech recognition access to transcribe your voice."
                showingPermissionAlert = true
            }
        }
    }
}

// MARK: - Status Card
struct StatusCard: View {
    let icon: String
    let title: String
    let status: String
    let isActive: Bool

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(isActive ? .green : .orange)

            Text(title)
                .font(.caption)
                .fontWeight(.medium)

            Text(status)
                .font(.caption2)
                .foregroundColor(isActive ? .green : .orange)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, y: 2)
    }
}

// MARK: - Setup Step Card
struct SetupStepCard: View {
    let number: Int
    let title: String
    let description: String
    let isComplete: Bool
    let action: (() -> Void)?

    var body: some View {
        Button(action: { action?() }) {
            HStack(alignment: .top, spacing: 16) {
                // Number/Check indicator
                ZStack {
                    Circle()
                        .fill(isComplete ? Color.green : Color.blue)
                        .frame(width: 36, height: 36)

                    if isComplete {
                        Image(systemName: "checkmark")
                            .foregroundColor(.white)
                            .fontWeight(.bold)
                    } else {
                        Text("\(number)")
                            .foregroundColor(.white)
                            .fontWeight(.bold)
                    }
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundColor(.primary)

                    Text(description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.leading)
                }

                Spacer()

                if action != nil && !isComplete {
                    Image(systemName: "chevron.right")
                        .foregroundColor(.secondary)
                        .font(.caption)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 4, y: 2)
        }
        .buttonStyle(PlainButtonStyle())
        .disabled(action == nil)
    }
}

// MARK: - API Key Sheet
struct APIKeySheet: View {
    @Binding var apiKey: String
    let onSave: () -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                VStack(spacing: 12) {
                    Image(systemName: "key.fill")
                        .font(.system(size: 50))
                        .foregroundColor(.orange)

                    Text("OpenAI API Key")
                        .font(.title2)
                        .fontWeight(.bold)

                    Text("Your API key is stored securely in the iOS Keychain and is only used for Whisper transcription and AI enhancement.")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .padding(.top, 20)

                VStack(alignment: .leading, spacing: 8) {
                    Text("API Key")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    TextField("sk-...", text: $apiKey)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocapitalization(.none)
                        .autocorrectionDisabled()
                        .font(.system(.body, design: .monospaced))
                }
                .padding(.horizontal)

                VStack(spacing: 8) {
                    Text("Get your API key from:")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Link("platform.openai.com/api-keys", destination: URL(string: "https://platform.openai.com/api-keys")!)
                        .font(.caption)
                }

                Spacer()

                Button(action: onSave) {
                    Text("Save API Key")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(apiKey.isEmpty ? Color.gray : Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
                .disabled(apiKey.isEmpty)
                .padding(.horizontal)
                .padding(.bottom)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Test Voice View
struct TestVoiceView: View {
    @StateObject private var voiceManager = TestVoiceManager()
    @StateObject private var settings = SettingsManager.shared

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Mode selector
            Picker("AI Mode", selection: $settings.currentMode) {
                ForEach(AIMode.allCases, id: \.self) { mode in
                    Text(mode.displayName).tag(mode)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal)

            // Transcription display
            VStack(spacing: 8) {
                Text("Transcription")
                    .font(.caption)
                    .foregroundColor(.secondary)

                ScrollView {
                    Text(voiceManager.transcription.isEmpty ? "Tap the microphone to start speaking..." : voiceManager.transcription)
                        .font(.body)
                        .foregroundColor(voiceManager.transcription.isEmpty ? .secondary : .primary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding()
                }
                .frame(height: 150)
                .background(Color(.systemGray6))
                .cornerRadius(12)
            }
            .padding(.horizontal)

            // Enhanced text display
            if !voiceManager.enhancedText.isEmpty && voiceManager.enhancedText != voiceManager.transcription {
                VStack(spacing: 8) {
                    Text("Enhanced (\(settings.currentMode.displayName))")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    ScrollView {
                        Text(voiceManager.enhancedText)
                            .font(.body)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                    }
                    .frame(height: 150)
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(12)
                }
                .padding(.horizontal)
            }

            Spacer()

            // Record button
            Button(action: {
                if voiceManager.isRecording {
                    voiceManager.stopRecording()
                } else {
                    voiceManager.startRecording()
                }
            }) {
                ZStack {
                    Circle()
                        .fill(voiceManager.isRecording ? Color.red : Color.blue)
                        .frame(width: 80, height: 80)
                        .shadow(color: (voiceManager.isRecording ? Color.red : Color.blue).opacity(0.4), radius: 10, y: 4)

                    if voiceManager.isProcessing {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(1.5)
                    } else {
                        Image(systemName: voiceManager.isRecording ? "stop.fill" : "mic.fill")
                            .font(.system(size: 30))
                            .foregroundColor(.white)
                    }
                }
            }
            .disabled(voiceManager.isProcessing)

            Text(voiceManager.isRecording ? "Tap to stop" : "Tap to speak")
                .font(.caption)
                .foregroundColor(.secondary)

            Spacer()
        }
        .navigationTitle("Test Voice")
    }
}

// Test voice manager for the test view
class TestVoiceManager: ObservableObject {
    @Published var isRecording = false
    @Published var isProcessing = false
    @Published var transcription = ""
    @Published var enhancedText = ""

    private var speechRecognizer: SpeechRecognizerService?
    private var aiEnhancer: AIEnhancerService?

    init() {
        speechRecognizer = SpeechRecognizerService()
        aiEnhancer = AIEnhancerService()
    }

    func startRecording() {
        isRecording = true
        transcription = ""
        enhancedText = ""

        speechRecognizer?.startRecording { [weak self] partial in
            DispatchQueue.main.async {
                self?.transcription = partial
            }
        }
    }

    func stopRecording() {
        isRecording = false
        isProcessing = true

        speechRecognizer?.stopRecording { [weak self] result in
            guard let self = self else { return }

            DispatchQueue.main.async {
                if let text = result {
                    self.transcription = text

                    let settings = SettingsManager.shared
                    if settings.currentMode != .raw {
                        self.aiEnhancer?.enhance(text: text, mode: settings.currentMode) { enhanced in
                            DispatchQueue.main.async {
                                self.enhancedText = enhanced ?? text
                                self.isProcessing = false
                            }
                        }
                    } else {
                        self.enhancedText = text
                        self.isProcessing = false
                    }
                } else {
                    self.isProcessing = false
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
