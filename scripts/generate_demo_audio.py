"""Synthesize the original demo soundtrack for the Cyber Music Player.

Everything is generated from scratch with numpy and encoded to MP3 with
lameenc. No samples, loops or third-party recordings are used, so the demo
library ships with clean licensing and plays fully offline.

Usage:
    python scripts/generate_demo_audio.py             # all tracks
    python scripts/generate_demo_audio.py --only neon-run
    python scripts/generate_demo_audio.py --short      # fast smoke test
"""
from __future__ import annotations

import argparse
import json
import math
import sys
import time
import zlib
from dataclasses import dataclass, field
from pathlib import Path

import lameenc
import numpy as np

SR = 44_100
ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "audio"
MANIFEST = ROOT / "scripts" / "audio-manifest.json"

QUALITIES = {
    "min": [0, 3, 7, 10, 14],
    "maj": [0, 4, 7, 11, 14],
    "min7": [0, 3, 7, 10, 14, 17],
    "maj7": [0, 4, 7, 11, 14, 18],
    "sus2": [0, 2, 7, 12, 14],
}


@dataclass
class Track:
    slug: str
    title: str
    bpm: int
    key: int
    progression: list[tuple[int, str]]
    cover: str
    mood: str
    four_on_floor: bool = True
    arp_division: int = 16
    pad_brightness: float = 1.0
    melody: list[int] = field(default_factory=list)
    vinyl: float = 0.0
    rain: float = 0.0
    swing: float = 0.0
    duck: float = 0.38


TRACKS = [
    Track(
        slug="neon-run",
        title="霓虹夜行",
        bpm=108,
        key=57,  # A3
        progression=[(0, "min"), (8, "maj"), (3, "maj"), (10, "maj")],
        cover="/covers/cover-rooftop.webp",
        mood="Synthwave · 夜行",
        pad_brightness=1.25,
        arp_division=16,
        melody=[12, 15, 19, 22, 19, 15, 12, 10],
        duck=0.42,
    ),
    Track(
        slug="deep-echo",
        title="深海回声",
        bpm=78,
        key=50,  # D3
        progression=[(0, "min"), (10, "maj"), (8, "maj"), (5, "maj")],
        cover="/covers/cover-headphones.webp",
        mood="Deep Ambient · 深潜",
        four_on_floor=False,
        arp_division=8,
        pad_brightness=0.65,
        melody=[12, 10, 7, 5, 7, 10],
        duck=0.3,
    ),
    Track(
        slug="sakura-hour",
        title="樱落之时",
        bpm=92,
        key=52,  # E3
        progression=[(0, "min"), (3, "maj"), (8, "maj"), (7, "maj")],
        cover="/wallpapers/sakura-shrine.webp",
        mood="Dream Pop · 花见",
        four_on_floor=False,
        arp_division=16,
        pad_brightness=0.9,
        melody=[12, 15, 19, 15, 14, 12, 10, 12],
        rain=0.018,
        duck=0.34,
    ),
    Track(
        slug="midnight-radio",
        title="午夜电台",
        bpm=100,
        key=53,  # F3
        progression=[(0, "min"), (5, "maj"), (8, "maj"), (10, "maj")],
        cover="/covers/cover-turntable.webp",
        mood="Lo-Fi · 电台",
        arp_division=16,
        pad_brightness=0.8,
        melody=[12, 10, 12, 15, 14, 12, 10, 7],
        vinyl=0.05,
        swing=0.06,
        duck=0.4,
    ),
    Track(
        slug="star-drift",
        title="星轨漫游",
        bpm=84,
        key=48,  # C3
        progression=[(0, "maj"), (7, "maj"), (9, "min"), (5, "maj")],
        cover="/covers/cover-starlake.webp",
        mood="Space Ambient · 漂流",
        four_on_floor=False,
        arp_division=8,
        pad_brightness=1.05,
        melody=[12, 16, 19, 23, 19, 16, 14, 12],
        duck=0.26,
    ),
    Track(
        slug="rain-glow",
        title="雨巷微光",
        bpm=88,
        key=47,  # B3
        progression=[(0, "min"), (3, "maj"), (7, "maj"), (10, "maj")],
        cover="/covers/cover-umbrella.webp",
        mood="Rainy Chill · 雨夜",
        four_on_floor=False,
        arp_division=8,
        pad_brightness=0.7,
        melody=[12, 14, 15, 19, 15, 14, 12, 10],
        rain=0.03,
        duck=0.3,
    ),
]

SECTIONS = [
    ("intro", 3, 0.28),
    ("verse", 8, 0.68),
    ("chorus", 8, 1.0),
    ("break", 4, 0.42),
    ("chorus", 8, 1.0),
    ("outro", 4, 0.34),
]


def midi_to_hz(note: float) -> float:
    return 440.0 * (2.0 ** ((note - 69.0) / 12.0))


def db_to_gain(db: float) -> float:
    return 10.0 ** (db / 20.0)


def additive_saw(freq: float, duration: float, brightness: float = 1.0, harmonics: int = 12) -> np.ndarray:
    """Band-limited detuned-friendly saw built from sine partials."""
    count = int(duration * SR)
    if count <= 0:
        return np.zeros(0)
    t = np.arange(count, dtype=np.float64) / SR
    out = np.zeros(count)
    for h in range(1, harmonics + 1):
        f = freq * h
        if f > SR * 0.45:
            break
        weight = 1.0 / (h ** (1.0 + (1.0 - brightness) * 0.55))
        out += weight * np.sin(2.0 * math.pi * f * t + h * 0.31)
    peak = np.max(np.abs(out))
    return out / peak if peak > 1e-9 else out


def pad_note(freq: float, duration: float, brightness: float, rng: np.random.Generator) -> np.ndarray:
    count = int(duration * SR)
    attack = int(min(0.9, duration * 0.35) * SR)
    release = int(min(1.1, duration * 0.4) * SR)
    layers = []
    for detune, gain in ((-0.004, 0.55), (0.0, 1.0), (0.0045, 0.5)):
        tone = additive_saw(freq * (1.0 + detune), duration, brightness)
        layers.append(tone * gain)
    out = np.sum(layers, axis=0) / 2.05
    env = np.ones(count)
    env[:attack] = np.linspace(0.0, 1.0, attack) ** 1.4
    env[count - release :] *= np.linspace(1.0, 0.0, release) ** 1.8
    # Slow chorus movement keeps sustained pads alive.
    lfo = 1.0 + 0.045 * np.sin(2.0 * math.pi * (0.07 + rng.random() * 0.05) * np.arange(count) / SR)
    return out * env * lfo


def pluck(freq: float, duration: float, decay: float = 5.0, timbre: float = 0.35) -> np.ndarray:
    count = int(duration * SR)
    t = np.arange(count) / SR
    env = np.exp(-t * decay)
    tone = np.sin(2 * math.pi * freq * t) + timbre * np.sin(4 * math.pi * freq * t)
    tone += 0.12 * np.sin(6 * math.pi * freq * t) * env
    return tone * env


def bell(freq: float, duration: float, rng: np.random.Generator) -> np.ndarray:
    count = int(duration * SR)
    t = np.arange(count) / SR
    partials = [(1.0, 1.0, 3.2), (2.01, 0.45, 4.4), (3.93, 0.22, 6.1), (5.4, 0.1, 8.0)]
    out = np.zeros(count)
    for ratio, amp, decay in partials:
        out += amp * np.sin(2 * math.pi * freq * ratio * t) * np.exp(-t * decay)
    shimmer = 0.04 * rng.standard_normal(count) * np.exp(-t * 30)
    return (out + shimmer) * 0.45


def kick(duration: float = 0.42, punch: float = 1.0) -> np.ndarray:
    count = int(duration * SR)
    t = np.arange(count) / SR
    sweep = 118.0 * np.exp(-t * 22.0) + 44.0
    phase = 2 * math.pi * np.cumsum(sweep) / SR
    body = np.sin(phase) * np.exp(-t * 7.5) * punch
    click = (np.random.default_rng(7).standard_normal(count) * np.exp(-t * 180.0)) * 0.18
    return body + click


def snare(rng: np.random.Generator, duration: float = 0.26) -> np.ndarray:
    count = int(duration * SR)
    t = np.arange(count) / SR
    noise = rng.standard_normal(count)
    # Cheap band shaping: brighten with a first difference, soften with a small box.
    noise = np.convolve(noise, np.array([0.7, -0.35]), mode="same")
    env = np.exp(-t * 19.0)
    tone = np.sin(2 * math.pi * 186.0 * t) * np.exp(-t * 26.0) * 0.55
    return (noise * 0.8 + tone) * env


def hat(rng: np.random.Generator, duration: float = 0.07, open_hat: bool = False) -> np.ndarray:
    count = int(duration * SR)
    t = np.arange(count) / SR
    noise = rng.standard_normal(count)
    noise = np.diff(np.concatenate([[0.0], noise]))
    env = np.exp(-t * (55.0 if open_hat else 120.0))
    return noise * env * 0.32


def clap(rng: np.random.Generator, duration: float = 0.32) -> np.ndarray:
    count = int(duration * SR)
    t = np.arange(count) / SR
    noise = rng.standard_normal(count) * np.exp(-t * 16.0)
    bursts = np.zeros(count)
    for offset in (0.0, 0.012, 0.024, 0.04):
        idx = int(offset * SR)
        if idx < count:
            bursts[idx] += 1.0
    bursts = np.convolve(bursts, np.exp(-np.arange(500) / SR * 90.0))
    bursts = bursts[:count]
    return (noise * 0.55 + bursts * rng.standard_normal(count) * 0.3) * 0.75


def rain_noise(seconds: float, rng: np.random.Generator) -> np.ndarray:
    count = int(seconds * SR)
    noise = rng.standard_normal(count)
    # soften with a moving average, then add sparse droplets
    kernel = np.ones(9) / 9.0
    soft = np.convolve(noise, kernel, mode="same")
    droplets = np.zeros(count)
    positions = rng.integers(0, count, size=max(8, count // 9000))
    for pos in positions:
        length = min(600, count - pos)
        droplets[pos : pos + length] += rng.standard_normal(length) * np.exp(-np.arange(length) / 120.0) * 0.5
    return (soft * 0.5 + droplets) * 0.5


def vinyl_noise(seconds: float, rng: np.random.Generator) -> np.ndarray:
    count = int(seconds * SR)
    bed = np.convolve(rng.standard_normal(count), np.ones(5) / 5.0, mode="same") * 0.18
    ticks = np.zeros(count)
    positions = rng.integers(0, count, size=max(4, count // 22000))
    for pos in positions:
        length = min(220, count - pos)
        ticks[pos : pos + length] += rng.standard_normal(length) * np.exp(-np.arange(length) / 24.0)
    return bed + ticks * 0.9


def place(buffer: np.ndarray, sample: np.ndarray, start: int, gain: float, pan: float = 0.0) -> None:
    if sample.size == 0 or gain == 0.0:
        return
    end = min(buffer.shape[0], start + sample.size)
    if end <= start:
        return
    left = math.cos((pan + 1.0) * math.pi / 4.0)
    right = math.sin((pan + 1.0) * math.pi / 4.0)
    chunk = sample[: end - start] * gain
    buffer[start:end, 0] += chunk * left
    buffer[start:end, 1] += chunk * right


def make_impulse(rng: np.random.Generator, seconds: float = 2.1) -> np.ndarray:
    count = int(seconds * SR)
    t = np.arange(count) / SR
    decay = np.exp(-t * 2.6)
    ir = rng.standard_normal((count, 2)) * decay[:, None]
    for index, delay in enumerate((0.011, 0.019, 0.029, 0.041)):
        pos = int(delay * SR)
        ir[pos : pos + 120] += (0.55 - index * 0.08) * rng.standard_normal((120, 2))
    ir[: int(0.004 * SR)] *= np.linspace(0.0, 1.0, int(0.004 * SR))[:, None]
    ir /= np.sqrt(np.sum(ir**2, axis=0, keepdims=True)) + 1e-9
    return ir


def convolution_reverb(signal: np.ndarray, ir: np.ndarray, block: int = 1 << 16) -> np.ndarray:
    length = signal.shape[0]
    ir_length = ir.shape[0]
    nfft = 1 << int(math.ceil(math.log2(block + ir_length - 1)))
    spectrum = np.fft.rfft(ir, nfft, axis=0)
    out = np.zeros((length + ir_length - 1, 2))
    for start in range(0, length, block):
        chunk = signal[start : start + block]
        if chunk.shape[0] < block:
            chunk = np.pad(chunk, ((0, block - chunk.shape[0]), (0, 0)))
        transformed = np.fft.rfft(chunk, nfft, axis=0) * spectrum
        wet = np.fft.irfft(transformed, nfft, axis=0)
        end = min(out.shape[0], start + nfft)
        out[start:end] += wet[: end - start]
    return out[:length]


def ping_pong(signal: np.ndarray, delay_seconds: float, feedback: float = 0.34) -> np.ndarray:
    delay = int(delay_seconds * SR)
    out = signal.copy()
    for tap in range(1, 5):
        shift = delay * tap
        if shift >= signal.shape[0]:
            break
        gain = feedback**tap
        out[shift:, 0] += signal[:-shift, 1] * gain
        out[shift:, 1] += signal[:-shift, 0] * gain
    return out


def build_track(track: Track, short: bool = False) -> tuple[np.ndarray, dict]:
    rng = np.random.default_rng(zlib.crc32(track.slug.encode("utf-8")))
    beat = 60.0 / track.bpm
    bar = beat * 4.0
    sections = SECTIONS if not short else [("intro", 1, 0.3), ("chorus", 2, 1.0), ("outro", 1, 0.3)]
    total_bars = sum(bar_count for _, bar_count, _ in sections)
    duration = total_bars * bar + 2.5
    buffer = np.zeros((int(duration * SR), 2), dtype=np.float64)

    pad_bus = np.zeros_like(buffer)
    arp_bus = np.zeros_like(buffer)
    melody_bus = np.zeros_like(buffer)
    drum_bus = np.zeros_like(buffer)

    # Per-bar plan (section -> intensity + chord).
    plan: list[tuple[str, float, int]] = []
    for name, bar_count, intensity in sections:
        for _ in range(bar_count):
            plan.append((name, intensity, len(plan) % len(track.progression)))

    chord_notes: list[list[float]] = []
    for root_offset, quality in track.progression:
        root = track.key + root_offset
        chord_notes.append([root + interval for interval in QUALITIES[quality]])

    for bar_index, (section, intensity, chord_index) in enumerate(plan):
        bar_start = bar_index * bar
        start_sample = int(bar_start * SR)
        chord = chord_notes[chord_index]
        root = track.key + track.progression[chord_index][0]

        # --- Pad -------------------------------------------------------------
        bright = track.pad_brightness * (0.86 + intensity * 0.2)
        for voice_index, note in enumerate(chord[:4]):
            note_duration = bar * (1.02 if section != "break" else 1.3)
            sample = pad_note(midi_to_hz(note + 12), note_duration, bright, rng)
            if sample.size == 0:
                continue
            pan = (-0.5, 0.45, -0.2, 0.25)[voice_index % 4]
            level = 0.115 * (0.82 + intensity * 0.3)
            place(pad_bus, sample, start_sample, level, pan)
        if section in ("chorus", "break") and intensity > 0.35:
            high = pad_note(midi_to_hz(chord[2] + 24), bar * 0.98, bright * 1.1, rng)
            place(pad_bus, high, start_sample, 0.045, 0.6)

        # --- Bass ------------------------------------------------------------
        if section != "intro":
            pattern = [0, 0, 7, 0, 12, 7, 0, 12] if intensity > 0.6 else [0, 0, 7, 0]
            step = beat / 2.0
            for step_index, interval in enumerate(pattern):
                note = root - 12 + interval
                start = start_sample + int(step_index * step * SR)
                length = step * 0.92
                t = np.arange(int(length * SR)) / SR
                tone = np.sin(2 * math.pi * midi_to_hz(note) * t)
                tone += 0.22 * np.sign(np.sin(2 * math.pi * midi_to_hz(note) * t))
                env = np.exp(-t * 3.2) * (1.0 - np.exp(-t * 90.0))
                place(buffer, tone * env, start, 0.20 * (0.8 + intensity * 0.25))

        # --- Arpeggio --------------------------------------------------------
        divisions = track.arp_division
        if section != "intro" or bar_index % 2 == 1:
            step = bar / divisions
            tone_cycle = [chord[0], chord[1], chord[2], chord[3], chord[2], chord[1], chord[4] if len(chord) > 4 else chord[0]]
            notes_in_bar = divisions
            for step_index in range(notes_in_bar):
                if step_index % 2 == 1 and divisions >= 16 and intensity < 0.5:
                    continue
                note = tone_cycle[step_index % len(tone_cycle)] + 24
                start = start_sample + int(step_index * step * SR)
                length = min(step * 2.6, 0.5)
                sample = pluck(midi_to_hz(note), length, decay=6.5 + intensity * 4.0, timbre=0.3)
                pan = -0.55 if step_index % 2 == 0 else 0.55
                place(arp_bus, sample, start, 0.085 * (0.7 + intensity * 0.5), pan)

        # --- Sparkles / bells ------------------------------------------------
        if section == "chorus" and bar_index % 2 == 0:
            for offset in (0.0, beat * 2.0):
                note = chord[2] + 24
                sample = bell(midi_to_hz(note), 1.4, rng)
                place(arp_bus, sample, start_sample + int(offset * SR), 0.055, 0.4 if offset == 0 else -0.4)

        # --- Drums -----------------------------------------------------------
        if section not in ("intro", "outro") and intensity >= 0.6:
            if track.four_on_floor:
                for beat_index in range(4):
                    place(drum_bus, kick(), start_sample + int(beat_index * beat * SR), 0.62)
                for beat_index in (1, 3):
                    place(drum_bus, snare(rng), start_sample + int(beat_index * beat * SR), 0.30, 0.05)
                for eighth in range(8):
                    sample = hat(rng, open_hat=(eighth == 7 and bar_index % 2 == 1))
                    place(drum_bus, sample, start_sample + int(eighth * beat / 2 * SR), 0.20 if eighth % 2 else 0.12, 0.3)
                if intensity >= 0.95 and bar_index % 4 == 2:
                    place(drum_bus, clap(rng), start_sample + int(beat * 3 * SR), 0.20)
            else:
                place(drum_bus, kick(), start_sample, 0.55)
                place(drum_bus, kick(punch=0.8), start_sample + int(beat * 2.5 * SR), 0.34)
                place(drum_bus, snare(rng), start_sample + int(beat * 2 * SR), 0.24)
                for eighth in range(4):
                    place(drum_bus, hat(rng), start_sample + int(eighth * beat * SR + beat / 2 * SR), 0.11, 0.35)

        # --- Melody ----------------------------------------------------------
        if section in ("chorus", "break") and track.melody:
            phrase = track.melody
            phrase_length = bar if section == "break" else bar / 2
            for note_index, interval in enumerate(phrase):
                start = start_sample + int(note_index * (bar / len(phrase)) * SR)
                note = track.key + interval
                length = bar / len(phrase) * 0.9
                t = np.arange(int(length * SR)) / SR
                vibrato = 1.0 + 0.0035 * np.sin(2 * math.pi * 5.2 * t)
                phase = 2 * math.pi * np.cumsum(midi_to_hz(note) * vibrato) / SR
                tone = np.sin(phase) + 0.25 * np.sin(phase * 2.0) + 0.08 * np.sin(phase * 3.0)
                env = np.exp(-t * 2.1) * (1 - np.exp(-t * 45))
                place(melody_bus, tone * env, start, 0.075, 0.1)

    # --- Sidechain envelope ---------------------------------------------
    duck = np.ones(buffer.shape[0])
    if track.duck > 0:
        for beat_index in range(int(total_bars * 4)):
            start = int(beat_index * beat * SR)
            span = int(min(0.32, beat * 0.9) * SR)
            if start >= duck.size:
                break
            end = min(duck.size, start + span)
            shape = 1.0 - track.duck * np.exp(-np.arange(end - start) / (0.07 * SR))
            np.multiply(duck[start:end], shape, out=duck[start:end])
    pad_bus *= duck[:, None]
    arp_bus *= 0.85 + 0.15 * duck[:, None]

    # --- Atmosphere ------------------------------------------------------
    atmosphere = np.zeros_like(buffer)
    if track.rain > 0:
        rain = rain_noise(duration, rng)
        atmosphere[:, 0] += rain * track.rain
        atmosphere[:, 1] += np.roll(rain, 733) * track.rain
    if track.vinyl > 0:
        vinyl = vinyl_noise(duration, rng)
        atmosphere[:, 0] += vinyl * track.vinyl
        atmosphere[:, 1] += np.roll(vinyl, 271) * track.vinyl
    if track.vinyl > 0 or track.rain > 0:
        buffer += atmosphere

    # --- Delay, reverb and glue -----------------------------------------
    arp_wet = ping_pong(arp_bus, beat * 0.75, 0.38)
    melody_wet = ping_pong(melody_bus, beat * 0.5, 0.26)
    buffer += arp_bus + arp_wet * 0.32 + melody_bus + melody_wet * 0.28
    dry = buffer + pad_bus + drum_bus
    ir = make_impulse(rng)
    wet = convolution_reverb(dry, ir)
    mix = dry + wet * 0.24
    # A little air on the top end.
    mix[:, 0] += np.diff(np.concatenate([[0.0], mix[:, 0]])) * 0.05
    mix[:, 1] += np.diff(np.concatenate([[0.0], mix[:, 1]])) * 0.05

    # --- Master ----------------------------------------------------------
    fade_in = int(0.6 * SR)
    fade_out = int(min(4.0, duration * 0.2) * SR)
    mix[:fade_in] *= np.linspace(0.0, 1.0, fade_in)[:, None] ** 1.5
    mix[-fade_out:] *= np.linspace(1.0, 0.0, fade_out)[:, None] ** 1.4
    mix = np.tanh(mix * 1.18) / np.tanh(1.18)
    peak = np.max(np.abs(mix))
    if peak > 0:
        mix *= db_to_gain(-1.2) / peak
    mix = np.clip(mix, -1.0, 1.0)
    rms = float(np.sqrt(np.mean(mix**2)))
    active = mix[np.abs(mix).max(axis=1) > 0.01]
    meta = {
        "slug": track.slug,
        "title": track.title,
        "bpm": track.bpm,
        "duration": round(mix.shape[0] / SR, 3),
        "samples": int(mix.shape[0]),
        "cover": track.cover,
        "mood": track.mood,
        "peak": round(float(np.max(np.abs(mix))), 4),
        "rms": round(rms, 4),
        "rms_db": round(20 * math.log10(max(rms, 1e-9)), 2),
        "active_ratio": round(float(active.shape[0] / max(1, mix.shape[0])), 3) if active.size else 0.0,
    }
    return mix, meta


def encode_mp3(samples: np.ndarray, path: Path, bitrate: int = 160) -> int:
    encoder = lameenc.Encoder()
    encoder.set_bit_rate(bitrate)
    encoder.set_in_sample_rate(SR)
    encoder.set_channels(2)
    encoder.set_quality(2)
    pcm = (np.clip(samples, -1.0, 1.0) * 32767.0).astype("<i2").tobytes()
    data = encoder.encode(pcm) + encoder.flush()
    path.write_bytes(data)
    return len(data)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", default=None)
    parser.add_argument("--short", action="store_true")
    parser.add_argument("--bitrate", type=int, default=160)
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {}
    if MANIFEST.exists():
        try:
            manifest = json.loads(MANIFEST.read_text("utf-8"))
        except json.JSONDecodeError:
            manifest = {}

    selected = [track for track in TRACKS if args.only in (None, track.slug)]
    if not selected:
        print(f"unknown track: {args.only}", file=sys.stderr)
        sys.exit(1)

    for track in selected:
        started = time.time()
        print(f"rendering {track.slug} ({track.title}) ...", flush=True)
        samples, meta = build_track(track, short=args.short)
        target = OUT_DIR / f"{track.slug}.mp3"
        size = encode_mp3(samples, target, args.bitrate)
        meta["bytes"] = size
        meta["file"] = f"/audio/{track.slug}.mp3"
        manifest[track.slug] = meta
        print(
            f"  {meta['duration']:.1f}s  {size / 1024:.0f} KiB  "
            f"in {time.time() - started:.1f}s",
            flush=True,
        )

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True), "utf-8")
    print(f"manifest -> {MANIFEST}", flush=True)


if __name__ == "__main__":
    main()
