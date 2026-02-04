import SwiftUI

struct VoiceButton: View {
    let isRecording: Bool
    let isProcessing: Bool
    var accentColor: Color = .blue
    let onTap: () -> Void
    let onLongPress: () -> Void

    @State private var isPressed = false
    @State private var pulseScale: CGFloat = 1.0
    @State private var rotationAngle: Double = 0

    var body: some View {
        Button(action: {}) {
            ZStack {
                // Outer pulse ring when recording
                if isRecording {
                    ForEach(0..<3) { i in
                        Circle()
                            .stroke(Color.red.opacity(0.3 - Double(i) * 0.1), lineWidth: 2)
                            .frame(width: 70 + CGFloat(i) * 15, height: 70 + CGFloat(i) * 15)
                            .scaleEffect(pulseScale)
                            .opacity(2 - pulseScale)
                    }
                }

                // Gradient background ring
                Circle()
                    .fill(
                        LinearGradient(
                            colors: buttonGradientColors,
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 64, height: 64)
                    .shadow(color: buttonShadowColor.opacity(0.5), radius: isPressed ? 4 : 8, y: isPressed ? 1 : 3)
                    .scaleEffect(isPressed ? 0.92 : 1.0)

                // Inner content
                if isRecording {
                    // Animated waveform
                    WaveformView(color: .white)
                        .frame(width: 36, height: 24)
                } else if isProcessing {
                    // Processing spinner
                    ZStack {
                        Circle()
                            .stroke(Color.white.opacity(0.3), lineWidth: 3)
                            .frame(width: 30, height: 30)

                        Circle()
                            .trim(from: 0, to: 0.7)
                            .stroke(Color.white, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                            .frame(width: 30, height: 30)
                            .rotationEffect(.degrees(rotationAngle))
                    }
                } else {
                    // Microphone icon
                    Image(systemName: "mic.fill")
                        .font(.system(size: 26, weight: .medium))
                        .foregroundColor(.white)
                }

                // Long press hint ring
                if !isRecording && !isProcessing {
                    Circle()
                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                        .frame(width: 58, height: 58)
                }
            }
        }
        .buttonStyle(PlainButtonStyle())
        .simultaneousGesture(
            LongPressGesture(minimumDuration: 0.4)
                .onEnded { _ in
                    onLongPress()
                }
        )
        .highPriorityGesture(
            TapGesture()
                .onEnded {
                    onTap()
                }
        )
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    withAnimation(.easeOut(duration: 0.1)) {
                        isPressed = true
                    }
                }
                .onEnded { _ in
                    withAnimation(.easeOut(duration: 0.15)) {
                        isPressed = false
                    }
                }
        )
        .onAppear {
            startAnimations()
        }
        .onChange(of: isRecording) { _, newValue in
            if newValue {
                startPulseAnimation()
            }
        }
        .onChange(of: isProcessing) { _, newValue in
            if newValue {
                startSpinnerAnimation()
            }
        }
    }

    // MARK: - Colors
    private var buttonGradientColors: [Color] {
        if isRecording {
            return [Color.red, Color.red.opacity(0.8)]
        } else if isProcessing {
            return [Color.orange, Color.orange.opacity(0.8)]
        } else {
            return [accentColor, accentColor.opacity(0.8)]
        }
    }

    private var buttonShadowColor: Color {
        if isRecording {
            return .red
        } else if isProcessing {
            return .orange
        } else {
            return accentColor
        }
    }

    // MARK: - Animations
    private func startAnimations() {
        if isRecording {
            startPulseAnimation()
        }
        if isProcessing {
            startSpinnerAnimation()
        }
    }

    private func startPulseAnimation() {
        pulseScale = 1.0
        withAnimation(.easeOut(duration: 1.0).repeatForever(autoreverses: false)) {
            pulseScale = 1.5
        }
    }

    private func startSpinnerAnimation() {
        rotationAngle = 0
        withAnimation(.linear(duration: 1.0).repeatForever(autoreverses: false)) {
            rotationAngle = 360
        }
    }
}

// MARK: - Waveform View
struct WaveformView: View {
    var color: Color = .white
    let barCount = 5

    @State private var animationPhases: [CGFloat] = Array(repeating: 0.3, count: 5)

    var body: some View {
        HStack(spacing: 3) {
            ForEach(0..<barCount, id: \.self) { index in
                RoundedRectangle(cornerRadius: 2)
                    .fill(color)
                    .frame(width: 4, height: 6 + animationPhases[index] * 18)
            }
        }
        .onAppear {
            animateBars()
        }
    }

    private func animateBars() {
        for i in 0..<barCount {
            let delay = Double(i) * 0.1
            withAnimation(
                .easeInOut(duration: 0.3 + Double.random(in: 0...0.2))
                .repeatForever(autoreverses: true)
                .delay(delay)
            ) {
                animationPhases[i] = CGFloat.random(in: 0.5...1.0)
            }
        }
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 40) {
        HStack(spacing: 30) {
            VoiceButton(
                isRecording: false,
                isProcessing: false,
                accentColor: .blue,
                onTap: {},
                onLongPress: {}
            )

            VoiceButton(
                isRecording: false,
                isProcessing: false,
                accentColor: .purple,
                onTap: {},
                onLongPress: {}
            )

            VoiceButton(
                isRecording: false,
                isProcessing: false,
                accentColor: .green,
                onTap: {},
                onLongPress: {}
            )
        }

        VoiceButton(
            isRecording: true,
            isProcessing: false,
            onTap: {},
            onLongPress: {}
        )

        VoiceButton(
            isRecording: false,
            isProcessing: true,
            onTap: {},
            onLongPress: {}
        )
    }
    .padding(40)
    .background(Color(.systemGray6))
}
