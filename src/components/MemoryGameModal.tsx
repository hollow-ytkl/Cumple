import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, Sparkles, Trophy, Lightbulb, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/audioSystem';
import { CONFIG } from '../config';

// 8 Fotografías: las 4 de la galería actual + las 4 fotografías de recuerdos vintage
import photo1Img from '../assets/images/photo_white_smiling_creature_1791331520187.jpg';
import photo2Img from '../assets/images/photo_sitting_alien_creature_1791331534820.jpg';
import photo3Img from '../assets/images/photo_sphynx_glasses_buff_1791331547438.jpg';
import photo4Img from '../assets/images/photo_cat_human_smile_filter_1791331561073.jpg';
import vintageCatImg from '../assets/images/vintage_cat_ribbon_1791325597429.jpg';
import vintageFriendsImg from '../assets/images/vintage_memory_friends_1791325612536.jpg';
import vintageCoastImg from '../assets/images/vintage_memory_coast_1791325624032.jpg';
import vintageNightlightsImg from '../assets/images/vintage_memory_nightlights_1791325639006.jpg';

export interface MemoryCard {
  id: string; // único por carta en el tablero (0 a 15)
  pairId: string; // identificador común para el par (1 a 8)
  title: string;
  src: string;
}

const MEMORY_ITEMS: { pairId: string; title: string; src: string }[] = [
  { pairId: 'pair-1', title: 'Felicidad Desbordante', src: photo1Img },
  { pairId: 'pair-2', title: 'Postura Existencial', src: photo2Img },
  { pairId: 'pair-3', title: 'El Intelectual con Gafas', src: photo3Img },
  { pairId: 'pair-4', title: 'La Mejor Sonrisa', src: photo4Img },
  { pairId: 'pair-5', title: 'Gato con la Vincha Secreta', src: vintageCatImg },
  { pairId: 'pair-6', title: 'Compañeros en la Tarde', src: vintageFriendsImg },
  { pairId: 'pair-7', title: 'Atardecer en la Costa', src: vintageCoastImg },
  { pairId: 'pair-8', title: 'Luces Cálidas de Noche', src: vintageNightlightsImg },
];

function generateShuffledCards(): MemoryCard[] {
  const cards: MemoryCard[] = [];
  MEMORY_ITEMS.forEach((item) => {
    cards.push({
      id: `${item.pairId}-a`,
      pairId: item.pairId,
      title: item.title,
      src: item.src,
    });
    cards.push({
      id: `${item.pairId}-b`,
      pairId: item.pairId,
      title: item.title,
      src: item.src,
    });
  });

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

interface MemoryGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameCompleted: () => void;
}

export const MemoryGameModal: React.FC<MemoryGameModalProps> = ({
  isOpen,
  onClose,
  onGameCompleted,
}) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);

  // Inicializar o reiniciar juego
  const startNewGame = () => {
    setCards(generateShuffledCards());
    setFlippedCardIds([]);
    setMatchedPairIds([]);
    setMoves(0);
    setIsProcessing(false);
    setIsGameWon(false);
  };

  useEffect(() => {
    if (isOpen) {
      startNewGame();
    }
  }, [isOpen]);

  const handleCardClick = (card: MemoryCard) => {
    if (isProcessing) return;
    if (matchedPairIds.includes(card.pairId)) return;
    if (flippedCardIds.includes(card.id)) return;

    soundEngine.playPageTurn();

    if (flippedCardIds.length === 0) {
      // Primera carta del turno
      setFlippedCardIds([card.id]);
    } else if (flippedCardIds.length === 1) {
      // Segunda carta del turno
      const firstCardId = flippedCardIds[0];
      const firstCard = cards.find((c) => c.id === firstCardId);

      const newFlipped = [firstCardId, card.id];
      setFlippedCardIds(newFlipped);
      setMoves((m) => m + 1);

      if (firstCard && firstCard.pairId === card.pairId) {
        // ¡Coincidencia!
        setIsProcessing(true);
        setTimeout(() => {
          soundEngine.playBookAppear(matchedPairIds.length);
          const newMatched = [...matchedPairIds, card.pairId];
          setMatchedPairIds(newMatched);
          setFlippedCardIds([]);
          setIsProcessing(false);

          // ¿Completó las 8 parejas?
          if (newMatched.length === MEMORY_ITEMS.length) {
            setIsGameWon(true);
            soundEngine.playGalleryUnlock();
            onGameCompleted();
          }
        }, 550);
      } else {
        // No coinciden
        setIsProcessing(true);
        setTimeout(() => {
          soundEngine.playErrorSubtle();
          setFlippedCardIds([]);
          setIsProcessing(false);
        }, 900);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto select-none">
        {/* Contenedor principal estilo mesa de madera antigua y marco dorado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative w-full max-w-2xl max-h-[94vh] overflow-y-auto bg-[#140d08] border-2 border-[#8c6746] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col p-3 sm:p-5 my-auto"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 10%, #26160d 0%, #130b06 65%, #0a0604 100%)',
          }}
        >
          {/* Adorno vintage en esquinas */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#c29875]/60 pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#c29875]/60 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#c29875]/60 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#c29875]/60 pointer-events-none" />

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-[#24150c] hover:bg-[#3d2415] border border-[#6d4d33] text-[#dfc3a8] hover:text-white transition-colors cursor-pointer z-20"
            title="Cerrar juego"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Encabezado */}
          <div className="text-center mb-3 pr-6 pl-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-950/70 border border-amber-600/40 text-[10px] sm:text-xs text-amber-300 tracking-widest uppercase font-serif-vintage">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Desafío de la Memoria · 8 Fotografías</span>
            </div>
            <h2 className="text-base sm:text-xl font-serif-vintage text-[#f5ebd9] mt-1 font-semibold tracking-wide">
              {isGameWon ? '¡Misterio Revelado!' : 'Encuentra las 8 Parejas'}
            </h2>
            <p className="text-[11px] sm:text-xs text-[#b89477] font-serif-vintage italic mt-0.5">
              {isGameWon
                ? 'Has completado el juego y la pista ha sido descubierta.'
                : 'Empareja las 8 fotos viejas y recuerdos para desbloquear la pista clave.'}
            </p>
          </div>

          {/* Barra de progreso y estadísticas */}
          <div className="flex items-center justify-between bg-[#1f130b] border border-[#4d3320] rounded-lg px-3 py-1.5 mb-3 text-[11px] sm:text-xs text-[#dfc3a8] font-serif-vintage">
            <div className="flex items-center gap-2">
              <span className="text-[#a88262]">Parejas:</span>
              <span className="font-bold text-amber-300">
                {matchedPairIds.length} / {MEMORY_ITEMS.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#a88262]">Intentos:</span>
              <span className="font-bold text-[#f0e2d1]">{moves}</span>
            </div>

            <button
              onClick={startNewGame}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#331e12] hover:bg-[#4a2e1d] border border-[#7a5438] text-[10px] sm:text-xs text-amber-200 transition-colors cursor-pointer"
              title="Reiniciar y barajar cartas"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar</span>
            </button>
          </div>

          {/* Tablero de 16 cartas (4x4) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-2.5 max-w-md mx-auto w-full aspect-square">
            {cards.map((card) => {
              const isFlipped =
                flippedCardIds.includes(card.id) || matchedPairIds.includes(card.pairId);
              const isMatched = matchedPairIds.includes(card.pairId);

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`relative w-full h-full cursor-pointer select-none perspective-[1000px] group ${
                    isMatched ? 'cursor-default' : ''
                  }`}
                >
                  <div
                    className={`relative w-full h-full rounded-lg transition-transform duration-500 [transform-style:preserve-3d] shadow-md ${
                      isFlipped ? '[transform:rotateY(180deg)]' : 'group-hover:scale-[1.03]'
                    }`}
                  >
                    {/* PARTE TRASERA (Boca abajo - Aspecto de baraja antigua / madera y sello) */}
                    <div className="absolute inset-0 w-full h-full rounded-lg bg-gradient-to-br from-[#2c1a10] via-[#1f120a] to-[#120a06] border-2 border-[#6d4d33] flex flex-col items-center justify-center p-1 [backface-visibility:hidden] shadow-inner">
                      <div className="w-full h-full border border-[#8a6343]/40 rounded-sm flex flex-col items-center justify-center bg-[radial-gradient(#4d3320_1px,transparent_1px)] [background-size:8px_8px]">
                        {/* Emblema antiguo de reloj de arena / sello */}
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#180e07] border border-[#a87a53]/60 flex items-center justify-center shadow-xs">
                          <span className="text-[10px] sm:text-xs text-amber-400 font-serif-vintage">
                            ✦
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PARTE DELANTERA (Boca arriba - Fotografía real) */}
                    <div
                      className={`absolute inset-0 w-full h-full rounded-lg bg-[#20150d] border-2 p-1 flex flex-col items-center justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden shadow-xl ${
                        isMatched
                          ? 'border-emerald-500/80 ring-2 ring-emerald-400/50'
                          : 'border-amber-400/90'
                      }`}
                    >
                      {/* Marco polaroid interior */}
                      <div className="relative w-full h-full rounded overflow-hidden bg-black flex items-center justify-center">
                        <img
                          src={card.src}
                          alt={card.title}
                          className="w-full h-full object-cover filter contrast-[1.05]"
                          loading="lazy"
                        />

                        {/* Capa de destello suave */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                        {/* Marca de coincidencia completada */}
                        {isMatched && (
                          <div className="absolute top-1 right-1 bg-emerald-500/90 text-white rounded-full p-0.5 shadow-md">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panel de Victoria y Revelación de Pistas */}
          <AnimatePresence>
            {isGameWon && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-3.5 p-3 sm:p-4 rounded-xl bg-gradient-to-b from-[#2a1b10] to-[#1a0e08] border-2 border-amber-500 shadow-2xl text-center space-y-2"
              >
                <div className="inline-flex items-center gap-1.5 text-amber-300 font-serif-vintage font-bold text-xs sm:text-sm">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>¡Desafío Superado en {moves} intentos!</span>
                </div>

                <div className="space-y-1.5 text-left bg-[#130b06]/90 p-2.5 sm:p-3 rounded-lg border border-amber-800/60 font-serif-vintage text-[11px] sm:text-xs leading-relaxed text-[#f7eee4]">
                  <div className="flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300">Pista 1: </strong>
                      "{CONFIG.galleryHint1}"
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 pt-1 border-t border-[#4a2e18]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300">Segunda revelación: </strong>
                      "{CONFIG.galleryHint2}"
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-white font-serif-vintage font-bold text-xs tracking-wider uppercase shadow-md transition-all cursor-pointer"
                  >
                    Volver a la Galería con la Pista
                  </button>
                  <button
                    onClick={startNewGame}
                    className="py-2 px-3 rounded-lg bg-[#24150c] hover:bg-[#382013] border border-[#6d4d33] text-[#dfc3a8] font-serif-vintage text-xs transition-all cursor-pointer"
                  >
                    Jugar de Nuevo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
