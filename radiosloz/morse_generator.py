import wave
import struct
import math

# Morse code dictionary
morse_code = {
    'S': '...',
    'O': '---'
}

text = 'SOS'
code = ' '.join(morse_code[char] for char in text)

sample_rate = 44100
frequency = 800  # Hz
dot_duration = 0.1  # seconds
dash_duration = 0.3
pause_symbol = 0.1
pause_letter = 0.3

def generate_tone(duration):
    num_samples = int(sample_rate * duration)
    samples = []
    for i in range(num_samples):
        sample = int(32767 * math.sin(2 * math.pi * frequency * i / sample_rate))
        samples.append(sample)
    return samples

def generate_pause(duration):
    num_samples = int(sample_rate * duration)
    return [0] * num_samples

audio_data = []
for symbol in code:
    if symbol == '.':
        audio_data.extend(generate_tone(dot_duration))
        audio_data.extend(generate_pause(pause_symbol))
    elif symbol == '-':
        audio_data.extend(generate_tone(dash_duration))
        audio_data.extend(generate_pause(pause_symbol))
    elif symbol == ' ':
        audio_data.extend(generate_pause(pause_letter - pause_symbol))  # since already have symbol pause

# Pack to bytes
packed_data = b''.join(struct.pack('<h', sample) for sample in audio_data)

# Write to WAV
with wave.open('morse.wav', 'wb') as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(sample_rate)
    wav_file.writeframes(packed_data)

print("Morse code WAV generated: morse.wav")