import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CONFIG, MemeItem } from '../config';
import { soundEngine } from '../utils/audioSystem';
import { Sparkles, PartyPopper, ExternalLink, RotateCcw, Volume2, VolumeX, Music } from 'lucide-react';

interface Stage7BirthdayPartyProps {
  onRestart: () => void;
}

export const Stage7BirthdayParty: React.FC<Stage7BirthdayPartyProps> = ({ onRestart }) => {
  // 'dark_silence' -> 'boom_party'
  const [phase, setPhase] = useState<'dark_silence' | 'boom_party'>('dark_silence');
  const [activeMemes] = useState<MemeItem[]>(CONFIG.memes);
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const confettiIntervalRef = useRef<number | null>(null);

  // Ráfagas masivas de confeti
  const fireMassiveConfetti = () => {
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.8 },
      colors: ['#ff007f', '#ffd700', '#00e5ff', '#ff5722', '#76ff03', '#d500f9'],
    });
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.8 },
      colors: ['#ff007f', '#ffd700', '#00e5ff', '#ff5722', '#76ff03', '#d500f9'],
    });
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#ffeb3b', '#ff4081', '#7c4dff', '#00e676', '#ff9100'],
    });
  };

  useEffect(() => {
    // Silencio y oscuridad de 1.4s antes del ¡PUM!
    const silenceTimer = setTimeout(() => {
      setPhase('boom_party');
      soundEngine.playPartyExplosion();
      fireMassiveConfetti();

      // Intervalo de confeti periódico
      confettiIntervalRef.current = window.setInterval(() => {
        fireMassiveConfetti();
      }, 4000);
    }, 1400);

    return () => {
      clearTimeout(silenceTimer);
      if (confettiIntervalRef.current) clearInterval(confettiIntervalRef.current);
    };
  }, []);

  const handleMemeClick = (_meme: MemeItem) => {
    soundEngine.playConfettiPop();
    confetti({
      particleCount: 45,
      spread: 65,
      origin: { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.6 + 0.2 },
    });
  };

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden select-none bg-black text-white">
      {/* =========================================================
          FASE 1: SILENCIO Y OSCURIDAD ABSOLUTA PREVIA A LA EXPLOSIÓN
         ========================================================= */}
      <AnimatePresence>
        {phase === 'dark_silence' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center cursor-none"
          >
            <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-ping" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          FASE 2: ¡PUM! FIESTA, LUCES DE DISCOTECA Y CELEBRACIÓN
         ========================================================= */}
      {phase === 'boom_party' && (
        <div className="relative w-full min-h-screen flex flex-col justify-between p-4 md:p-8 animate-party-strobe overflow-hidden">
          {/* Focos de discoteca que barren la pantalla */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
            <div className="absolute -top-40 left-1/4 w-96 h-[120vh] bg-gradient-to-b from-pink-500/80 via-transparent to-transparent -rotate-45 blur-2xl transform origin-top animate-pulse" />
            <div className="absolute -top-40 right-1/4 w-96 h-[120vh] bg-gradient-to-b from-cyan-400/80 via-transparent to-transparent rotate-45 blur-2xl transform origin-top animate-pulse" />
            <div className="absolute -top-20 left-1/2 w-80 h-[100vh] bg-gradient-to-b from-yellow-400/70 via-transparent to-transparent blur-3xl" />
          </div>

          {/* Barra superior con controles */}
          <header className="relative z-30 flex items-center justify-end max-w-6xl mx-auto w-full pt-2">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSound}
                className="p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-white/20 text-white shadow-lg transition-colors cursor-pointer"
                title={isMuted ? 'Activar sonido FX' : 'Silenciar sonido FX'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={fireMassiveConfetti}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 rounded-full text-xs font-bold tracking-wider text-black flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-transform hover:scale-105 cursor-pointer"
              >
                <PartyPopper className="w-4 h-4" />
                <span className="hidden sm:inline">¡Más Confeti!</span>
              </button>
            </div>
          </header>

          {/* Centro: Título Gigante "FELIZ CUMPLEAÑOS CATALINA" */}
          <main className="relative z-20 max-w-5xl mx-auto w-full my-auto text-center py-6">
            <motion.div
              initial={{ scale: 0.1, opacity: 0, rotate: -8 }}
              animate={{ scale: [0.1, 1.25, 1], opacity: 1, rotate: [-8, 4, 0] }}
              transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-3 text-3xl md:text-5xl animate-bounce">
                <span>🎉</span>
                <span>👑</span>
                <span>🎂</span>
                <span>✨</span>
              </div>

              {/* FELIZ CUMPLEAÑOS */}
              <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tight uppercase leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 drop-shadow-[0_5px_15px_rgba(255,255,255,0.4)]">
                  {CONFIG.birthdayHeadline}
                </span>
              </h1>

              {/* PA MI LOLI FAV */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block"
              >
                <h2 className="text-5xl sm:text-7xl md:text-9xl lg:text-[11rem] font-black tracking-wider text-white drop-shadow-[0_0_40px_rgba(236,72,153,0.9)] border-b-4 border-yellow-400 pb-2">
                  PA MI LOLI FAV
                </h2>
              </motion.div>

              <p className="mt-3 text-base md:text-xl font-serif-vintage italic text-yellow-200/95 max-w-xl mx-auto drop-shadow-md">
                Lo hiciste, bueno te deseo lo mejor yyyy espero que la estes pasando bien y no te hayas estresado mucho, si te estresasre mucho abajo mio hay un link para un asmr disfrutalo.
              </p>

              {/* Enlace ASMR debajo de P */}
              <div className="mt-3 flex justify-center">
                <a
                  href="https://www.youtube.com/watch?v=2w2fBF_BfRo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-800 via-pink-600 to-indigo-800 hover:from-purple-700 hover:to-pink-500 text-white font-medium text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(236,72,153,0.5)] border border-pink-300/40 transition-all transform hover:scale-105 cursor-pointer"
                >
                  <span>🎧 https://www.youtube.com/watch?v=2w2fBF_BfRo</span>
                  <ExternalLink className="w-3.5 h-3.5 text-pink-200" />
                </a>
              </div>
            </motion.div>

            {/* REPRODUCTOR DE MÚSICA DE CELEBRACIÓN DE YOUTUBE (FE_KnGLsX5c) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-8 max-w-md mx-auto bg-stone-950/90 border-2 border-pink-500/70 rounded-2xl p-4 shadow-[0_0_35px_rgba(236,72,153,0.4)] backdrop-blur-md"
            >
              <div className="flex items-center justify-between pb-2 text-xs text-pink-300 font-cinzel">
                <span className="flex items-center gap-1.5 font-bold">
                  <Music className="w-4 h-4 text-pink-400 animate-spin" />
                  Música de la Fiesta
                </span>
                <a
                  href={CONFIG.partyYouTubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-pink-400 hover:text-white flex items-center gap-1 underline"
                >
                  <span>Abrir en YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Iframe del video de celebración */}
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-pink-400/40 shadow-inner bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${CONFIG.partyYouTubeId}?autoplay=1&enablejsapi=1`}
                  title="Canción de Celebración"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </motion.div>

            {/* SECCIÓN FINAL */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-10 p-6 md:p-8 bg-stone-950/90 border-2 border-yellow-400/60 rounded-3xl max-w-xl mx-auto shadow-[0_0_50px_rgba(234,179,8,0.35)] text-center space-y-4 backdrop-blur-md"
            >
              <p className="text-lg md:text-2xl font-serif-vintage text-yellow-200 font-medium">
                Bueno con esto terminamos...
              </p>

              <div className="pt-2 flex justify-center">
                <a
                  href="https://wplace.live/?lat=-9.356022214816717&lng=-77.931826171875&zoom=21.082260156193005"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-stone-950 font-bold text-xs sm:text-sm tracking-wide rounded-full shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all duration-300 hover:scale-105 cursor-pointer max-w-full break-all"
                >
                  <span className="truncate max-w-[280px] sm:max-w-none">https://wplace.live/?lat=-9.356022214816717&lng=-77.931826171875&zoom=21.082260156193005</span>
                  <ExternalLink className="w-4 h-4 text-stone-950 shrink-0" />
                </a>
              </div>
            </motion.div>
          </main>

          {/* Pie de página con opción de reiniciar */}
          <footer className="relative z-30 max-w-4xl mx-auto w-full flex items-center justify-between border-t border-white/10 pt-4 pb-2 text-xs text-neutral-400">
            <span>We cuanto tiempo te tomo?</span>

            <button
              onClick={onRestart}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 border border-stone-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Volver a empezar</span>
            </button>
          </footer>
        </div>
      )}
    </div>
  );
};
