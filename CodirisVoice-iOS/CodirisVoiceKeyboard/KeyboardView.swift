import SwiftUI

struct KeyboardView: View {
    let onTextInput: (String) -> Void
    let onDelete: () -> Void
    let onNextKeyboard: () -> Void
    let onReturn: () -> Void
    let hasFullAccess: Bool

    @StateObject private var voiceManager = VoiceInputManager()
    @StateObject private var settings = SettingsManager.shared
    @State private var showModePicker = false
    @State private var deleteTimer: Timer?
    @State private var isDeleting = false

    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                // Transcription preview bar (shows when recording or has text)
                if voiceManager.isRecording || !voiceManager.currentTranscription.isEmpty || voiceManager.isProcessing {
                    transcriptionBar
                }

                // Main keyboard controls
                mainControlsBar

                // Mode selector strip
                modeSelector
            }
            .background(keyboardBackground)

            // Mode picker overlay
            if showModePicker {
                modePickerOverlay
            }
        }
    }

    // MARK: - Keyboard Background
    private var keyboardBackground: some View {
        Color(.systemGray6)
            .overlay(
                LinearGradient(
                    colors: [Color.clear, Color.black.opacity(0.03)],
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
    }

    // MARK: - Transcription Bar
    private var transcriptionBar: some View {
        HStack(spacing: 8) {
            // Recording indicator
            if voiceManager.isRecording {
                HStack(spacing: 6) {
                    PulsingDot()
                    Text("Listening...")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.red)
                }
            } else if voiceManager.isProcessing {
                HStack(spacing: 6) {
                    ProgressView()
                        .scaleEffect(0.7)
                    Text("Processing...")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.orange)
                }
            }

            // Transcription text
            if !voiceManager.currentTranscription.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    Text(voiceManager.currentTranscription)
                        .font(.system(size: 14))
                        .foregroundColor(.primary)
                        .lineLimit(1)
                }
            }

            Spacer()

            // Mode badge
            HStack(spacing: 4) {
                Image(systemName: settings.currentMode.icon)
                    .font(.system(size: 10))
                Text(settings.currentMode.shortName)
                    .font(.system(size: 10, weight: .semibold))
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(modeColor.opacity(0.2))
            .foregroundColor(modeColor)
            .cornerRadius(10)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(Color(.systemBackground).opacity(0.95))
        .overlay(
            Rectangle()
                .fill(Color(.separator).opacity(0.3))
                .frame(height: 0.5),
            alignment: .bottom
        )
    }

    // MARK: - Main Controls Bar
    private var mainControlsBar: some View {
        HStack(spacing: 0) {
            // Left side: Globe and Space
            HStack(spacing: 8) {
                // Globe/Next Keyboard
                KeyboardButton(
                    systemImage: "globe",
                    action: onNextKeyboard
                )

                // Space bar
                Button(action: { onTextInput(" ") }) {
                    Text("space")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.primary)
                        .frame(width: 80, height: 42)
                        .background(Color(.systemBackground))
                        .cornerRadius(8)
                        .shadow(color: .black.opacity(0.1), radius: 1, y: 1)
                }
            }
            .padding(.leading, 8)

            Spacer()

            // Center: Voice Button
            VoiceButton(
                isRecording: voiceManager.isRecording,
                isProcessing: voiceManager.isProcessing,
                accentColor: modeColor,
                onTap: {
                    hapticFeedback(.medium)
                    if voiceManager.isRecording {
                        voiceManager.stopRecording { result in
                            if let text = result {
                                onTextInput(text)
                            }
                        }
                    } else {
                        voiceManager.startRecording()
                    }
                },
                onLongPress: {
                    hapticFeedback(.heavy)
                    withAnimation(.spring(response: 0.3)) {
                        showModePicker = true
                    }
                }
            )

            Spacer()

            // Right side: Delete and Return
            HStack(spacing: 8) {
                // Delete with repeat
                KeyboardButton(
                    systemImage: "delete.left",
                    action: onDelete
                )
                .simultaneousGesture(
                    LongPressGesture(minimumDuration: 0.3)
                        .onEnded { _ in
                            startContinuousDelete()
                        }
                )
                .onLongPressGesture(minimumDuration: .infinity, pressing: { pressing in
                    if !pressing {
                        stopContinuousDelete()
                    }
                }, perform: {})

                // Return
                KeyboardButton(
                    systemImage: "return",
                    action: onReturn,
                    highlighted: true
                )
            }
            .padding(.trailing, 8)
        }
        .padding(.vertical, 8)
    }

    // MARK: - Mode Selector
    private var modeSelector: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(AIMode.allCases, id: \.self) { mode in
                    ModeChip(
                        mode: mode,
                        isSelected: settings.currentMode == mode,
                        onTap: {
                            hapticFeedback(.light)
                            withAnimation(.easeInOut(duration: 0.2)) {
                                settings.currentMode = mode
                            }
                        }
                    )
                }
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 6)
        }
        .background(Color(.systemGray5).opacity(0.5))
    }

    // MARK: - Mode Picker Overlay
    private var modePickerOverlay: some View {
        ZStack {
            // Dimmed background
            Color.black.opacity(0.3)
                .ignoresSafeArea()
                .onTapGesture {
                    withAnimation(.spring(response: 0.3)) {
                        showModePicker = false
                    }
                }

            // Mode picker card
            VStack(spacing: 12) {
                Text("Select AI Mode")
                    .font(.headline)
                    .padding(.top, 8)

                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 12) {
                    ForEach(AIMode.allCases, id: \.self) { mode in
                        ModePickerItem(
                            mode: mode,
                            isSelected: settings.currentMode == mode,
                            onTap: {
                                hapticFeedback(.medium)
                                settings.currentMode = mode
                                withAnimation(.spring(response: 0.3)) {
                                    showModePicker = false
                                }
                            }
                        )
                    }
                }
                .padding(.horizontal)
                .padding(.bottom, 16)
            }
            .background(Color(.systemBackground))
            .cornerRadius(20)
            .shadow(color: .black.opacity(0.2), radius: 20, y: 10)
            .padding(.horizontal, 20)
        }
    }

    // MARK: - Helper Properties
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

    // MARK: - Helper Methods
    private func hapticFeedback(_ style: UIImpactFeedbackGenerator.FeedbackStyle) {
        if settings.hapticFeedback {
            let generator = UIImpactFeedbackGenerator(style: style)
            generator.impactOccurred()
        }
    }

    private func startContinuousDelete() {
        isDeleting = true
        deleteTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in
            onDelete()
            hapticFeedback(.light)
        }
    }

    private func stopContinuousDelete() {
        isDeleting = false
        deleteTimer?.invalidate()
        deleteTimer = nil
    }
}

// MARK: - Pulsing Dot
struct PulsingDot: View {
    @State private var isPulsing = false

    var body: some View {
        Circle()
            .fill(Color.red)
            .frame(width: 8, height: 8)
            .scaleEffect(isPulsing ? 1.3 : 1.0)
            .opacity(isPulsing ? 0.7 : 1.0)
            .onAppear {
                withAnimation(.easeInOut(duration: 0.6).repeatForever(autoreverses: true)) {
                    isPulsing = true
                }
            }
    }
}

// MARK: - Keyboard Button
struct KeyboardButton: View {
    let systemImage: String
    let action: () -> Void
    var highlighted: Bool = false

    var body: some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.system(size: 20))
                .foregroundColor(highlighted ? .white : .primary)
                .frame(width: 44, height: 42)
                .background(highlighted ? Color.blue : Color(.systemBackground))
                .cornerRadius(8)
                .shadow(color: .black.opacity(0.1), radius: 1, y: 1)
        }
    }
}

// MARK: - Mode Chip
struct ModeChip: View {
    let mode: AIMode
    let isSelected: Bool
    let onTap: () -> Void

    private var chipColor: Color {
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

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 4) {
                Image(systemName: mode.icon)
                    .font(.system(size: 10))
                Text(mode.shortName)
                    .font(.system(size: 11, weight: .medium))
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(isSelected ? chipColor : Color(.systemGray5))
            .foregroundColor(isSelected ? .white : .primary)
            .cornerRadius(14)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(isSelected ? chipColor : Color.clear, lineWidth: 1)
            )
        }
    }
}

// MARK: - Mode Picker Item
struct ModePickerItem: View {
    let mode: AIMode
    let isSelected: Bool
    let onTap: () -> Void

    private var itemColor: Color {
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

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(isSelected ? itemColor : Color(.systemGray5))
                        .frame(width: 50, height: 50)

                    Image(systemName: mode.icon)
                        .font(.system(size: 22))
                        .foregroundColor(isSelected ? .white : .primary)
                }

                Text(mode.shortName)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(isSelected ? itemColor : .primary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
            .background(isSelected ? itemColor.opacity(0.1) : Color.clear)
            .cornerRadius(12)
        }
    }
}

// MARK: - Voice Input Manager
class VoiceInputManager: ObservableObject {
    @Published var isRecording = false
    @Published var isProcessing = false
    @Published var currentTranscription = ""
    @Published var errorMessage: String?

    private var speechRecognizer: SpeechRecognizerService?
    private var aiEnhancer: AIEnhancerService?

    init() {
        speechRecognizer = SpeechRecognizerService()
        aiEnhancer = AIEnhancerService()
    }

    func startRecording() {
        errorMessage = nil
        isRecording = true
        currentTranscription = ""

        speechRecognizer?.startRecording { [weak self] partialResult in
            DispatchQueue.main.async {
                self?.currentTranscription = partialResult
            }
        }
    }

    func stopRecording(completion: @escaping (String?) -> Void) {
        isRecording = false
        isProcessing = true

        speechRecognizer?.stopRecording { [weak self] finalText in
            guard let self = self else {
                completion(nil)
                return
            }

            guard let text = finalText, !text.isEmpty else {
                DispatchQueue.main.async {
                    self.isProcessing = false
                    self.currentTranscription = ""
                    self.errorMessage = "No speech detected"
                    completion(nil)
                }
                return
            }

            // Apply AI enhancement
            let settings = SettingsManager.shared
            if settings.currentMode != .raw {
                self.aiEnhancer?.enhance(text: text, mode: settings.currentMode) { enhancedText in
                    DispatchQueue.main.async {
                        self.isProcessing = false
                        self.currentTranscription = ""
                        completion(enhancedText ?? text)
                    }
                }
            } else {
                DispatchQueue.main.async {
                    self.isProcessing = false
                    self.currentTranscription = ""
                    completion(text)
                }
            }
        }
    }
}

#Preview {
    VStack {
        Spacer()
        KeyboardView(
            onTextInput: { print("Input: \($0)") },
            onDelete: { print("Delete") },
            onNextKeyboard: { print("Next keyboard") },
            onReturn: { print("Return") },
            hasFullAccess: true
        )
        .frame(height: 200)
    }
    .background(Color(.systemGray4))
}
