import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CONFIG } from '../config';
import { soundEngine } from '../utils/audioSystem';
import { Sparkles, HelpCircle, CheckCircle2, Heart } from 'lucide-react';

interface Stage6MysteryQuestionProps {
  onComplete: () => void;
}

interface SubmittedFavorite {
  id: string;
  word: string;
  reaction: string;
}

// Función para remover tildes y caracteres especiales para comparación infalible
const stripAccents = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const Stage6MysteryQuestion: React.FC<Stage6MysteryQuestionProps> = ({ onComplete }) => {
  const [answerInput, setAnswerInput] = useState('');
  const [submittedFavorites, setSubmittedFavorites] = useState<SubmittedFavorite[]>([]);
  const [currentReaction, setCurrentReaction] = useState<string>('');
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string>('');

  const secretClickCount = useRef(0);
  const timerStartedRef = useRef(false);

  const handleSecretSkip = () => {
    secretClickCount.current += 1;
    if (secretClickCount.current >= 3 && isTimerRunning) {
      triggerFinalReveal();
    }
  };

  const triggerFinalReveal = () => {
    setIsRevealed(true);
    soundEngine.playStartChime();

    setTimeout(() => {
      onComplete();
    }, 4500);
  };

  // Clasificador de respuesta
  const evaluateAnswer = (rawInput: string): { matchedCategory: string; reaction: string } | null => {
    const cleaned = stripAccents(rawInput);

    // DULCE (singular y plural, con y sin tilde)
    if (cleaned === 'dulce' || cleaned === 'dulces') {
      return { matchedCategory: 'dulce', reaction: 'estás muy muy muy cerca' };
    }

    // TOFFEE / TOFE / TOFI (singular y plural)
    if (
      cleaned === 'toffee' ||
      cleaned === 'toffees' ||
      cleaned === 'toffe' ||
      cleaned === 'tofes' ||
      cleaned === 'tofi' ||
      cleaned === 'tofis' ||
      cleaned === 'toffie' ||
      cleaned === 'toffies'
    ) {
      return { matchedCategory: 'toffee', reaction: 'estás muy muy cerca' };
    }

    // TURRÓN / TURRON / TURRONES (singular y plural, con y sin tilde)
    if (cleaned === 'turron' || cleaned === 'turrones') {
      return { matchedCategory: 'turron', reaction: 'cerca' };
    }

    // CAFÉ / CAFE / CAFÉS / CAFES (singular y plural, con y sin tilde)
    if (cleaned === 'cafe' || cleaned === 'cafes') {
      return { matchedCategory: 'cafe', reaction: 'muy cerca, qué buen gusto...' };
    }

    // CHOCOTEJA / CHOCOTEJAS (singular y plural)
    if (cleaned === 'chocoteja' || cleaned === 'chocotejas') {
      return { matchedCategory: 'chocoteja', reaction: 'estás muy muy muy cerca' };
    }

    // KISS / KISSES / KIS / KISES (singular y plural)
    if (cleaned === 'kiss' || cleaned === 'kisses' || cleaned === 'kis' || cleaned === 'kises') {
      return { matchedCategory: 'kiss', reaction: 'muy cerca...' };
    }

    // CONEJO (singular y plural, conejito/s)
    if (
      cleaned === 'conejo' ||
      cleaned === 'conejos' ||
      cleaned === 'coneja' ||
      cleaned === 'conejas' ||
      cleaned === 'conejito' ||
      cleaned === 'conejitos' ||
      cleaned === 'conejita' ||
      cleaned === 'conejitas'
    ) {
      return { matchedCategory: 'conejo', reaction: 'estás muy muy cerca' };
    }

    // DIBUJO (singular y plural, dibujito/s)
    if (
      cleaned === 'dibujo' ||
      cleaned === 'dibujos' ||
      cleaned === 'dibujar' ||
      cleaned === 'dibujito' ||
      cleaned === 'dibujitos'
    ) {
      return { matchedCategory: 'dibujo', reaction: 'estás muy muy cerca' };
    }

    // REI (singular y plural, rei ayanami)
    if (
      cleaned === 'rei' ||
      cleaned === 'reis' ||
      cleaned === 'rei ayanami' ||
      cleaned === 'ayanami rei' ||
      cleaned === 'ayanami'
    ) {
      return { matchedCategory: 'rei', reaction: 'estás muy muy cerca' };
    }

    // ATTACK ON TITAN (singular y plural, aot, shingeki)
    if (
      cleaned === 'attack on titan' ||
      cleaned === 'attacks on titan' ||
      cleaned === 'aot' ||
      cleaned === 'shingeki' ||
      cleaned === 'shingeki no kyojin' ||
      cleaned === 'ataque a los titanes' ||
      cleaned === 'ataque de los titanes' ||
      cleaned === 'titanes'
    ) {
      return { matchedCategory: 'attack on titan', reaction: 'estás muy muy cerca' };
    }

    // PALETA (singular y plural, paletita/s)
    if (
      cleaned === 'paleta' ||
      cleaned === 'paletas' ||
      cleaned === 'paletita' ||
      cleaned === 'paletitas'
    ) {
      return { matchedCategory: 'paleta', reaction: 'estás muy muy cerca' };
    }

    // CHUPETIN (singular y plural, chupetin/chupetines/chupete/chupetes)
    if (
      cleaned === 'chupetin' ||
      cleaned === 'chupetines' ||
      cleaned === 'chupete' ||
      cleaned === 'chupetes'
    ) {
      return { matchedCategory: 'chupetin', reaction: 'estás muy muy cerca' };
    }

    // FRUNA (singular y plural, frunita/s)
    if (
      cleaned === 'fruna' ||
      cleaned === 'frunas' ||
      cleaned === 'frunita' ||
      cleaned === 'frunitas'
    ) {
      return { matchedCategory: 'fruna', reaction: 'estás muy muy cerca' };
    }

    // TRUFAS (singular y plural, trufita/s)
    if (
      cleaned === 'trufa' ||
      cleaned === 'trufas' ||
      cleaned === 'trufita' ||
      cleaned === 'trufitas'
    ) {
      return { matchedCategory: 'trufa', reaction: 'estás muy muy cerca' };
    }

    return null;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!answerInput.trim()) return;

    const match = evaluateAnswer(answerInput);

    if (match) {
      setErrorNotice('');
      setCurrentReaction(match.reaction);
      soundEngine.playAnalysisPulse();

      // Guardar en la lista de respuestas ingresadas si no estaba ya
      setSubmittedFavorites((prev) => {
        const cleaned = stripAccents(answerInput);
        const alreadyExists = prev.some((item) => stripAccents(item.word) === cleaned);
        if (alreadyExists) return prev;
        return [
          ...prev,
          {
            id: `${cleaned}-${Date.now()}`,
            word: answerInput.trim(),
            reaction: match.reaction,
          },
        ];
      });

      // Limpiar el campo de texto para que pueda seguir colocando más respuestas
      setAnswerInput('');

      // Iniciar el temporizador oculto de 60 segundos con la primera respuesta válida
      if (!timerStartedRef.current) {
        timerStartedRef.current = true;
        setIsTimerRunning(true);

        const timer = setTimeout(() => {
          triggerFinalReveal();
        }, CONFIG.hiddenTimerMs);

        // Pulsos sutiles en segundo plano cada 12 segundos
        const pulseInterval = setInterval(() => {
          soundEngine.playAnalysisPulse();
        }, 12000);

        return () => {
          clearTimeout(timer);
          clearInterval(pulseInterval);
        };
      }
    } else {
      soundEngine.playErrorSubtle();
      setErrorNotice('Mmm... piensa en algo que te encante de verdad.');
      setTimeout(() => setErrorNotice(''), 3500);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#020509] text-neutral-100 flex flex-col justify-between p-4 md:p-8 overflow-hidden select-none">
      {/* Fondo misterioso abisal */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,45,70,0.32)_0%,rgba(2,5,9,0.98)_75%)] pointer-events-none" />

      {/* Partículas abisales flotantes */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.15, y: 0 }}
            animate={{
              y: [-12, 12, -12],
              opacity: [0.15, 0.55, 0.15],
            }}
            transition={{
              duration: 5 + (i % 4),
              repeat: Infinity,
              delay: i * 0.35,
              ease: 'easeInOut',
            }}
            style={{
              top: `${12 + (i * 7) % 72}%`,
              left: `${6 + (i * 9) % 86}%`,
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300/35 blur-[0.5px]"
          />
        ))}
      </div>



      {/* Escenario Central */}
      <main className="relative z-10 max-w-xl mx-auto w-full my-auto flex flex-col items-center text-center px-4">
        <AnimatePresence mode="wait">
          {!isRevealed ? (
            <motion.div
              key="active_mystery_area"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="w-full space-y-6"
            >
              {/* Pregunta principal sin ningún ejemplo */}
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif-vintage tracking-wide text-cyan-50">
                  "Algo que te gusta"
                </h2>
              </div>

              {/* Reacción activa más reciente */}
              <AnimatePresence mode="wait">
                {currentReaction && (
                  <motion.div
                    key={currentReaction}
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 bg-sky-950/40 border border-cyan-600/40 rounded-xl backdrop-blur-md shadow-lg"
                  >
                    <span className="text-[10px] tracking-[0.25em] uppercase text-cyan-400 font-cinzel">
                      Sensación detectada:
                    </span>
                    <p className="text-base md:text-lg font-serif-vintage italic text-cyan-100 mt-0.5 capitalize">
                      "{currentReaction}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Formulario sin ejemplos en el placeholder */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    className="w-full py-3.5 px-5 bg-sky-950/45 border border-cyan-800/60 rounded-full text-center text-cyan-100 placeholder-cyan-700/60 font-serif-vintage text-base tracking-wider focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all shadow-inner backdrop-blur-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!answerInput.trim()}
                  className="w-full py-3 px-8 rounded-full text-xs font-cinzel tracking-[0.25em] uppercase font-semibold bg-gradient-to-r from-cyan-900 via-cyan-800 to-cyan-900 hover:from-cyan-800 hover:to-cyan-700 text-cyan-100 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  {submittedFavorites.length > 0 ? 'AGREGAR OTRO FAVORITO' : 'ENVIAR RESPUESTA'}
                </button>

                <AnimatePresence>
                  {errorNotice && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-amber-300 font-serif-vintage italic"
                    >
                      {errorNotice}
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>

              {/* Historial de respuestas válidas ingresadas (dulce, toffee, turrón, café...) */}
              {submittedFavorites.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] tracking-widest uppercase text-cyan-500 font-cinzel block mb-2">
                    Tus elecciones reconocidas:
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {submittedFavorites.map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-600/50 text-xs text-cyan-200 font-serif-vintage shadow-sm capitalize"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{item.word}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Procesando en segundo plano de forma misteriosa sin mostrar números de 60 a 0 */}
              {isTimerRunning && (
                <div
                  onClick={handleSecretSkip}
                  className="cursor-pointer space-y-2 pt-2 pb-1"
                  title="Analizando..."
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                  </div>
                  <p className="text-xs font-cinzel tracking-[0.25em] uppercase text-cyan-300/75">
                    {CONFIG.hiddenTimerProcessingText}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            /* Revelación final tras los 60 segundos */
            <motion.div
              key="final_reveal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2 }}
              className="space-y-4 p-6 md:p-8 bg-cyan-950/50 border border-cyan-400/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.4)] backdrop-blur-lg"
            >
              <Sparkles className="w-8 h-8 mx-auto text-amber-300 animate-spin" />
              <h3 className="text-xl md:text-2xl font-serif-vintage italic text-cyan-100 font-medium leading-relaxed">
                "{CONFIG.hiddenTimerRevealText}"
              </h3>
              <p className="text-xs text-cyan-300/80 font-cinzel tracking-widest uppercase">
                Todo está listo para la sorpresa final...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Pie de página */}
      <footer className="relative z-10 text-center pb-2">
        <span className="text-[9px] tracking-widest uppercase text-cyan-700/60 font-mono">
          SECUENCIA FINAL EN CURSO
        </span>
      </footer>
    </div>
  );
};
