import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CONFIG } from '../config';
import { soundEngine } from '../utils/audioSystem';
import { ChevronDown, Waves, ArrowDown, Sparkles } from 'lucide-react';

interface Stage5OceanProps {
  onComplete: () => void;
}

export const Stage5Ocean: React.FC<Stage5OceanProps> = ({ onComplete }) => {
  // 'beach' (playa) -> 'sinking' (hundiéndose) -> 'deep_sea_floor' (fondo del mar)
  const [phase, setPhase] = useState<'beach' | 'sinking' | 'deep_sea_floor'>('beach');
  const [depthMeter, setDepthMeter] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  // Enviar comandos al iframe de YouTube
  const sendIframeCommand = (func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      } catch (err) {
        console.error('Error enviando comando a YouTube:', err);
      }
    }
  };

  // Al comenzar la fase 'beach', iniciar el sonido ambiente en bucle de olas y asegurar volumen al 100% de la música
  useEffect(() => {
    // Iniciar sonido ambiente suave y en bucle de olas del mar
    soundEngine.startOceanWaves(0.15);

    const playTimer = setTimeout(() => {
      sendIframeCommand('setVolume', [100]);
      sendIframeCommand('playVideo');
    }, 600);

    return () => {
      clearTimeout(playTimer);
      // Al desmontar el componente, asegurar que el sonido ambiente de olas se desvanece suavemente
      soundEngine.fadeOceanWaves(0, 1.2);
    };
  }, []);

  // Iniciar la inmersión: nos vamos hundiendo y los sonidos del mar se desvanecen progresivamente
  const handleStartDive = () => {
    if (phase !== 'beach') return;
    setPhase('sinking');
    soundEngine.playOceanDive();

    // Desvanecer suavemente el sonido ambiente de olas en bucle a lo largo de 7 segundos hacia el abismo
    soundEngine.fadeOceanWaves(0, 7.0);

    // 1. Contador de profundidad progresivo durante el hundimiento
    let currentDepth = 0;
    const depthInterval = setInterval(() => {
      currentDepth += 25;
      if (currentDepth >= 1200) {
        setDepthMeter(1200);
        clearInterval(depthInterval);
      } else {
        setDepthMeter(currentDepth);
      }
    }, 150);

    // 2. Desvanecimiento suave y progresivo de la música de YouTube hasta desaparecer en el fondo
    // 7 segundos de hundimiento cinemático
    const totalSteps = 35;
    const stepDuration = 7000 / totalSteps;
    let step = 0;

    fadeIntervalRef.current = window.setInterval(() => {
      step++;
      const remainingVol = Math.max(0, 100 - Math.round((step / totalSteps) * 100));
      sendIframeCommand('setVolume', [remainingVol]);

      if (step >= totalSteps) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        sendIframeCommand('pauseVideo');
      }
    }, stepDuration);

    // 3. Llegada al fondo del mar tras 7.5 segundos
    setTimeout(() => {
      setPhase('deep_sea_floor');
    }, 7500);
  };

  const handleCompleteStage = () => {
    soundEngine.stopOceanWaves();
    onComplete();
  };

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen h-screen overflow-hidden select-none flex flex-col items-center justify-between p-4 md:p-8">
      {/* =========================================================================
          AUDIO DE FONDO OCULTO: YOUTUBE EMBED DE LA PLAYA (fz9EZEMJi6M)
          El reproductor está oculto para que la música se sienta natural del ambiente.
          Al hundirnos, el volumen se atenúa paulatinamente hasta el silencio abisal.
         ========================================================================= */}
      <iframe
        ref={iframeRef}
        src={`https://www.youtube-nocookie.com/embed/${CONFIG.beachYouTubeId}?enablejsapi=1&autoplay=1&loop=1&playlist=${CONFIG.beachYouTubeId}&controls=0`}
        title="Beach Ambience Music"
        allow="autoplay"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute top-0 left-0 w-1 h-1 opacity-[0.001] pointer-events-none -z-50"
      />

      {/* =========================================================================
          FONDO DINÁMICO: PLAYA SOLEADA / DORADA -> AGUA CRISTALINA -> ABISMO MARINO
         ========================================================================= */}
      {/* 1. Fondo fotográfico de la playa (Solo visible en la superficie y al empezar a hundirse) */}
      <motion.div
        animate={{
          y: phase === 'beach' ? '0%' : '-100%',
          opacity: phase === 'beach' ? 1 : 0,
          scale: phase === 'beach' ? 1 : 1.15,
        }}
        transition={{ duration: 7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url(${CONFIG.beachImageSrc})`,
          filter: 'brightness(0.85) saturate(1.1)',
        }}
      />

      {/* 2. Capa de degradado cálido de atardecer en la playa */}
      <motion.div
        animate={{
          opacity: phase === 'beach' ? 0.45 : 0,
        }}
        transition={{ duration: 5 }}
        className="absolute inset-0 z-0 bg-gradient-to-b from-amber-900/30 via-orange-950/20 to-stone-950/60 pointer-events-none"
      />

      {/* 3. Agua marina que cubre y sumerge la escena cuando nos hundimos */}
      <motion.div
        animate={{
          opacity: phase === 'beach' ? 0 : 1,
          background:
            phase === 'sinking'
              ? 'linear-gradient(180deg, #034f75 0%, #022b42 45%, #011420 100%)'
              : 'linear-gradient(180deg, #01111c 0%, #01080e 55%, #000305 100%)',
        }}
        transition={{ duration: 6, ease: 'easeInOut' }}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Caustics y rayos de sol refractados que se alejan hacia arriba durante el hundimiento */}
      <motion.div
        animate={{
          y: phase === 'beach' ? 0 : phase === 'sinking' ? -600 : -1200,
          opacity: phase === 'beach' ? 0.35 : phase === 'sinking' ? 0.7 : 0.05,
        }}
        transition={{ duration: 7.5, ease: 'easeOut' }}
        className="absolute -top-40 inset-x-0 h-[80vh] bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.4)_0%,rgba(14,116,144,0.15)_50%,transparent_80%)] pointer-events-none z-1"
      />

      {/* Olas suaves rompiendo en la orilla (Visual en la playa) */}
      {phase === 'beach' && (
        <div className="absolute inset-x-0 bottom-0 h-44 pointer-events-none z-1 overflow-hidden opacity-80">
          <motion.div
            animate={{
              y: [0, -14, 0],
              opacity: [0.35, 0.65, 0.35],
              scaleY: [1, 1.08, 1],
            }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-cyan-900/40 via-sky-800/20 to-transparent"
          />
          <motion.div
            animate={{
              y: [0, -8, 0],
              scaleX: [1, 1.02, 1],
            }}
            transition={{ duration: 5.2, repeat: Infinity, delay: 0.8, ease: 'easeInOut' }}
            className="absolute inset-x-0 bottom-0 h-1 border-t-2 border-white/40 blur-[1px]"
          />
        </div>
      )}

      {/* Burbujas y partículas marinas durante el hundimiento y el fondo abisal */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-2">
        {Array.from({ length: 32 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              y: '105vh',
              x: `${(i * 3.2) % 100}vw`,
              opacity: 0,
            }}
            animate={{
              y: '-10vh',
              opacity: phase === 'beach' ? [0, 0.25, 0] : [0, 0.75, 0],
              x: `${(i * 3.2) % 100 + Math.sin(i) * 4}vw`,
            }}
            transition={{
              duration: phase === 'sinking' ? 3 + (i % 3) : 7 + (i % 5),
              repeat: Infinity,
              delay: (i * 0.2) % 5,
              ease: 'linear',
            }}
            className={`absolute rounded-full border border-cyan-300/50 ${
              phase === 'sinking'
                ? 'w-3 h-3 bg-cyan-200/40 shadow-[0_0_10px_rgba(56,189,248,0.7)]'
                : 'w-1.5 h-1.5 bg-cyan-400/20'
            }`}
          />
        ))}
      </div>

      {/* Bioluminiscencia en el fondo del mar */}
      {phase === 'deep_sea_floor' && (
        <div className="absolute inset-0 pointer-events-none z-2">
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                delay: i * 0.35,
                ease: 'easeInOut',
              }}
              style={{
                top: `${25 + (i * 4) % 65}%`,
                left: `${8 + (i * 5) % 85}%`,
              }}
              className="absolute w-2 h-2 rounded-full bg-teal-400/70 blur-[1px] shadow-[0_0_14px_rgba(45,212,191,0.9)]"
            />
          ))}
        </div>
      )}

      {/* =========================================================================
          CONTENIDO: FASE 1 · LA PLAYA Y EL MENSAJE PERSONAL
         ========================================================================= */}
      <AnimatePresence>
        {phase === 'beach' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 1.2 }}
            className="relative z-10 max-w-2xl mx-auto my-auto flex flex-col items-center text-center px-4"
          >
            {/* Cuadro de texto personal con estética costera cálida */}
            <div className="mt-8 p-6 md:p-10 bg-stone-950/60 border border-amber-300/30 backdrop-blur-md rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative">
              <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
              
              <p className="text-base md:text-xl font-serif-vintage italic text-stone-100 leading-relaxed font-light drop-shadow">
                "{CONFIG.personalOceanText}"
              </p>
            </div>

            {/* Botón: SUMERGIRSE EN EL MAR (Inicia el hundimiento) */}
            <motion.button
              onClick={handleStartDive}
              whileHover={{ scale: 1.05, y: 2 }}
              whileTap={{ scale: 0.97 }}
              className="mt-10 px-8 py-3.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/60 rounded-full text-xs font-cinzel tracking-[0.3em] uppercase text-cyan-100 hover:text-white flex items-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 cursor-pointer"
            >
              <span>ADENTRARSE EN EL MAR</span>
              <ChevronDown className="w-4 h-4 text-cyan-300 animate-bounce" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          CONTENIDO: FASE 2 · EN PLENO HUNDIMIENTO (SINKING)
         ========================================================================= */}
      {phase === 'sinking' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative z-10 my-auto text-center pointer-events-none"
        >
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="space-y-4 max-w-md mx-auto p-6"
          >
            <div className="w-12 h-12 mx-auto rounded-full border border-cyan-400/50 flex items-center justify-center bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <ArrowDown className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>

            <span className="text-sm tracking-[0.4em] uppercase text-cyan-200 font-cinzel block">
              Hundiéndonos en las profundidades...
            </span>

            <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent mx-auto" />

            <p className="text-xs text-sky-200/80 font-serif-vintage italic">
              El rumor de la playa se desvanece en el silencio del abismo
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* =========================================================================
          CONTENIDO: FASE 3 · FONDO DEL MAR Y MENSAJE FINAL
         ========================================================================= */}
      <AnimatePresence>
        {phase === 'deep_sea_floor' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className="relative z-10 max-w-2xl mx-auto my-auto text-center px-4"
          >
            {/* Destello del lecho abisal */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-teal-500/10 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-[0_0_35px_rgba(45,212,191,0.35)]">
              <Waves className="w-8 h-8" />
            </div>

            {/* Mensaje profundo del fondo del mar */}
            <h3 className="mt-4 text-xl md:text-3xl font-serif-vintage font-normal text-teal-50 tracking-wide leading-relaxed">
              "{CONFIG.deepSeaQuote}"
            </h3>

            {/* Botón para avanzar a la siguiente etapa */}
            <motion.button
              onClick={handleCompleteStage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="mt-8 px-8 py-3 bg-teal-950/70 hover:bg-teal-900 border border-teal-400/50 rounded-full text-xs font-cinzel tracking-[0.25em] uppercase text-teal-200 hover:text-white shadow-[0_0_25px_rgba(45,212,191,0.3)] transition-all cursor-pointer flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>AVANZAR AL MISTERIO FINAL</span>
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de profundidad y estado al pie */}
      <div className="relative z-10 text-center pb-2">
        <span className="text-[10px] tracking-widest uppercase text-cyan-400/70 font-mono">
          {phase === 'beach'
            ? 'ENTORNO: LA PLAYA · ORILLA'
            : phase === 'sinking'
            ? `PROFUNDIDAD: ${depthMeter}m · HUNDIÉNDOSE EN EL ABISMO`
            : 'PROFUNDIDAD: 1,200m · FONDO MARINO'}
        </span>
      </div>
    </div>
  );
};
