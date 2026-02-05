from openai import OpenAI
import os
import threading
import base64
import requests

# Timeout for API calls (in seconds) - increased for long recordings
API_TIMEOUT = 180
# Maximum file size for APIs (in bytes) - 25MB for OpenAI
MAX_FILE_SIZE = 25 * 1024 * 1024

class Transcriber:
    # Built-in API keys
    OPENAI_API_KEY = "sk-proj-VLnNhAD7WuWzgJ3cPBg6T3BlbkFJsvenWYpnydczy45T9ITK"
    GROQ_API_KEY = "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"
    DEEPGRAM_API_KEY = "b78e6bfb0b310261686d7ebbbcff4403907a6f48"
    ASSEMBLYAI_API_KEY = "7e681f165b3b49aea39d293a1fadec75"

    def __init__(self, api_key=None, local=False, model="gpt4o", groq_key=None, deepgram_key=None, assemblyai_key=None):
        self.api_key = api_key or self.OPENAI_API_KEY
        self.groq_key = groq_key or self.GROQ_API_KEY
        self.deepgram_key = deepgram_key or self.DEEPGRAM_API_KEY
        self.assemblyai_key = assemblyai_key or self.ASSEMBLYAI_API_KEY
        self.local = local
        self.model = model
        self.client = OpenAI(api_key=self.api_key)
        self._local_model = None
        self._local_model_name = None
        self._loading_local = False

    def set_api_key(self, api_key):
        self.api_key = api_key
        self.client = OpenAI(api_key=api_key)

    def set_groq_key(self, key):
        self.groq_key = key

    def set_deepgram_key(self, key):
        self.deepgram_key = key

    def set_assemblyai_key(self, key):
        self.assemblyai_key = key

    def set_model(self, model):
        """Set the transcription model"""
        self.model = model
        self.local = (model == "local")

        # Load local model if needed
        if model == "local" and not self._local_model and not self._loading_local:
            threading.Thread(target=lambda: self._load_local_model("base")).start()

    def set_mode(self, local):
        """Legacy method for backwards compatibility"""
        self.local = local
        if local:
            self.model = "local"
        if local and not self._local_model and not self._loading_local:
            threading.Thread(target=lambda: self._load_local_model("base")).start()

    def _load_local_model(self, model_name="base"):
        try:
            from faster_whisper import WhisperModel
            self._loading_local = True
            print(f"Loading local Whisper model ({model_name})...")
            self._local_model = WhisperModel(model_name, device="cpu", compute_type="int8")
            self._local_model_name = model_name
            print(f"Local Whisper model ({model_name}) loaded.")
        except Exception as e:
            print(f"Failed to load local model: {e}")
        finally:
            self._loading_local = False

    def transcribe(self, file_path, language=None):
        # Check file size
        file_size = os.path.getsize(file_path)
        print(f"[Transcribe] File size: {file_size / 1024:.1f} KB")

        if file_size > MAX_FILE_SIZE:
            print(f"[Transcribe] WARNING: File too large ({file_size / 1024 / 1024:.1f} MB), may fail")

        # Get raw transcription
        try:
            if self.model == "local":
                text = self._transcribe_local(file_path, language)
            elif self.model == "whisper":
                text = self._transcribe_whisper(file_path, language)
            elif self.model == "groq":
                text = self._transcribe_groq(file_path, language)
            elif self.model == "deepgram":
                text = self._transcribe_deepgram(file_path, language)
            elif self.model == "assemblyai":
                text = self._transcribe_assemblyai(file_path, language)
            else:  # Default to gpt4o
                text = self._transcribe_gpt4o(file_path, language)
        except requests.exceptions.Timeout:
            raise Exception("Transcription timed out. Try a shorter recording.")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Network error during transcription: {str(e)}")

        # Apply learned corrections
        text = self._apply_corrections(text)
        return text

    def _apply_corrections(self, text):
        """Apply learned word corrections from training"""
        try:
            from voicetype.settings import load_config
            config = load_config()
            custom_words = config.get('custom_words', {})

            if not custom_words:
                return text

            # Apply word-level corrections (case-insensitive matching)
            words = text.split()
            corrected_words = []

            for word in words:
                # Check the word (lowercase) against corrections
                word_lower = word.lower()
                # Strip punctuation for matching
                word_clean = ''.join(c for c in word_lower if c.isalnum())

                if word_clean in custom_words:
                    # Preserve original punctuation
                    correction = custom_words[word_clean]
                    # Add back any trailing punctuation
                    trailing_punct = ''.join(c for c in word if not c.isalnum())
                    corrected_words.append(correction + trailing_punct)
                else:
                    corrected_words.append(word)

            return ' '.join(corrected_words)

        except Exception as e:
            print(f"Error applying corrections: {e}")
            return text

    def _transcribe_gpt4o(self, file_path, language=None):
        """Transcribe using GPT-4o audio capabilities - best quality"""
        if not self.client:
            raise Exception("OpenAI API Key not configured")

        print(f"Using GPT-4o Audio for transcription...")

        with open(file_path, "rb") as audio_file:
            audio_data = base64.b64encode(audio_file.read()).decode("utf-8")

        file_ext = os.path.splitext(file_path)[1].lower()
        format_map = {
            ".wav": "wav", ".mp3": "mp3", ".m4a": "m4a",
            ".webm": "webm", ".ogg": "ogg", ".flac": "flac"
        }
        audio_format = format_map.get(file_ext, "wav")

        prompt = "Transcribe this audio exactly as spoken. Return only the transcription, nothing else. If the audio is unclear or silent, return an empty string."
        if language and language != "auto":
            prompt = f"Transcribe this audio exactly as spoken in {language}. Return only the transcription, nothing else. If the audio is unclear or silent, return an empty string."

        response = self.client.chat.completions.create(
            model="gpt-4o-audio-preview",
            modalities=["text"],
            timeout=API_TIMEOUT,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "input_audio", "input_audio": {"data": audio_data, "format": audio_format}}
                    ]
                }
            ]
        )

        text = response.choices[0].message.content.strip()

        # Detect hallucination patterns - GPT-4o sometimes generates fake conversations
        hallucination_patterns = [
            '"' in text and text.count('"') >= 4,  # Multiple quoted dialogues
            'I\'m sorry' in text and 'transcribe' in text.lower(),  # Refusal message
            'I cannot' in text and 'audio' in text.lower(),  # Refusal message
            text.startswith('{') and text.endswith('}'),  # JSON-like output
        ]

        if any(hallucination_patterns):
            print(f"[GPT-4o] Detected possible hallucination, falling back to Whisper...")
            return self._transcribe_whisper(file_path, language)

        return text

    def _transcribe_whisper(self, file_path, language=None):
        """Transcribe using OpenAI Whisper API - fast and reliable"""
        if not self.client:
            raise Exception("OpenAI API Key not configured")

        print(f"Using OpenAI Whisper API for transcription...")

        with open(file_path, "rb") as audio_file:
            if language == "auto" or language is None:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
            else:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language=language
                )
        return transcript.text

    def _transcribe_groq(self, file_path, language=None):
        """Transcribe using Groq Whisper API - very fast"""
        if not self.groq_key:
            # Fall back to OpenAI API key if Groq key not set
            if self.api_key:
                print("Groq API key not set, using OpenAI Whisper instead...")
                return self._transcribe_whisper(file_path, language)
            raise Exception("Groq API Key not configured")

        print(f"Using Groq Whisper for transcription...")

        url = "https://api.groq.com/openai/v1/audio/transcriptions"
        headers = {"Authorization": f"Bearer {self.groq_key}"}

        with open(file_path, "rb") as audio_file:
            files = {"file": audio_file}
            data = {"model": "whisper-large-v3"}
            if language and language != "auto":
                data["language"] = language

            response = requests.post(url, headers=headers, files=files, data=data, timeout=API_TIMEOUT)

        if response.status_code != 200:
            raise Exception(f"Groq API error: {response.text}")

        return response.json().get("text", "").strip()

    def _transcribe_deepgram(self, file_path, language=None):
        """Transcribe using Deepgram API - high accuracy"""
        if not self.deepgram_key:
            if self.api_key:
                print("Deepgram API key not set, using OpenAI Whisper instead...")
                return self._transcribe_whisper(file_path, language)
            raise Exception("Deepgram API Key not configured")

        print(f"Using Deepgram for transcription...")

        url = "https://api.deepgram.com/v1/listen"
        params = {
            "model": "nova-2",
            "smart_format": "true",
            "punctuate": "true"
        }
        if language and language != "auto":
            params["language"] = language

        headers = {
            "Authorization": f"Token {self.deepgram_key}",
            "Content-Type": "audio/wav"
        }

        with open(file_path, "rb") as audio_file:
            response = requests.post(url, headers=headers, params=params, data=audio_file, timeout=API_TIMEOUT)

        if response.status_code != 200:
            raise Exception(f"Deepgram API error: {response.text}")

        result = response.json()
        try:
            return result["results"]["channels"][0]["alternatives"][0]["transcript"].strip()
        except (KeyError, IndexError):
            raise Exception(f"Deepgram returned unexpected response: {result}")

    def _transcribe_assemblyai(self, file_path, language=None):
        """Transcribe using AssemblyAI API - great accuracy"""
        if not self.assemblyai_key:
            if self.api_key:
                print("AssemblyAI API key not set, using OpenAI Whisper instead...")
                return self._transcribe_whisper(file_path, language)
            raise Exception("AssemblyAI API Key not configured")

        print(f"Using AssemblyAI for transcription...")

        headers = {"authorization": self.assemblyai_key}

        # Step 1: Upload the audio file
        upload_url = "https://api.assemblyai.com/v2/upload"
        with open(file_path, "rb") as audio_file:
            upload_response = requests.post(upload_url, headers=headers, data=audio_file, timeout=API_TIMEOUT)

        if upload_response.status_code != 200:
            raise Exception(f"AssemblyAI upload error: {upload_response.text}")

        audio_url = upload_response.json()["upload_url"]

        # Step 2: Request transcription
        transcript_url = "https://api.assemblyai.com/v2/transcript"
        transcript_request = {"audio_url": audio_url}
        if language and language != "auto":
            transcript_request["language_code"] = language

        transcript_response = requests.post(
            transcript_url,
            headers=headers,
            json=transcript_request,
            timeout=API_TIMEOUT
        )

        if transcript_response.status_code != 200:
            raise Exception(f"AssemblyAI transcript error: {transcript_response.text}")

        transcript_id = transcript_response.json()["id"]

        # Step 3: Poll for completion (with timeout)
        polling_url = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"
        import time
        start_time = time.time()
        while time.time() - start_time < API_TIMEOUT:
            poll_response = requests.get(polling_url, headers=headers, timeout=30)
            result = poll_response.json()

            if result["status"] == "completed":
                return result["text"].strip()
            elif result["status"] == "error":
                raise Exception(f"AssemblyAI transcription failed: {result.get('error', 'Unknown error')}")

            time.sleep(0.5)

        raise Exception("AssemblyAI transcription timed out")

    def _transcribe_local(self, file_path, language=None):
        """Transcribe using local Whisper base model - offline/private"""
        if not self._local_model or self._local_model_name != "base":
            if self._loading_local:
                raise Exception("Local model is still loading. Please wait.")
            self._load_local_model("base")
            if not self._local_model:
                raise Exception("Local model failed to load. Check dependencies.")

        print(f"Using Local Whisper (base) for transcription...")

        lang = None if language == "auto" else language
        segments, info = self._local_model.transcribe(file_path, beam_size=5, language=lang)
        return " ".join([segment.text for segment in segments]).strip()
