import sounddevice as sd
import numpy as np
from scipy.io.wavfile import write
import tempfile
import os

class AudioRecorder:
    def __init__(self, sample_rate=16000):
        self.sample_rate = sample_rate
        self.recording = []
        self.stream = None

    def start_recording(self):
        self.recording = []
        print(f"[Audio] Starting recording with sample rate {self.sample_rate}")
        try:
            self.stream = sd.InputStream(samplerate=self.sample_rate, channels=1, callback=self.callback)
            self.stream.start()
            print("[Audio] Recording started successfully")
        except Exception as e:
            print(f"[Audio] ERROR starting recording: {e}")

    def callback(self, indata, frames, time, status):
        if status:
            print(f"[Audio] Status: {status}")
        self.recording.append(indata.copy())

    def stop_recording(self):
        print(f"[Audio] Stopping recording, chunks captured: {len(self.recording)}")
        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.stream = None

        if not self.recording:
            print("[Audio] WARNING: No audio data recorded!")
            return None

        audio_data = np.concatenate(self.recording, axis=0)
        duration = len(audio_data) / self.sample_rate
        print(f"[Audio] Recorded {duration:.2f} seconds of audio")

        # Create a temporary file
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, "codiris_voice_recording.wav")

        # Convert to int16 for WAV file
        audio_int16 = (audio_data * 32767).astype(np.int16)
        write(temp_path, self.sample_rate, audio_int16)
        print(f"[Audio] Saved to {temp_path}")

        return temp_path
