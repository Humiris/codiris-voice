from openai import OpenAI

class AIEnhancer:
    # Built-in API key
    OPENAI_API_KEY = "sk-proj-VLnNhAD7WuWzgJ3cPBg6T3BlbkFJsvenWYpnydczy45T9ITK"

    def __init__(self, api_key=None):
        self.api_key = api_key or self.OPENAI_API_KEY
        self.client = OpenAI(api_key=self.api_key)

    def set_api_key(self, api_key):
        self.api_key = api_key or self.OPENAI_API_KEY
        self.client = OpenAI(api_key=self.api_key)

    def enhance(self, text, mode="Clean", custom_prompt=None):
        if not self.client or mode == "Raw":
            return text

        # If custom prompt is provided, use it directly
        if custom_prompt:
            try:
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": custom_prompt},
                        {"role": "user", "content": text}
                    ]
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"AI Enhancement with custom prompt failed: {e}")
                return text

        system_prompt = "You are a helpful assistant that cleans up and formats voice transcriptions. You only return the final text, no explanations."

        prompts = {
            "Clean": f"Clean up this transcription. Fix grammar, punctuation, and capitalization:\n\n{text}",
            "Format": f"Format this transcription professionally. Fix grammar and punctuation:\n\n{text}",
            "Email": f"Convert this casual speech into a professional email. Add a greeting and sign-off if appropriate:\n\n{text}",
            "Code": f"Format this as concise code comments or documentation. Use # for Python/Ruby or // for JS/C++/Java style where appropriate:\n\n{text}",
            "Notes": f"Format this as structured meeting notes using bullet points for key actions and takeaways:\n\n{text}"
        }

        user_prompt = prompts.get(mode, prompts["Clean"])

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"AI Enhancement failed: {e}")
            return text
