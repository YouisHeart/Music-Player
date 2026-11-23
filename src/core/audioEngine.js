import { clamp } from '@/utils/format'

export class AudioEngine {
  constructor() {
    this._audio = null
    this._context = null
    this._gain = null
    this._analyser = null
    this._frequencyData = null
    this._filters = []
    this._graphReady = false
    this._graphFailed = false
    this._volume = 0.72
    this._muted = false
    this._eq = { enabled: false, bands: [0, 0, 0] }
  }

  get audio() {
    if (!this._audio) {
      const audio = new Audio()
      audio.preload = 'metadata'
      this._audio = audio
    }
    return this._audio
  }

  load(src) {
    const audio = this.audio
    if (!src) {
      audio.removeAttribute('src')
      audio.load()
      return
    }
    audio.src = src
    audio.load()
    this.audio.volume = this._graphReady ? 1 : this._muted ? 0 : this._volume
  }

  async play() {
    this.ensureGraph()
    await this.resume()
    return this.audio.play()
  }

  pause() {
    this.audio.pause()
  }

  seek(seconds) {
    const value = Number(seconds)
    if (!Number.isFinite(value)) return
    try {
      this.audio.currentTime = Math.max(0, value)
    } catch {
      /* seeking before metadata is ready is simply ignored */
    }
  }

  async resume() {
    if (this._context && this._context.state === 'suspended') {
      try {
        await this._context.resume()
      } catch {
        /* autoplay policies may still reject; play() surfaces the error */
      }
    }
  }

  setVolume(value) {
    this._volume = clamp(Number(value) || 0, 0, 1)
    this.applyOutputGain()
  }

  setMuted(muted) {
    this._muted = Boolean(muted)
    this.applyOutputGain()
  }

  applyOutputGain() {
    const audio = this.audio
    if (this._graphReady && this._gain) {
      const target = this._muted ? 0 : this._volume
      if (this._context) {
        this._gain.gain.setTargetAtTime(target, this._context.currentTime, 0.02)
      } else {
        this._gain.gain.value = target
      }
      audio.volume = 1
    } else {
      audio.volume = this._muted ? 0 : this._volume
    }
  }

  setEqualizer(settings) {
    this._eq = {
      enabled: Boolean(settings?.enabled),
      bands: [0, 1, 2].map((index) => clamp(Number(settings?.bands?.[index]) || 0, -12, 12)),
    }
    this.applyEqualizer()
  }

  applyEqualizer() {
    if (!this._filters.length) return
    this._filters.forEach((filter, index) => {
      filter.gain.value = this._eq.enabled ? this._eq.bands[index] : 0
    })
  }

  /**
   * Web Audio is optional: if the browser blocks MediaElementSource (for
   * example in a restricted file:// context) playback must still work.
   */
  ensureGraph() {
    if (this._graphReady || this._graphFailed) return
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) {
      this._graphFailed = true
      return
    }

    let source = null
    try {
      this._context = this._context || new AudioContextClass()
      const context = this._context
      source = context.createMediaElementSource(this.audio)

      const low = context.createBiquadFilter()
      low.type = 'lowshelf'
      low.frequency.value = 120
      const mid = context.createBiquadFilter()
      mid.type = 'peaking'
      mid.frequency.value = 1000
      mid.Q.value = 0.9
      const high = context.createBiquadFilter()
      high.type = 'highshelf'
      high.frequency.value = 6000

      const gain = context.createGain()
      gain.gain.value = this._muted ? 0 : this._volume

      const analyser = context.createAnalyser()
      analyser.fftSize = 512
      analyser.minDecibels = -90
      analyser.maxDecibels = -12
      analyser.smoothingTimeConstant = 0.8
      this._frequencyData = new Uint8Array(analyser.frequencyBinCount)

      source.connect(low)
      low.connect(mid)
      mid.connect(high)
      high.connect(gain)
      gain.connect(analyser)
      analyser.connect(context.destination)

      this._filters = [low, mid, high]
      this._gain = gain
      this._analyser = analyser
      this._graphReady = true
      this.audio.volume = 1
      this.applyEqualizer()
      this.applyOutputGain()
    } catch {
      this._graphFailed = true
      this._graphReady = false
      this._gain = null
      this._analyser = null
      this._filters = []
      this.audio.volume = this._muted ? 0 : this._volume
      if (source && this._context) {
        try {
          source.connect(this._context.destination)
        } catch {
          /* nothing else we can do */
        }
      }
    }
  }

  /** Real FFT magnitudes when Web Audio is available, otherwise null. */
  getFrequencyData() {
    if (!this._analyser || !this._frequencyData) return null
    this._analyser.getByteFrequencyData(this._frequencyData)
    return this._frequencyData
  }
}

export const audioEngine = new AudioEngine()
