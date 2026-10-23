import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../utils/audioSystem';
import { Sparkles, Check, HelpCircle } from 'lucide-react';

interface StageRulesProps {
  onComplete: () => void;
}

export const StageRules: React.FC<StageRulesProps> = ({ onComplete }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(5);
  const [canChoose, setCanChoose] = useState<boolean>(false);
  const [showAngry, setShowAngry] = useState<boolean>(false);
  const [noHovered, setNoHovered] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  // Cuenta regresiva de 5 segundos
  useEffect(() => {
    if (secondsLeft <= 0) {
      setCanChoose(true);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanChoose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleYes = () => {
    soundEngine.playStartChime();
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  const handleNoInitial = () => {
    soundEngine.playErrorSubtle();
    setShowAngry(true);
  };

  // Convertir el botón 'No' en 'Sí' cuando el cursor entra
  const handleNoMouseEnter = () => {
    if (!noHovered) {
      soundEngine.playHintChime();
      setNoHovered(true);
    }
  };

  // Restaurar el botón a 'No' cuando el cursor deja de tocarlo
  const handleNoMouseLeave = () => {
    setNoHovered(false);
  };

  const handleSecondNoClick = () => {
    if (!noHovered) {
      setNoHovered(true);
    }
    handleYes();
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6 select-none overflow-hidden font-sans">
      {/* Fondo ambiental sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/15 via-black to-black pointer-events-none" />

      <AnimatePresence mode="wait">
        {!showAngry ? (
          /* ESCENA DE REGLAS NORMAL */
          <motion.div
            key="rules-normal"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-lg w-full bg-stone-950/80 border border-stone-800/80 rounded-2xl p-6 sm:p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md"
          >
            {/* Encabezado */}
            <div className="text-center mb-7">
              <h2 className="text-2xl sm:text-3xl font-cinzel text-neutral-100 tracking-wide">
                Reglas del Juego
              </h2>
              <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mx-auto mt-2" />
            </div>

            {/* Lista de reglas solicitadas */}
            <div className="space-y-3.5 mb-8">
              {[
                { text: 'No pedir ayuda a la IA', icon: '🤖' },
                { text: 'Se vale como máximo 1 búsqueda de Google', icon: '🔍' },
                { text: 'Presta atención a algunos detalles', icon: '👁️' },
                { text: 'suerte', icon: '🍀' },
              ].map((rule, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 * (idx + 1), duration: 0.4 }}
                  className="flex items-center gap-3.5 p-3 sm:p-3.5 rounded-xl bg-stone-900/60 border border-stone-800/60 hover:border-amber-500/30 transition-colors"
                >
                  <span className="text-lg flex-shrink-0">{rule.icon}</span>
                  <span className="text-sm sm:text-base text-neutral-200 font-serif-vintage tracking-wide">
                    {rule.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Sección inferior con timer o botones */}
            <div className="min-h-[80px] flex flex-col items-center justify-center">
              {!canChoose ? (
                <div className="flex flex-col items-center gap-2 text-stone-400 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Leyendo las reglas...</span>
                  </div>
                  <div className="w-36 h-1.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 5, ease: 'linear' }}
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                    />
                  </div>
                  <span className="text-[11px] text-stone-500">{secondsLeft}s restantes</span>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-full flex flex-col items-center gap-4"
                >
                  <div className="flex items-center gap-2 text-neutral-300 font-cinzel text-base sm:text-lg">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>¿Estás lista?</span>
                  </div>

                  <div className="flex items-center gap-4 w-full justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleYes}
                      className="flex-1 max-w-[130px] py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-medium text-sm tracking-wider uppercase transition-all shadow-lg shadow-emerald-950/20 cursor-pointer"
                    >
                      Sí
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNoInitial}
                      className="flex-1 max-w-[130px] py-2.5 px-4 bg-stone-900 hover:bg-rose-950/30 text-stone-400 hover:text-rose-300 border border-stone-800 hover:border-rose-900/50 rounded-xl font-medium text-sm tracking-wider uppercase transition-all cursor-pointer"
                    >
                      No
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          /* ESCENA OSCURA SI ELIGE "NO" */
          <motion.div
            key="rules-angry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center select-none"
          >
            {/* Fondo con viñeta roja tenue */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(120,0,0,0.25)_0%,_rgba(0,0,0,0.95)_70%)] pointer-events-none" />

            <div className="relative z-10 max-w-md flex flex-col items-center">
              {/* Texto exigido por el usuario */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: [0.7, 1.15, 1], opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="mb-8"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-rose-500 tracking-wider drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]">
                  😡😡😡 Altoque ya?
                </h1>
              </motion.div>

              {/* Nuevas opciones: El 'No' se transforma en 'Sí' cuando el cursor pasa por encima */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="w-full flex flex-col items-center gap-4"
              >
                <span className="text-neutral-300 font-cinzel text-sm sm:text-base tracking-widest uppercase">
                  ¿Estás lista?
                </span>

                <div className="flex items-center gap-4 w-full justify-center">
                  {/* Botón original de Sí (se queda siempre en Sí) */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleYes}
                    className="flex-1 max-w-[140px] py-3 px-5 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/50 rounded-xl font-bold text-base tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Sí</span>
                  </motion.button>

                  {/* Botón que originalmente es No, pero en cuanto el cursor se mueve hacia él se transforma en Sí, y al salir vuelve a ser No */}
                  <motion.button
                    onMouseEnter={handleNoMouseEnter}
                    onMouseLeave={handleNoMouseLeave}
                    onPointerEnter={handleNoMouseEnter}
                    onPointerLeave={handleNoMouseLeave}
                    onTouchStart={handleNoMouseEnter}
                    onTouchEnd={handleNoMouseLeave}
                    onTouchCancel={handleNoMouseLeave}
                    onClick={handleSecondNoClick}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 max-w-[140px] py-3 px-5 rounded-xl font-bold text-base tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      noHovered
                        ? 'bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'bg-stone-900 text-stone-400 border border-stone-800'
                    }`}
                  >
                    {noHovered && <Check className="w-4 h-4 text-emerald-400" />}
                    <span>{noHovered ? 'Sí' : 'No'}</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Velo de transición final */}
      {isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-black z-50 pointer-events-none"
        />
      )}
    </div>
  );
};
