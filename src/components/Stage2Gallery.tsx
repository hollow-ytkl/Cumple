import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CONFIG } from '../config';
import { soundEngine } from '../utils/audioSystem';
import { Lightbulb, KeyRound, Sparkles, Gamepad2 } from 'lucide-react';
import { MemoryGameModal } from './MemoryGameModal';

import photo1Img from '../assets/images/photo_white_smiling_creature_1791331520187.jpg';
import photo2Img from '../assets/images/photo_sitting_alien_creature_1791331534820.jpg';
import photo3Img from '../assets/images/photo_sphynx_glasses_buff_1791331547438.jpg';
import photo4Img from '../assets/images/photo_cat_human_smile_filter_1791331561073.jpg';

interface Stage2GalleryProps {
  onComplete: () => void;
}

// Configuración de las 4 fotografías enviadas por el usuario
// Con disposición orgánica mediante CSS Grid y ángulos seguros para móvil sin desbordamiento
const GALLERY_ITEMS = [
  {
    id: 'photo-1',
    title: 'Felicidad Desbordante',
    handwrittenNote: 'cuando la emoción no cabe en el cuerpo...',
    src: photo1Img,
    fallbackSrc: '/assets/photos/photo-1.jpg',
    isTarget: false,
    tapeAngle: '-rotate-6 left-6',
    // Estilos orgánicos con Tailwind: seguros en móvil (sin translate-x, rotación mínima), orgánicos en desktop
    containerClasses: 'col-span-1 sm:translate-y-3 md:translate-y-4',
    cardRotationClasses: '-rotate-[1.2deg] sm:-rotate-[5deg]',
  },
  {
    id: 'photo-2',
    title: 'Postura Existencial',
    handwrittenNote: 'en el sillón pensando en el sentido de la vida...',
    src: photo2Img,
    fallbackSrc: '/assets/photos/photo-2.jpg',
    isTarget: false,
    tapeAngle: 'rotate-8 right-6',
    containerClasses: 'col-span-1 sm:-translate-y-4 md:-translate-y-5',
    cardRotationClasses: 'rotate-[1.5deg] sm:rotate-[4.2deg]',
  },
  {
    id: 'photo-3-target',
    title: 'El Intelectual Musculoso',
    handwrittenNote: 'míralo con sus gafas... lleva algo clave grabado',
    src: photo3Img,
    fallbackSrc: '/assets/photos/photo-3.jpg',
    isTarget: true, // Foto clave relacionada a la pista
    tapeAngle: '-rotate-4 left-8',
    containerClasses: 'col-span-1 sm:translate-y-5 md:translate-y-6',
    cardRotationClasses: '-rotate-[1deg] sm:-rotate-[4.5deg]',
  },
  {
    id: 'photo-4',
    title: 'La Mejor Sonrisa',
    handwrittenNote: 'una mirada radiante que ilumina todo el cuarto...',
    src: photo4Img,
    fallbackSrc: '/assets/photos/photo-4.jpg',
    isTarget: false,
    tapeAngle: 'rotate-6 right-6',
    containerClasses: 'col-span-1 sm:-translate-y-3 md:-translate-y-4',
    cardRotationClasses: 'rotate-[1.2deg] sm:rotate-[5.5deg]',
  },
];

export const Stage2Gallery: React.FC<Stage2GalleryProps> = ({ onComplete }) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [hintLevel, setHintLevel] = useState<number>(0); // 0 = sin pista, 1 = pista 1, 2 = pista 2
  const [showHintBox, setShowHintBox] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isMemoryGameOpen, setIsMemoryGameOpen] = useState<boolean>(false);
  const [memoryGameCompleted, setMemoryGameCompleted] = useState<boolean>(false);

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanAttempt = normalize(passwordInput);
    const cleanTarget = normalize(CONFIG.firstPassword);

    if (cleanAttempt === cleanTarget) {
      setErrorMessage('');
      setIsUnlocked(true);
      soundEngine.playGalleryUnlock();

      // Transición cinematográfica: la luz revela la estantería secreta
      setTimeout(() => {
        onComplete();
      }, 2400);
    } else {
      soundEngine.playErrorSubtle();

      // LÓGICA DE PISTAS: Si ya vio la primera pista y falla, se revela la segunda ("esta en cierta vincha")
      if (hintLevel >= 1 || memoryGameCompleted) {
        setHintLevel(2);
        setShowHintBox(true);
        setErrorMessage('Palabra incorrecta. Una nueva pista ha emergido: "esta en cierta vincha"');
      } else {
        setErrorMessage(CONFIG.galleryErrorMsg);
      }

      setTimeout(() => {
        setErrorMessage('');
      }, 4500);
    }
  };

  const handleRequestHint = () => {
    soundEngine.playHintChime();
    // Abrir inmediatamente el juego de memoria con las 8 fotos
    setIsMemoryGameOpen(true);
  };

  const handleMemoryGameCompleted = () => {
    setMemoryGameCompleted(true);
    setHintLevel(2);
    setShowHintBox(true);
  };

  return (
    <div className="relative w-full min-h-screen max-h-screen bg-[#110c08] text-[#e8ded5] flex flex-col justify-between p-2 sm:p-3 md:p-5 overflow-hidden select-none">
      {/* Modal del Juego de Memoria con 8 Parejas */}
      <MemoryGameModal
        isOpen={isMemoryGameOpen}
        onClose={() => setIsMemoryGameOpen(false)}
        onGameCompleted={handleMemoryGameCompleted}
      />

      {/* Fondo de pared de madera antigua con papel tapiz desgastado */}
      <div
        className="absolute inset-0 pointer-events-none opacity-90"
        style={{
          background: 'radial-gradient(ellipse 90% 65% at 50% 20%, #2a1c12 0%, #150d07 55%, #0a0604 100%)',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(#3a2517_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-25 pointer-events-none" />
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.95)] pointer-events-none" />

      {/* Resplandor dorado de éxito cuando se resuelve el acertijo */}
      <AnimatePresence>
        {isUnlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.35)_0%,rgba(0,0,0,0.85)_80%)] pointer-events-none z-30"
          />
        )}
      </AnimatePresence>

      {/* Encabezado elegante y pista inicial */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-20 text-center max-w-xl mx-auto pt-1 sm:pt-2 px-2 shrink-0"
      >
        <h1 className="mt-0.5 text-base sm:text-xl md:text-2xl font-serif-vintage tracking-wide text-[#f7eee4] font-normal drop-shadow-md">
          "{CONFIG.galleryPrompt}"
        </h1>

        <p className="mt-0.5 text-[11px] sm:text-xs text-[#a88a73] font-serif-vintage italic">
          Fotografías gastadas por los años, fijas sobre la madera...
        </p>

        {/* Botón de Pistas & Juego de Memoria */}
        <div className="mt-1.5 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestHint}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-300 shadow-md cursor-pointer ${
                memoryGameCompleted
                  ? 'border-amber-400 bg-amber-950/80 hover:bg-amber-900 text-amber-200'
                  : 'border-[#8a6547]/60 bg-[#1e130c]/90 hover:bg-[#2c1d12] hover:border-[#b89578] text-[#e5c5a7]'
              } text-[11px] sm:text-xs tracking-wider`}
            >
              {memoryGameCompleted ? (
                <>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span className="font-serif-vintage">Pista desbloqueada · Jugar memoria</span>
                </>
              ) : (
                <>
                  <Lightbulb className="w-3 h-3 text-amber-400" />
                  <span className="font-serif-vintage">¿Necesitas una pista?</span>
                </>
              )}
            </button>

            {memoryGameCompleted && (
              <button
                onClick={() => setShowHintBox((prev) => !prev)}
                className="px-2.5 py-1 rounded-full border border-[#6d4d33] bg-[#1a110a] hover:bg-[#281a10] text-[10px] sm:text-[11px] text-[#d4b090] font-serif-vintage transition-all cursor-pointer"
                title="Mostrar u ocultar notas de pista"
              >
                {showHintBox ? 'Ocultar pista' : 'Ver pista'}
              </button>
            )}
          </div>

          {/* Cuadro de pistas dinámico */}
          <AnimatePresence>
            {showHintBox && (hintLevel >= 1 || memoryGameCompleted) && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="mt-2 p-2.5 sm:p-3 max-w-md w-full bg-[#1c120a]/95 border border-[#8f6848] rounded-xl shadow-2xl text-center space-y-1.5 backdrop-blur-md z-40"
              >
                {/* Pista 1 */}
                <div className="text-[11px] sm:text-xs text-[#f5dbbf] font-serif-vintage italic leading-relaxed">
                  <span className="font-bold text-amber-400 not-italic block mb-0.5">Pista del Juego de Memoria:</span>
                  "{CONFIG.galleryHint1}"
                </div>

                {/* Pista 2 */}
                {(hintLevel >= 2 || memoryGameCompleted) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-1.5 border-t border-[#6d4d33]/60 text-[11px] sm:text-xs text-amber-300 font-serif-vintage italic font-medium"
                  >
                    <span className="text-[9px] uppercase tracking-widest text-amber-500 font-cinzel block not-italic">
                      Segunda revelación:
                    </span>
                    "{CONFIG.galleryHint2}"
                  </motion.div>
                )}

                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    onClick={() => setIsMemoryGameOpen(true)}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <Gamepad2 className="w-3 h-3" />
                    Abrir desafío de memoria
                  </button>
                  <button
                    onClick={() => setShowHintBox(false)}
                    className="text-[9px] text-[#9c785d] hover:text-[#d4b090] underline cursor-pointer"
                  >
                    Ocultar nota
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* =========================================================================
          CONTENEDOR DE FOTOGRAFÍAS COMPACTO: VISIBLE EN UNA SOLA VISTA SIN SCROLL
          El selector div#root > div > div:nth-of-type(3) > div > main > div
         ========================================================================= */}
      <main className="relative z-10 my-auto max-w-5xl mx-auto w-full px-2 sm:px-4 flex-1 flex items-center justify-center min-h-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-5 justify-items-center items-center w-full max-w-4xl mx-auto">
          {GALLERY_ITEMS.map((photo, index) => {
            return (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.08 }}
                className="relative w-full max-w-[135px] sm:max-w-[170px] md:max-w-[200px] flex flex-col items-center pointer-events-none select-none"
              >
                {/* Chincheta / Clavo oxidado en la parte superior con sombra */}
                <div className="relative z-30 -mb-2 flex items-center justify-center">
                  <div className="w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full bg-gradient-to-br from-amber-600 via-amber-800 to-stone-900 border border-amber-500/80 shadow-[0_2px_5px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-amber-400/80 shadow" />
                  </div>
                  <div className="absolute top-2 left-1 w-2 h-1.5 bg-black/70 rounded-full blur-[1px] pointer-events-none" />
                </div>

                {/* Cinta adhesiva vieja en la esquina */}
                <div
                  className={`absolute -top-1 z-20 w-8 sm:w-10 h-3.5 sm:h-4 bg-[#e8d7be]/65 border border-[#c4af92]/60 shadow-xs pointer-events-none ${photo.tapeAngle}`}
                  style={{ backdropFilter: 'blur(0.5px)' }}
                />

                {/* TARJETA FOTOGRÁFICA VIEJA Y DESGASTADA COMPACTA */}
                <div
                  className={`relative w-full rounded-xs p-1.5 sm:p-2 shadow-[0_10px_24px_rgba(0,0,0,0.88),0_2px_8px_rgba(0,0,0,0.8)] border border-[#c5ad94] transition-transform ${photo.cardRotationClasses} ${
                    photo.isTarget
                      ? 'bg-[#f4ebe0] ring-1 ring-amber-400/50'
                      : 'bg-[#f0e4d5]'
                  }`}
                >
                  {/* Textura de papel envejecido con sombras interiores */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#f8f2e8] via-[#ebe0cf] to-[#decbb3] opacity-95 rounded-xs pointer-events-none" />
                  <div className="absolute inset-0 shadow-[inset_0_0_16px_rgba(110,80,50,0.22)] pointer-events-none" />

                  {/* IMAGEN NÍTIDA Y VISIBLE */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xs border border-[#bfa58a] bg-[#1a120c] shadow-inner">
                    <img
                      src={photo.src}
                      alt={photo.title}
                      className="w-full h-full object-cover filter contrast-[1.05] brightness-[1.01]"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== photo.fallbackSrc) {
                          target.src = photo.fallbackSrc;
                        }
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#26170c]/20 via-transparent to-[#4a2e18]/10 pointer-events-none" />
                    <div className="absolute inset-0 shadow-[inset_0_0_12px_rgba(0,0,0,0.35)] pointer-events-none" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Formulario de Contraseña Integrado en la Pared */}
      <motion.footer
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-20 max-w-sm sm:max-w-md mx-auto w-full pb-2 px-3 shrink-0"
      >
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#967459]">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              disabled={isUnlocked}
              placeholder="Introduce la palabra secreta..."
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-[#18110b]/95 border border-[#5c402d] rounded-full text-[#f7eee4] placeholder-[#8c6d54] text-xs sm:text-sm tracking-wider font-serif-vintage focus:outline-none focus:border-[#c29875] focus:ring-2 focus:ring-[#c29875]/30 transition-all text-center shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isUnlocked || !passwordInput.trim()}
            className="w-full py-2 sm:py-2.5 px-5 rounded-full bg-gradient-to-r from-[#8a5d3b] via-[#a8744f] to-[#8a5d3b] hover:from-[#9c6a43] hover:to-[#9c6a43] text-[#f7eee4] font-serif-vintage text-[11px] sm:text-xs tracking-[0.25em] uppercase font-semibold transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.6)] border border-[#c29875]/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isUnlocked ? 'DESBLOQUEANDO PASAJE...' : 'DESBLOQUEAR RECUERDO'}
          </button>

          <AnimatePresence>
            {errorMessage && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-amber-400 font-serif-vintage italic text-center mt-0.5"
              >
                {errorMessage}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </motion.footer>
    </div>
  );
};
