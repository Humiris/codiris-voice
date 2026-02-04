import Foundation
import Speech
import AVFoundation

class SpeechRecognizerService: NSObject {
    private let settings = SettingsManager.shared

    // Apple Speech Recognition
    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()

    // Audio recording for Whisper
    private var audioRecorder: AVAudioRecorder?
    private var recordingURL: URL?

    private var onPartialResult: ((String) -> Void)?
    private var onFinalResult: ((String?) -> Void)?

    override init() {
        super.init()
        setupSpeechRecognizer()
    }

    private func setupSpeechRecognizer() {
        let locale = getLocale()
        speechRecognizer = SFSpeechRecognizer(locale: locale)
        speechRecognizer?.delegate = self
    }

    private func getLocale() -> Locale {
        let language = settings.language
        if language == "auto" {
            return Locale.current
        }
        return Locale(identifier: language)
    }

    // MARK: - Recording Control

    func startRecording(onPartialResult: @escaping (String) -> Void) {
        self.onPartialResult = onPartialResult

        if settings.useAppleSpeech {
            startAppleSpeechRecognition()
        } else {
            startAudioRecording()
        }
    }

    func stopRecording(completion: @escaping (String?) -> Void) {
        self.onFinalResult = completion

        if settings.useAppleSpeech {
            stopAppleSpeechRecognition()
        } else {
            stopAudioRecording()
        }
    }

    // MARK: - Apple Speech Recognition

    private func startAppleSpeechRecognition() {
        // Cancel any existing task
        recognitionTask?.cancel()
        recognitionTask = nil

        // Configure audio session
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            print("Audio session error: \(error)")
            return
        }

        // Create recognition request
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else { return }

        recognitionRequest.shouldReportPartialResults = true
        recognitionRequest.requiresOnDeviceRecognition = false

        // Start recognition task
        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            if let result = result {
                let text = result.bestTranscription.formattedString
                self?.onPartialResult?(text)

                if result.isFinal {
                    self?.onFinalResult?(text)
                }
            }

            if error != nil {
                self?.stopAppleSpeechRecognition()
            }
        }

        // Configure audio input
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)

        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
            self?.recognitionRequest?.append(buffer)
        }

        // Start audio engine
        audioEngine.prepare()
        do {
            try audioEngine.start()
        } catch {
            print("Audio engine error: \(error)")
        }
    }

    private func stopAppleSpeechRecognition() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        recognitionTask = nil
        recognitionRequest = nil
    }

    // MARK: - Whisper Audio Recording

    private func startAudioRecording() {
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
            try audioSession.setActive(true)
        } catch {
            print("Audio session error: \(error)")
            return
        }

        // Create temp file URL
        let tempDir = FileManager.default.temporaryDirectory
        recordingURL = tempDir.appendingPathComponent("recording_\(Date().timeIntervalSince1970).m4a")

        let recordSettings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 16000,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]

        do {
            audioRecorder = try AVAudioRecorder(url: recordingURL!, settings: recordSettings)
            audioRecorder?.record()
        } catch {
            print("Recording error: \(error)")
        }
    }

    private func stopAudioRecording() {
        audioRecorder?.stop()

        guard let url = recordingURL else {
            onFinalResult?(nil)
            return
        }

        // Send to Whisper API
        transcribeWithWhisper(fileURL: url)
    }

    private func transcribeWithWhisper(fileURL: URL) {
        guard let apiKey = settings.getAPIKey() else {
            print("No API key for Whisper")
            onFinalResult?(nil)
            return
        }

        let url = URL(string: "https://api.openai.com/v1/audio/transcriptions")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")

        let boundary = UUID().uuidString
        request.addValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()

        // Add file
        if let audioData = try? Data(contentsOf: fileURL) {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"file\"; filename=\"audio.m4a\"\r\n".data(using: .utf8)!)
            body.append("Content-Type: audio/m4a\r\n\r\n".data(using: .utf8)!)
            body.append(audioData)
            body.append("\r\n".data(using: .utf8)!)
        }

        // Add model
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"model\"\r\n\r\n".data(using: .utf8)!)
        body.append("whisper-1\r\n".data(using: .utf8)!)

        // Add language if specified
        let language = settings.language
        if language != "auto" {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"language\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(language)\r\n".data(using: .utf8)!)
        }

        body.append("--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = body

        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            // Clean up temp file
            try? FileManager.default.removeItem(at: fileURL)

            guard let data = data,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let text = json["text"] as? String else {
                print("Whisper error: \(error?.localizedDescription ?? "Unknown")")
                DispatchQueue.main.async {
                    self?.onFinalResult?(nil)
                }
                return
            }

            DispatchQueue.main.async {
                self?.onFinalResult?(text)
            }
        }.resume()
    }

    // MARK: - Permissions

    static func requestPermissions(completion: @escaping (Bool) -> Void) {
        // Request microphone permission
        AVAudioSession.sharedInstance().requestRecordPermission { granted in
            guard granted else {
                completion(false)
                return
            }

            // Request speech recognition permission
            SFSpeechRecognizer.requestAuthorization { status in
                DispatchQueue.main.async {
                    completion(status == .authorized)
                }
            }
        }
    }
}

// MARK: - SFSpeechRecognizerDelegate
extension SpeechRecognizerService: SFSpeechRecognizerDelegate {
    func speechRecognizer(_ speechRecognizer: SFSpeechRecognizer, availabilityDidChange available: Bool) {
        print("Speech recognizer availability: \(available)")
    }
}
