import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CONFIG } from '../config';
import { soundEngine } from '../utils/audioSystem';
import { Sparkles, ArrowRight } from 'lucide-react';
import hpCoverImg from '../assets/images/hp_salamandra_bolsillo_1791329796520.jpg';

interface BookshelfTransitionProps {
  onComplete: () => void;
}

// Balda 1 completa de extremo a extremo (19 libros que llenan todo el ancho)
// El libro de Harry Potter está en la posición 9: como uno más entre el montón, pero con sutil resplandor mágico
const SHELF_ROW_1 = [
  { id: 1, title: 'I', color: 'from-amber-950 to-stone-900', height: 120, width: 28, tilt: 0, isHP: false },
  { id: 2, title: 'II', color: 'from-stone-900 to-amber-900', height: 126, width: 32, tilt: 0, isHP: false },
  { id: 3, title: 'III', color: 'from-zinc-900 to-stone-800', height: 114, width: 24, tilt: 0, isHP: false },
  { id: 4, title: 'IV', color: 'from-emerald-950 to-stone-900', height: 130, width: 34, tilt: -1, isHP: false },
  { id: 5, title: 'V', color: 'from-amber-900 to-stone-900', height: 122, width: 26, tilt: 0, isHP: false },
  { id: 6, title: 'VI', color: 'from-blue-950 to-stone-900', height: 128, width: 30, tilt: 0, isHP: false },
  { id: 7, title: 'VII', color: 'from-stone-950 to-neutral-900', height: 118, width: 25, tilt: 1, isHP: false },
  { id: 8, title: 'VIII', color: 'from-amber-950 to-stone-800', height: 124, width: 28, tilt: 0, isHP: false },
  
  // EL LIBRO DE HARRY POTTER (UNO MÁS ENTRE EL MONTÓN, PERO RESALTA SUTILMENTE)
  { id: 9, title: '⚡', color: 'from-[#3a2010] via-[#5c3518] to-[#26150a]', height: 142, width: 44, tilt: 0, isHP: true },

  { id: 10, title: 'X', color: 'from-stone-900 to-zinc-950', height: 124, width: 28, tilt: 0, isHP: false },
  { id: 11, title: 'XI', color: 'from-neutral-900 to-amber-950', height: 116, width: 26, tilt: -1, isHP: false },
  { id: 12, title: 'XII', color: 'from-amber-950 to-stone-900', height: 128, width: 32, tilt: 0, isHP: false },
  { id: 13, title: 'XIII', color: 'from-red-950 to-stone-900', height: 132, width: 34, tilt: 0, isHP: false },
  { id: 14, title: 'XIV', color: 'from-zinc-950 to-stone-900', height: 120, width: 27, tilt: 1, isHP: false },
  { id: 15, title: 'XV', color: 'from-amber-900 to-yellow-950', height: 126, width: 30, tilt: 0, isHP: false },
  { id: 16, title: 'XVI', color: 'from-stone-900 to-amber-950', height: 118, width: 25, tilt: 0, isHP: false },
  { id: 17, title: 'XVII', color: 'from-emerald-950 to-stone-900', height: 130, width: 32, tilt: -1.5, isHP: false },
  { id: 18, title: 'XVIII', color: 'from-neutral-900 to-stone-800', height: 122, width: 28, tilt: 0, isHP: false },
  { id: 19, title: 'XIX', color: 'from-amber-950 to-stone-900', height: 125, width: 30, tilt: 0, isHP: false },
];

// Balda 2 completa de extremo a extremo (19 libros que llenan todo el ancho)
const SHELF_ROW_2 = [
  { id: 20, title: 'XX', color: 'from-stone-900 to-zinc-950', height: 122, width: 28, tilt: 0 },
  { id: 21, title: 'XXI', color: 'from-amber-950 to-stone-900', height: 128, width: 33, tilt: 0 },
  { id: 22, title: 'XXII', color: 'from-neutral-900 to-amber-950', height: 114, width: 26, tilt: -1 },
  { id: 23, title: 'XXIII', color: 'from-blue-950 to-stone-900', height: 130, width: 31, tilt: 0 },
  { id: 24, title: 'XXIV', color: 'from-stone-900 to-amber-950', height: 118, width: 25, tilt: 0 },
  { id: 25, title: 'XXV', color: 'from-zinc-950 to-stone-900', height: 126, width: 32, tilt: 1 },
  { id: 26, title: 'XXVI', color: 'from-amber-950 to-stone-800', height: 120, width: 29, tilt: 0 },
  { id: 27, title: 'XXVII', color: 'from-red-950 to-stone-900', height: 134, width: 35, tilt: 0 },
  { id: 28, title: 'XXVIII', color: 'from-stone-950 to-zinc-900', height: 112, width: 24, tilt: -1 },
  { id: 29, title: 'XXIX', color: 'from-amber-900 to-yellow-950', height: 127, width: 30, tilt: 0 },
  { id: 30, title: 'XXX', color: 'from-neutral-900 to-stone-800', height: 116, width: 27, tilt: 0 },
  { id: 31, title: 'XXXI', color: 'from-zinc-950 to-amber-950', height: 125, width: 31, tilt: 1.5 },
  { id: 32, title: 'XXXII', color: 'from-stone-900 to-zinc-900', height: 119, width: 26, tilt: 0 },
  { id: 33, title: 'XXXIII', color: 'from-amber-950 to-stone-900', height: 128, width: 33, tilt: 0 },
  { id: 34, title: 'XXXIV', color: 'from-emerald-950 to-stone-900', height: 132, width: 30, tilt: -1 },
  { id: 35, title: 'XXXV', color: 'from-blue-950 to-stone-900', height: 122, width: 28, tilt: 0 },
  { id: 36, title: 'XXXVI', color: 'from-amber-900 to-stone-800', height: 124, width: 29, tilt: 0 },
  { id: 37, title: 'XXXVII', color: 'from-stone-900 to-zinc-950', height: 115, width: 25, tilt: 0 },
  { id: 38, title: 'XXXVIII', color: 'from-neutral-900 to-amber-950', height: 126, width: 32, tilt: 0 },
];

export const BookshelfTransition: React.FC<BookshelfTransitionProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'entering' | 'organizing' | 'book_opening'>('entering');
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [hasTriedWrongBook, setHasTriedWrongBook] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const totalBooks = SHELF_ROW_1.length + SHELF_ROW_2.length;

  const WRONG_BOOK_MESSAGES = [
    'Mhm aqui no we',
    '???',
    'Si lo lees me debes un pan con chorizo',
  ];

  // 1. Entrada de la gran estantería
  useEffect(() => {
    const enterTimer = setTimeout(() => {
      setPhase('organizing');
    }, 1200);
    return () => clearTimeout(enterTimer);
  }, []);

  // 2. Secuencia ordenada: los libros van colocándose uno a uno en la estantería
  useEffect(() => {
    if (phase === 'organizing') {
      if (visibleCount < totalBooks) {
        const interval = setTimeout(() => {
          soundEngine.playBookAppear(visibleCount);
          setVisibleCount((prev) => prev + 1);
        }, 110);
        return () => clearTimeout(interval);
      }
    }
  }, [phase, visibleCount, totalBooks]);

  // Al hacer clic en un libro que no es Harry Potter
  const handleWrongBookClick = () => {
    if (phase === 'book_opening') return;
    setHasTriedWrongBook(true);
    soundEngine.playErrorSubtle();

    // Elegir aleatoriamente uno de los mensajes
    const randomMsg = WRONG_BOOK_MESSAGES[Math.floor(Math.random() * WRONG_BOOK_MESSAGES.length)];
    setErrorMessage(randomMsg);
  };

  // Al hacer clic en el libro de Harry Potter
  const handleHarryPotterClick = () => {
    if (phase === 'book_opening') return;

    if (hasTriedWrongBook) {
      setSuccessMessage('No era tan dificil hijita.');
    }

    setPhase('book_opening');
    soundEngine.playMagicOpen();

    setTimeout(() => {
      onComplete();
    }, 2200);
  };

  return (
    <div className="relative w-full h-screen bg-[#070504] overflow-hidden flex items-center justify-center select-none">
      {/* Fondo de habitación antigua en penumbra */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#18110b] via-[#090604] to-[#040302]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(95,60,28,0.28)_0%,rgba(0,0,0,0.95)_75%)]" />

      {/* Partículas de polvo en suspensión */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-amber-400/40 blur-[1px] animate-pulse" />
        <div className="absolute top-1/2 left-2/3 w-1 h-1 rounded-full bg-amber-200/30 blur-[0.5px] animate-ping" />
        <div className="absolute top-2/3 left-1/4 w-1.5 h-1.5 rounded-full bg-amber-300/40 blur-[1px] animate-pulse" />
      </div>

      {/* Modal / Toast emergente si toca un libro equivocado */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-8 z-50 max-w-md mx-4 px-6 py-4 rounded-xl bg-stone-950/95 border-2 border-rose-600/70 shadow-[0_10px_35px_rgba(225,29,72,0.35)] backdrop-blur-md text-center flex flex-col items-center gap-2"
          >
            <p className="text-rose-300 font-cinzel text-base md:text-lg font-bold tracking-wide">
              {errorMessage}
            </p>
            <button
              onClick={() => setErrorMessage(null)}
              className="mt-1 text-xs px-4 py-1.5 rounded-md bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-200 cursor-pointer transition-all"
            >
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensaje especial al tocar Harry Potter si antes tocó otro libro */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-12 z-50 max-w-md mx-4 px-6 py-4 rounded-xl bg-stone-950/95 border-2 border-amber-500/80 shadow-[0_10px_40px_rgba(245,158,11,0.5)] backdrop-blur-md text-center"
          >
            <p className="text-amber-300 font-cinzel text-lg md:text-xl font-bold tracking-wide">
              ✨ {successMessage} ✨
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* La Gran Estantería de Madera Oscura */}
      <motion.div
        initial={{ x: '-100%', opacity: 0.3 }}
        animate={
          phase === 'entering'
            ? { x: '0%', opacity: 1, scale: 1 }
            : phase === 'book_opening'
            ? { x: '0%', opacity: 1, scale: 1.25, y: -20 }
            : { x: '0%', opacity: 1, scale: 1 }
        }
        transition={{
          duration: phase === 'book_opening' ? 1.8 : 1.2,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative w-[96vw] max-w-6xl h-[82vh] max-h-[660px] rounded-sm p-4 md:p-8 flex flex-col justify-between"
        style={{
          background: 'linear-gradient(145deg, #1c140e 0%, #0d0a07 100%)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), inset 0 0 60px rgba(0, 0, 0, 0.8), inset 0 0 0 2px rgba(110, 75, 45, 0.35)',
        }}
      >
        {/* Molduras talladas de madera */}
        <div className="absolute inset-2 border border-amber-900/30 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-amber-950/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-amber-950/60 to-transparent pointer-events-none" />



        {/* ==============================================================
            BALDA SUPERIOR: CUBRE TODA LA ESTANTERÍA DE EXTREMO A EXTREMO
           ============================================================== */}
        <div className="relative w-full flex-1 flex flex-col justify-end border-b-8 border-stone-900/90 pb-0.5 shadow-[0_6px_14px_rgba(0,0,0,0.8)]">
          <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-amber-950 via-[#271b12] to-amber-950 border-t border-amber-800/20" />
          
          <div className="flex items-end justify-between w-full px-2 z-10 overflow-hidden">
            {SHELF_ROW_1.map((book, idx) => {
              const isVisible = visibleCount > idx;
              if (!isVisible) return <div key={book.id} style={{ width: `${book.width}px` }} />;

              // EL LIBRO DE HARRY POTTER: COMO UNO MÁS ENTRE EL MONTÓN, PERO CON SUTIL DISTINCIÓN
              if (book.isHP) {
                return (
                  <motion.div
                    key="hp-shelf-book"
                    onClick={handleHarryPotterClick}
                    whileHover={{ y: -12, scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      height: `${book.height}px`,
                      width: `${book.width}px`,
                    }}
                    className="relative cursor-pointer group flex flex-col items-center justify-between py-2 rounded-t-xs bg-gradient-to-t from-[#2e190e] via-[#4a2814] to-[#3a1d0d] shadow-[0_0_20px_rgba(245,158,11,0.45)] border-t border-l border-amber-400/80 -translate-y-2 z-20 transition-all"
                  >
                    {/* Resplandor áureo sutil */}
                    <div className="absolute -inset-1 bg-amber-400/20 rounded-xs blur-sm pointer-events-none animate-pulse" />

                    {/* Lomo del libro con detalles dorados y rayo */}
                    <div className="relative z-10 w-full px-1 flex flex-col items-center">
                      <div className="w-full h-0.5 bg-amber-400/60 mb-1" />
                      <span className="text-[10px] text-amber-300 font-bold drop-shadow">⚡</span>
                    </div>

                    <div className="relative z-10 rotate-90 whitespace-nowrap text-[8.5px] font-cinzel font-bold text-amber-200 tracking-widest uppercase drop-shadow">
                      H. POTTER
                    </div>

                    <div className="relative z-10 w-full px-1 flex flex-col items-center">
                      <div className="w-full h-0.5 bg-amber-400/60" />
                    </div>

                    {/* Vista previa emergente de la portada oficial al pasar el ratón */}
                    <div className="absolute -top-44 left-1/2 -translate-x-1/2 w-32 h-44 rounded-sm overflow-hidden border-2 border-amber-400 shadow-2xl bg-black pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 p-1 flex items-center justify-center">
                      <img
                        src={hpCoverImg || CONFIG.harryPotterCoverSrc}
                        alt="Harry Potter y la piedra filosofal"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </motion.div>
                );
              }

              // Libros normales de la balda superior que cubren el estante
              return (
                <motion.div
                  key={book.id}
                  onClick={handleWrongBookClick}
                  whileHover={{ y: -4 }}
                  style={{
                    height: `${book.height}px`,
                    width: `${book.width}px`,
                  }}
                  className={`relative rounded-t-xs bg-gradient-to-t ${book.color} shadow-lg border-t border-l border-amber-500/20 flex flex-col items-center justify-between py-2 cursor-pointer transition-transform`}
                >
                  <div className="w-full px-0.5 flex flex-col items-center">
                    <div className="w-full h-0.5 bg-amber-500/20 mb-1" />
                  </div>
                  <span className="text-[7.5px] tracking-widest text-neutral-500 select-none">
                    {book.title}
                  </span>
                  <div className="w-full px-0.5 flex flex-col items-center">
                    <div className="w-full h-0.5 bg-amber-500/20" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ==============================================================
            BALDA INFERIOR: CUBRE TODA LA ESTANTERÍA DE EXTREMO A EXTREMO
           ============================================================== */}
        <div className="relative w-full flex-1 flex flex-col justify-end border-b-8 border-stone-900/90 pb-0.5 shadow-[0_6px_14px_rgba(0,0,0,0.8)] mt-6">
          <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-amber-950 via-[#271b12] to-amber-950 border-t border-amber-800/20" />
          
          <div className="flex items-end justify-between w-full px-2 z-10 overflow-hidden">
            {SHELF_ROW_2.map((book, idx) => {
              const globalIdx = idx + SHELF_ROW_1.length;
              const isVisible = visibleCount > globalIdx;
              if (!isVisible) return <div key={book.id} style={{ width: `${book.width}px` }} />;

              return (
                <motion.div
                  key={book.id}
                  onClick={handleWrongBookClick}
                  whileHover={{ y: -4 }}
                  style={{
                    height: `${book.height}px`,
                    width: `${book.width}px`,
                  }}
                  className={`relative rounded-t-xs bg-gradient-to-t ${book.color} shadow-lg border-t border-l border-amber-500/20 flex flex-col items-center justify-between py-2 cursor-pointer transition-transform`}
                >
                  <div className="w-full px-0.5 flex flex-col items-center">
                    <div className="w-full h-0.5 bg-amber-500/20 mb-1" />
                  </div>
                  <span className="text-[7.5px] tracking-widest text-neutral-500 select-none">
                    {book.title}
                  </span>
                  <div className="w-full px-0.5 flex flex-col items-center">
                    <div className="w-full h-0.5 bg-amber-500/20" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Pie con indicación */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] tracking-[0.25em] text-stone-400 font-cinzel uppercase">
            {phase === 'book_opening' ? 'Accediendo a la biblioteca arcana...' : 'Toca el libro correcto para cruzar el umbral'}
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>
      </motion.div>

      {/* Transición de luz al hacer clic en el libro */}
      {phase === 'book_opening' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4 }}
          className="fixed inset-0 bg-gradient-to-b from-amber-200/40 via-stone-950 to-black z-50 pointer-events-none"
        />
      )}
    </div>
  );
};
