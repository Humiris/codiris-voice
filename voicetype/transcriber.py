from openai import OpenAI
import os
import threading

class Transcriber:
    def __init__(self, api_key=None, local=False):
        self.api_key = api_key
        self.local = local
        self.client = OpenAI(api_key=api_key) if api_key else None
        self._local_model = None
        self._loading_local = False

    def set_api_key(self, api_key):
        self.api_key = api_key
        self.client = OpenAI(api_key=api_key)

    def set_mode(self, local):
        self.local = local
        if local and not self._local_model and not self._loading_local:
            # Load model in background if requested and not yet loaded
            threading.Thread(target=self._load_local_model).start()

    def _load_local_model(self):
        try:
            from faster_whisper import WhisperModel
            self._loading_local = True
            print("Loading local Whisper model (base)...")
            # Using 'base' for a good balance of speed and accuracy on CPU/CoreML
            self._local_model = WhisperModel("base", device="cpu", compute_type="int8")
            print("Local Whisper model loaded.")
        except Exception as e:
            print(f"Failed to load local model: {e}")
        finally:
            self._loading_local = False

    def transcribe(self, file_path, language=None):
        if self.local:
            return self._transcribe_local(file_path, language)
        else:
            return self._transcribe_remote(file_path, language)

    def _transcribe_remote(self, file_path, language=None):
        if not self.client:
            raise Exception("API Key not configured")

        # Handle auto-detect (don't pass language parameter)
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

    def _transcribe_local(self, file_path, language=None):
        if not self._local_model:
            if self._loading_local:
                raise Exception("Local model is still loading. Please wait.")
            self._load_local_model()
            if not self._local_model:
                raise Exception("Local model failed to load. Check dependencies.")

        # Handle auto-detect
        lang = None if language == "auto" else language
        segments, info = self._local_model.transcribe(file_path, beam_size=5, language=lang)
        return " ".join([segment.text for segment in segments]).strip()
