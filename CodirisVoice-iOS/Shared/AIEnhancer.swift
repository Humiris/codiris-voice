import Foundation

class AIEnhancerService {
    private let settings = SettingsManager.shared

    // System prompts for different modes
    private let systemPrompts: [AIMode: String] = [
        .clean: """
            You are a helpful assistant that cleans up and formats voice transcriptions.
            IMPORTANT: Keep the SAME LANGUAGE as the input.
            Fix grammar, punctuation, and capitalization.
            You only return the final text, no explanations.
            """,

        .format: """
            You are a helpful assistant that formats voice transcriptions professionally.
            IMPORTANT: Keep the SAME LANGUAGE as the input.
            Fix grammar and punctuation. Structure the text properly.
            You only return the final text, no explanations.
            """,

        .email: """
            Format this as a clear, professional email.
            Keep it concise and natural.
            Only add a greeting if the context suggests one is needed.
            Keep the SAME LANGUAGE as the input.
            Output ONLY the email text, no explanations.
            """,

        .code: """
            Format this as concise code comments or documentation.
            Use # for Python/Ruby or // for JS/C++/Java style where appropriate.
            Keep the SAME LANGUAGE as the input.
            Output ONLY the formatted text, no explanations.
            """,

        .notes: """
            Format this as structured meeting notes using bullet points.
            Include key actions and takeaways.
            Keep the SAME LANGUAGE as the input.
            Output ONLY the notes, no explanations.
            """
    ]

    // Context-aware Super Prompt system prompts
    private func getSuperPromptSystem(context: AppContext) -> String {
        switch context {
        case .ide:
            return """
                You are an expert technical prompt engineer for developers.
                Transform casual speech into precise, technical prompts for coding AI assistants.

                Rules:
                1. Keep the SAME LANGUAGE as the input
                2. Be TECHNICAL and SPECIFIC - use proper programming terminology
                3. Include relevant technical context (language, framework, patterns)
                4. Specify expected code format, style, and best practices
                5. Mention error handling, edge cases, or performance considerations if relevant
                6. Output ONLY the final prompt, no explanations

                Format for code prompts:
                - Start with the specific task/goal
                - Mention language/framework if implied
                - Include constraints (performance, compatibility, style)
                - Specify what kind of code is expected (function, class, script, etc.)
                """

        case .communication:
            return """
                You are a helpful assistant that transforms speech into clear, casual communication.

                Rules:
                1. Keep the SAME LANGUAGE as the input
                2. Keep it CASUAL and NATURAL - like talking to a colleague
                3. Don't over-formalize or make it sound robotic
                4. Keep it concise - people skim messages
                5. If it's a question, make it clear and direct
                6. Output ONLY the final message, no explanations
                """

        case .writing:
            return """
                You are an expert writing assistant.
                Transform casual speech into well-structured, professional content.

                Rules:
                1. Keep the SAME LANGUAGE as the input
                2. Focus on clarity and structure
                3. Consider the document type (report, notes, article, etc.)
                4. Include tone and audience considerations
                5. Output ONLY the final text, no explanations
                """

        case .general:
            return """
                You are an expert prompt engineer.
                Transform casual speech into powerful, effective AI prompts.

                Rules:
                1. Keep the SAME LANGUAGE as the input
                2. Structure the prompt clearly with sections if needed
                3. Be specific about what's wanted
                4. Include context, constraints, and desired output format
                5. Make it actionable and clear
                6. Output ONLY the final prompt, no explanations
                """
        }
    }

    func enhance(text: String, mode: AIMode, completion: @escaping (String?) -> Void) {
        guard mode != .raw else {
            completion(text)
            return
        }

        guard let apiKey = settings.getAPIKey() else {
            print("No API key available")
            completion(text)
            return
        }

        // Determine system prompt
        let systemPrompt: String
        if mode == .superPrompt && settings.autoDetectContext {
            let context = AppContextDetector.detectCurrentContext()
            systemPrompt = getSuperPromptSystem(context: context)
            print("Super Prompt context: \(context)")
        } else if mode == .superPrompt {
            systemPrompt = getSuperPromptSystem(context: .general)
        } else {
            systemPrompt = systemPrompts[mode] ?? systemPrompts[.clean]!
        }

        // Make API call
        let url = URL(string: "https://api.openai.com/v1/chat/completions")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "model": "gpt-4o-mini",
            "messages": [
                ["role": "system", "content": systemPrompt],
                ["role": "user", "content": text]
            ],
            "max_tokens": 2000
        ]

        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let choices = json["choices"] as? [[String: Any]],
                  let firstChoice = choices.first,
                  let message = firstChoice["message"] as? [String: Any],
                  let content = message["content"] as? String else {
                print("AI enhancement failed: \(error?.localizedDescription ?? "Unknown error")")
                completion(text)
                return
            }

            completion(content.trimmingCharacters(in: .whitespacesAndNewlines))
        }.resume()
    }
}
