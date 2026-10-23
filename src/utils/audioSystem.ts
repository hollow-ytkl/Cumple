/**
 * MOTOR DE AUDIO PROCEDURAL Y REPRODUCTOR
 * Utiliza Web Audio API para generar efectos sonoros y ambientes musicales
 * en tiempo real sin requerir archivos externos obligatorios, pero permitiendo
 * reproducir archivos reales (.mp3 / .wav) si el usuario los coloca en la carpeta assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private loopNode: AudioNode | null = null;
  private customAudioElement: HTMLAudioElement | null = null;
  private vinylCrackleInterval: number | null = null;
  private isBossaPlaying: boolean = false;
  private bossaTimer: number | null = null;
  private waveNoiseSource: AudioBufferSourceNode | null = null;
  private waveGain: GainNode | null = null;
  private waveFilter: BiquadFilterNode | null = null;
  private waveLfo: OscillatorNode | null = null;
  private waveLfoGain: GainNode | null = null;
  private isWavePlaying: boolean = false;
  private waveFadeTimeout: number | null = null;

  private currentVolume: number = 0.95;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.currentVolume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    this.initContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, this.ctx.currentTime);
    }
  }

  public getMasterVolume(): number {
    return this.currentVolume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, this.ctx.currentTime);
    }
    if (this.customAudioElement) {
      this.customAudioElement.muted = this.isMuted;
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Sonido al pulsar "EMPEZAR" o clics elegantes
  public playStartChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 1.2);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 2.6);
  }

  // Sonido cuando un libro aparece en la estantería
  public playBookAppear(index: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Golpe sordo de madera
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(140, t);
    thud.frequency.exponentialRampToValueAtTime(50, t + 0.15);
    thudGain.gain.setValueAtTime(0.2, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    thud.connect(thudGain);
    thudGain.connect(this.masterGain);
    thud.start(t);
    thud.stop(t + 0.21);

    // Pequeño campanilleo mágico con tono pentatónico
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const freq = pentatonic[index % pentatonic.length];

    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(freq, t);
    chimeGain.gain.setValueAtTime(0.12, t);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    chime.connect(chimeGain);
    chimeGain.connect(this.masterGain);
    chime.start(t);
    chime.stop(t + 0.85);
  }

  // Sonido de pista revelada
  public playHintChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [659.25, 880.0, 1174.66]; // E5, A5, D6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.1);
      gain.gain.setValueAtTime(0.15, t + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.6);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + idx * 0.1);
      osc.stop(t + idx * 0.1 + 0.65);
    });
  }

  // Sonido de error sutil
  public playErrorSubtle() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(190, t + 0.4);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  // Desbloqueo primera etapa (ROMPERACHAS)
  public playGalleryUnlock() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Acorde majestuoso cálido mayor
    const chord = [261.63, 329.63, 392.0, 523.25, 659.25]; // C, E, G, C, E
    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0, t + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, t + idx * 0.08 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 2.5);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 2.6);
    });
  }

  // Etapa Mágica: Apertura del Grimorio
  public playMagicOpen() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Viento de páginas y magia
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.linearRampToValueAtTime(1600, t + 0.8);
    filter.Q.value = 3;

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 1.3);

    // Arpegio místico
    [440, 554.37, 659.25, 830.61, 987.77].forEach((f, i) => {
      const o = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t + i * 0.12);
      g.gain.setValueAtTime(0.12, t + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 1.4);
      o.connect(g);
      g.connect(this.masterGain!);
      o.start(t + i * 0.12);
      o.stop(t + i * 0.12 + 1.5);
    });
  }

  // Sonido de pasar página de pergamino antiguo
  public playPageTurn() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.15);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Lumos Maxima explosión de luz
  public playLumosMaxima() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Resplandor celestial en expansión
    const notes = [440, 554, 659, 880, 1108, 1318, 1760];
    notes.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + i * 0.07);
      gain.gain.setValueAtTime(0.2, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 2.8);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 2.9);
    });
  }

  // Etapa Laufey: Sonido de aguja sobre vinilo y acordes jazz bossa nova
  public startLaufeyTurntable(audioSrc?: string) {
    this.initContext();

    // Si hay un archivo de audio disponible, intentar reproducirlo
    if (audioSrc && audioSrc.length > 5 && !audioSrc.includes('[') && typeof Audio !== 'undefined') {
      try {
        if (!this.customAudioElement) {
          this.customAudioElement = new Audio(audioSrc);
          this.customAudioElement.loop = true;
        }
        this.customAudioElement.muted = this.isMuted;
        this.customAudioElement.play().catch(() => {
          // Si el archivo no existe aún, procedemos con el sintetizador elegante
          this.startProceduralBossa();
        });
        return;
      } catch {
        // Fallback a procedural
      }
    }

    this.startProceduralBossa();
  }

  // Generador de acordes bossa nova suaves estilo jazz moderno
  private startProceduralBossa() {
    if (this.isBossaPlaying) return;
    this.isBossaPlaying = true;
    this.initContext();

    // Acordes bossa nova suaves (Dmaj7, Bm7, Em7, A7sus4/A7)
    const chords = [
      [293.66, 369.99, 440.0, 554.37], // Dmaj7
      [246.94, 293.66, 369.99, 440.0], // Bm7
      [329.63, 392.0, 493.88, 587.33], // Em7
      [220.0, 329.63, 440.0, 554.37],  // A7
    ];

    let chordIdx = 0;
    const playChordStep = () => {
      if (!this.isBossaPlaying || !this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      const currentChord = chords[chordIdx % chords.length];

      // Bajo suave
      const bass = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bass.type = 'triangle';
      bass.frequency.setValueAtTime(currentChord[0] / 2, t);
      bassGain.gain.setValueAtTime(0.2, t);
      bassGain.gain.exponentialRampToValueAtTime(0.01, t + 1.2);
      bass.connect(bassGain);
      bassGain.connect(this.masterGain);
      bass.start(t);
      bass.stop(t + 1.3);

      // Notas de acompañamiento arpegiadas estilo nylon/jazz
      currentChord.forEach((freq, noteIdx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + noteIdx * 0.05);
        gain.gain.setValueAtTime(0.08, t + noteIdx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + noteIdx * 0.05 + 1.4);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(t + noteIdx * 0.05);
        osc.stop(t + noteIdx * 0.05 + 1.5);
      });

      chordIdx++;
      this.bossaTimer = window.setTimeout(playChordStep, 1600);
    };

    playChordStep();
  }

  public stopLaufeyTurntable() {
    this.isBossaPlaying = false;
    if (this.bossaTimer) {
      clearTimeout(this.bossaTimer);
      this.bossaTimer = null;
    }
    if (this.customAudioElement) {
      this.customAudioElement.pause();
    }
    // Sonido de levantamiento de aguja
    if (this.ctx && this.masterGain && !this.isMuted) {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.linearRampToValueAtTime(600, t + 0.15);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.16);
    }
  }

  // ==========================================
  // AMBIENTE DE OLAS MARINAS PROCEDURAL (LOOP)
  // ==========================================
  public startOceanWaves(initialVolume: number = 0.16) {
    if (this.isWavePlaying) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.waveFadeTimeout) {
      window.clearTimeout(this.waveFadeTimeout);
      this.waveFadeTimeout = null;
    }

    this.isWavePlaying = true;
    const t = this.ctx.currentTime;

    // 1. Buffer de ruido rosa filtrado de 6 segundos en bucle para textura suave de mar
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 6;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.09;
      b6 = white * 0.115926;
    }

    this.waveNoiseSource = this.ctx.createBufferSource();
    this.waveNoiseSource.buffer = noiseBuffer;
    this.waveNoiseSource.loop = true;

    // 2. Filtro paso bajo dinámico para simular el reflujo y avance de las olas
    this.waveFilter = this.ctx.createBiquadFilter();
    this.waveFilter.type = 'lowpass';
    this.waveFilter.frequency.setValueAtTime(320, t);
    this.waveFilter.Q.setValueAtTime(1.2, t);

    // 3. LFO que modula la apertura del filtro imitando el vaivén del mar cada 5.2 segundos
    this.waveLfo = this.ctx.createOscillator();
    this.waveLfo.type = 'sine';
    this.waveLfo.frequency.setValueAtTime(0.19, t); // ~5.2s período por ola

    this.waveLfoGain = this.ctx.createGain();
    this.waveLfoGain.gain.setValueAtTime(220, t);

    this.waveLfo.connect(this.waveLfoGain);
    this.waveLfoGain.connect(this.waveFilter.frequency);

    // 4. Ganancia de olas con entrada suave
    this.waveGain = this.ctx.createGain();
    this.waveGain.gain.setValueAtTime(0, t);
    this.waveGain.gain.linearRampToValueAtTime(initialVolume, t + 2.0);

    // Conexión del grafo de audio
    this.waveNoiseSource.connect(this.waveFilter);
    this.waveFilter.connect(this.waveGain);
    this.waveGain.connect(this.masterGain);

    this.waveNoiseSource.start(t);
    this.waveLfo.start(t);
  }

  // Atenuación suave y progresiva del sonido de olas hacia el silencio abisal
  public fadeOceanWaves(targetVolume: number = 0, duration: number = 6.0) {
    if (!this.waveGain || !this.ctx || !this.isWavePlaying) return;

    const t = this.ctx.currentTime;
    this.waveGain.gain.cancelScheduledValues(t);
    this.waveGain.gain.setValueAtTime(this.waveGain.gain.value, t);
    this.waveGain.gain.linearRampToValueAtTime(Math.max(0, targetVolume), t + duration);

    if (targetVolume <= 0.001) {
      if (this.waveFadeTimeout) window.clearTimeout(this.waveFadeTimeout);
      this.waveFadeTimeout = window.setTimeout(() => {
        this.stopOceanWaves();
      }, duration * 1000 + 100);
    }
  }

  // Detener y liberar recursos del ambiente de olas
  public stopOceanWaves() {
    this.isWavePlaying = false;
    if (this.waveFadeTimeout) {
      window.clearTimeout(this.waveFadeTimeout);
      this.waveFadeTimeout = null;
    }
    if (this.waveNoiseSource) {
      try {
        this.waveNoiseSource.stop();
        this.waveNoiseSource.disconnect();
      } catch {}
      this.waveNoiseSource = null;
    }
    if (this.waveLfo) {
      try {
        this.waveLfo.stop();
        this.waveLfo.disconnect();
      } catch {}
      this.waveLfo = null;
    }
    if (this.waveFilter) {
      try {
        this.waveFilter.disconnect();
      } catch {}
      this.waveFilter = null;
    }
    if (this.waveGain) {
      try {
        this.waveGain.disconnect();
      } catch {}
      this.waveGain = null;
    }
  }

  // Sonido de inmersión en el océano
  public playOceanDive() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Filtro pasa bajos de inmersión
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 3.5);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 1.0);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 4.0);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 4.1);

    // Burbujas ascendentes
    for (let i = 0; i < 8; i++) {
      const bOsc = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bOsc.type = 'sine';
      const bTime = t + 0.3 + i * 0.4;
      bOsc.frequency.setValueAtTime(300 + Math.random() * 200, bTime);
      bOsc.frequency.exponentialRampToValueAtTime(600 + Math.random() * 300, bTime + 0.12);
      bGain.gain.setValueAtTime(0.08, bTime);
      bGain.gain.exponentialRampToValueAtTime(0.001, bTime + 0.15);
      bOsc.connect(bGain);
      bGain.connect(this.masterGain);
      bOsc.start(bTime);
      bOsc.stop(bTime + 0.16);
    }
  }

  // Sonido de análisis misterioso (etapa 6)
  public playAnalysisPulse() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(554.37, t + 0.1);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  // ¡PUM! Explosión de fiesta y celebración
  public playPartyExplosion() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Impacto de bombo / explosión
    const boom = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boom.type = 'triangle';
    boom.frequency.setValueAtTime(150, t);
    boom.frequency.exponentialRampToValueAtTime(30, t + 0.6);
    boomGain.gain.setValueAtTime(0.5, t);
    boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    boom.connect(boomGain);
    boomGain.connect(this.masterGain);
    boom.start(t);
    boom.stop(t + 0.95);

    // Fanfarria triunfal mayor
    const fanfare = [
      { f: 523.25, time: 0.1, dur: 0.2 }, // C5
      { f: 659.25, time: 0.28, dur: 0.2 }, // E5
      { f: 783.99, time: 0.46, dur: 0.2 }, // G5
      { f: 1046.5, time: 0.65, dur: 0.8 }, // C6
    ];

    fanfare.forEach((n) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, t + n.time);
      gain.gain.setValueAtTime(0.2, t + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.time + n.dur);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + n.time);
      osc.stop(t + n.time + n.dur + 0.1);
    });
  }

  // Sonido de clic en memes / confeti adicional
  public playConfettiPop() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700 + Math.random() * 300, t);
    osc.frequency.exponentialRampToValueAtTime(250, t + 0.12);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  // Sonido de tipeo o bip de terminal de Murder Drones
  public playTerminalBeep(pitchMod = 1) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(850 * pitchMod, t);
    osc.frequency.exponentialRampToValueAtTime(400 * pitchMod, t + 0.04);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.055);
  }

  // Efecto de interferencia o glitch digital
  public playGlitchNoise() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(240, t);
    osc1.frequency.setValueAtTime(110, t + 0.05);
    osc1.frequency.setValueAtTime(620, t + 0.1);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(480, t);
    osc2.frequency.setValueAtTime(320, t + 0.07);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.2);
    osc2.stop(t + 0.2);
  }

  // Sonido resonante del Absolute Solver
  public playSolverRumble() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Tono grave misterioso
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(65, t);
    sub.frequency.exponentialRampToValueAtTime(95, t + 0.8);
    subGain.gain.setValueAtTime(0.2, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(t);
    sub.stop(t + 1.3);

    // Armónico agudo estilo visor amarillo de Murder Drones
    const shimmer = this.ctx.createOscillator();
    const shimmerGain = this.ctx.createGain();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(1320, t);
    shimmer.frequency.exponentialRampToValueAtTime(1760, t + 0.6);
    shimmerGain.gain.setValueAtTime(0.1, t);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(this.masterGain);
    shimmer.start(t);
    shimmer.stop(t + 0.95);
  }

  // Sonido de autorización cibernética concedida
  public playAccessGrantedCyber() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const chords = [587.33, 739.99, 880.0, 1174.66]; // Re mayor sci-fi
    chords.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0.16, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.8);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.85);
    });
  }

  // Sonido de denegación de acceso o error temporal
  public playAccessDeniedGlitch() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.setValueAtTime(95, t + 0.12);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.38);
  }

  // ==========================================
  // MELODÍA HEDWIG'S THEME (HARRY POTTER) - CELESTA MÁGICA
  // ==========================================
  private isHedwigPlaying: boolean = false;
  private hedwigTimeout: number | null = null;

  public startHedwigTheme() {
    if (this.isHedwigPlaying) return;
    this.isHedwigPlaying = true;
    this.initContext();

    // Notas de Hedwig's Theme: [frecuencia Hz, duración en s, pausa en s]
    const melody: [number, number, number][] = [
      [493.88, 0.45, 0.55], // B4
      [659.25, 0.70, 0.80], // E5
      [783.99, 0.28, 0.35], // G5
      [739.99, 0.45, 0.55], // F#5
      [659.25, 0.90, 1.05], // E5
      [987.77, 0.50, 0.60], // B5
      [880.00, 1.30, 1.50], // A5
      [739.99, 1.30, 1.50], // F#5

      [659.25, 0.70, 0.80], // E5
      [783.99, 0.28, 0.35], // G5
      [739.99, 0.45, 0.55], // F#5
      [622.25, 0.90, 1.05], // D#5
      [698.46, 0.50, 0.60], // F5
      [493.88, 1.80, 2.10], // B4

      [493.88, 0.45, 0.55], // B4
      [659.25, 0.70, 0.80], // E5
      [783.99, 0.28, 0.35], // G5
      [739.99, 0.45, 0.55], // F#5
      [659.25, 0.90, 1.05], // E5
      [987.77, 0.50, 0.60], // B5
      [1174.66, 0.85, 0.95], // D6
      [1108.73, 0.45, 0.55], // C#6
      [1046.50, 0.90, 1.05], // C6
      [830.61, 0.50, 0.60], // G#5
      [1046.50, 0.70, 0.80], // C6
      [987.77, 0.28, 0.35], // B5
      [932.33, 0.50, 0.60], // A#5
      [739.99, 0.70, 0.80], // F#5
      [783.99, 0.28, 0.35], // G5
      [659.25, 1.80, 2.30], // E5
    ];

    let noteIdx = 0;
    const playStep = () => {
      if (!this.isHedwigPlaying || !this.ctx || !this.masterGain) return;
      const [freq, dur, gap] = melody[noteIdx % melody.length];
      const t = this.ctx.currentTime;

      // Doble oscilador: armónico celesta + campana cálida
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, t);

      const level = 0.28 * this.currentVolume;
      gain.gain.setValueAtTime(level, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur + 0.1);
      osc2.stop(t + dur + 0.1);

      noteIdx++;
      this.hedwigTimeout = window.setTimeout(playStep, gap * 1000);
    };

    playStep();
  }

  public stopHedwigTheme() {
    this.isHedwigPlaying = false;
    if (this.hedwigTimeout) {
      window.clearTimeout(this.hedwigTimeout);
      this.hedwigTimeout = null;
    }
  }
}

export const soundEngine = new SoundEngine();
