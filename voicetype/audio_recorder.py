import sounddevice as sd
import numpy as np
from scipy.io.wavfile import write
import tempfile
import os

# Maximum recording duration in seconds (2 minutes)
MAX_RECORDING_SECONDS = 120
# Chunk size for processing (30 seconds worth of samples)
CHUNK_SECONDS = 30

class AudioRecorder:
    def __init__(self, sample_rate=16000):
        self.sample_rate = sample_rate
        self.recording = []
        self.stream = None
        self.max_chunks = int((MAX_RECORDING_SECONDS * sample_rate) / 1024)  # Approximate chunk count limit

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
        # Limit recording length to prevent memory issues
        if len(self.recording) < self.max_chunks:
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

        file_size = os.path.getsize(temp_path)
        print(f"[Audio] Saved to {temp_path} ({file_size / 1024:.1f} KB, {duration:.1f}s)")

        return temp_path

    def get_duration(self):
        """Get current recording duration in seconds"""
        if not self.recording:
            return 0
        total_samples = sum(chunk.shape[0] for chunk in self.recording)
        return total_samples / self.sample_rate
