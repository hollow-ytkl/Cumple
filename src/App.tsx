import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Stage1Intro } from './components/Stage1Intro';
import { StageRules } from './components/StageRules';
import { Stage2Gallery } from './components/Stage2Gallery';
import { BookshelfTransition } from './components/BookshelfTransition';
import { Stage3Magic } from './components/Stage3Magic';
import { Stage4Laufey } from './components/Stage4Laufey';
import { StageMurderDrones } from './components/StageMurderDrones';
import { Stage5Ocean } from './components/Stage5Ocean';
import { Stage6MysteryQuestion } from './components/Stage6MysteryQuestion';
import { Stage7BirthdayParty } from './components/Stage7BirthdayParty';
import { soundEngine } from './utils/audioSystem';
import { Volume2, VolumeX } from 'lucide-react';

export default function App() {
  // Etapa actual:
  // 1: Intro Negra (EMPEZAR)
  // 2: Reglas del juego (5s + ¿Estás lista? + broma del No)
  // 3: Galería de Fotos Viejas (Misterio Romperachas)
  // 4: Estantería Secreta (Materialización de libros)
  // 5: Biblioteca Mágica (Grimorio & Lumos)
  // 6: Melodía Laufey (Vinilo & From The Start)
  // 7: Expediente 013 (Murder Drones / JCJenson Copper 9)
  // 8: Océano Íntimo (Inmersión en el abismo)
  // 9: Pregunta Misteriosa (Algo que te gusta & 60s)
  // 10: Fiesta de Cumpleaños (¡PUM! Confeti, memes & URL)
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const goToStage = (targetStage: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStage(targetStage);
      setIsTransitioning(false);
    }, 400);
  };

  const handleNextStage = () => {
    goToStage(currentStage + 1);
  };

  const handleRestart = () => {
    goToStage(1);
  };

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* Botón flotante de audio */}
      {currentStage > 1 && currentStage < 10 && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className="p-2.5 rounded-full bg-stone-900/70 hover:bg-stone-800 border border-white/10 text-neutral-300 hover:text-white backdrop-blur-md transition-all shadow-md cursor-pointer"
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      )}

      {/* Velo de transición suave */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-black z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* RENDERIZADO DE LAS ETAPAS */}
      <AnimatePresence mode="wait">
        {currentStage === 1 && (
          <motion.div
            key="stage-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full min-h-screen"
          >
            <Stage1Intro onStart={handleNextStage} />
          </motion.div>
        )}

        {currentStage === 2 && (
          <motion.div
            key="stage-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full min-h-screen"
          >
            <StageRules onComplete={handleNextStage} />
          </motion.div>
        )}

        {currentStage === 3 && (
          <motion.div
            key="stage-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full min-h-screen"
          >
            <Stage2Gallery onComplete={handleNextStage} />
          </motion.div>
        )}

        {currentStage === 4 && (
          <motion.div
            key="stage-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full min-h-screen"
          >
            <BookshelfTransition onComplete={handleNextStage} />
          </motion.div>
        )}

        {currentStage === 5 && (
          <motion.div
            key="stage-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full min-h-screen"
          >
            <Stage3Magic onComplete={handleNextStage} />
          </motion.div>
        )}

        {currentStage === 6 && (
          <motion.div
            key="stage-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full min-h-screen"
          >
            <Stage4Laufey onComplete={handleNextStage} />
          </motion.div>
        )}

        {currentStage === 7 && (
          <motion.div
            key="stage-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full min-h-screen"
          >
            <StageMurderDrones onComplete={handleNextStage} />
          </motion.div>
        )}

        {currentStage === 8 && (
          <motion.div
            key="stage-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full min-h-screen"
          >
            <Stage5Ocean onComplete={handleNextStage} />
          </motion.div>
        )}

        {currentStage === 9 && (
          <motion.div
            key="stage-9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full min-h-screen"
          >
            <Stage6MysteryQuestion onComplete={handleNextStage} />
          </motion.div>
        )}

        {currentStage === 10 && (
          <motion.div
            key="stage-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full min-h-screen"
          >
            <Stage7BirthdayParty onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
