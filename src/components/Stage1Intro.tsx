import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../utils/audioSystem';

interface Stage1IntroProps {
  onStart: () => void;
}

export const Stage1Intro: React.FC<Stage1IntroProps> = ({ onStart }) => {
  const [isFading, setIsFading] = useState(false);

  const handleStartClick = () => {
    soundEngine.playStartChime();
    setIsFading(true);
    // Transición suave de 1.4s hacia la galería de fotos antiguas
    setTimeout(() => {
      onStart();
    }, 1400);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center select-none">
      <AnimatePresence>
        {!isFading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center z-50 px-6 text-center"
          >
            <motion.button
              onClick={handleStartClick}
              whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 255, 0.45)' }}
              whileTap={{ scale: 0.97 }}
              className="group relative px-10 py-4 bg-black border border-white/20 rounded-none tracking-[0.35em] text-xs md:text-sm text-neutral-300 uppercase transition-all duration-500 cursor-pointer hover:text-white"
            >
              <span className="relative z-10 font-medium">EMPEZAR</span>
              {/* Brillo sutil al pasar el mouse */}
              <div className="absolute inset-0 bg-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-700 shadow-[0_0_25px_rgba(255,255,255,0.15)] pointer-events-none" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Velo de transición hacia la galería */}
      {isFading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 bg-black pointer-events-none z-40"
        />
      )}
    </div>
  );
};
