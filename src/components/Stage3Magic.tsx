import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CONFIG } from '../config';
import { soundEngine } from '../utils/audioSystem';
import { Sparkles, Play, Pause } from 'lucide-react';
import hpCoverImg from '../assets/images/hp_salamandra_bolsillo_1791329796520.jpg';

interface Stage3MagicProps {
  onComplete: () => void;
}

// Velas flotantes místicas
const FLOATING_CANDLES = [
  { id: 1, x: '12%', y: '18%', delay: 0 },
  { id: 2, x: '25%', y: '12%', delay: 1.2 },
  { id: 3, x: '72%', y: '16%', delay: 0.6 },
  { id: 4, x: '88%', y: '22%', delay: 1.8 },
  { id: 5, x: '50%', y: '8%', delay: 2.3 },
];

export const Stage3Magic: React.FC<Stage3MagicProps> = ({ onComplete }) => {
  const [bookState, setBookState] = useState<'closed' | 'opening' | 'open'>('closed');
  const [spellInput, setSpellInput] = useState('');
  const [spellError, setSpellError] = useState('');
  const [isLumosTriggered, setIsLumosTriggered] = useState(false);
  const [showSpellHint, setShowSpellHint] = useState(false);

  // Estados de audio simplificados: pausar y reanudar la música
  const [isPlayingMusic, setIsPlayingMusic] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Enviar comando seguro a la API de YouTube Iframe
  const sendIframeCommand = (func: string, args: unknown[] = []) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      }
    } catch {
      // Ignorar errores al inicializar
    }
  };

  const playAllAudio = () => {
    setIsPlayingMusic(true);
    soundEngine.setMasterVolume(1.0);
    sendIframeCommand('unMute', []);
    sendIframeCommand('setVolume', [100]);
    sendIframeCommand('playVideo', []);
  };

  const pauseAllAudio = () => {
    setIsPlayingMusic(false);
    sendIframeCommand('pauseVideo', []);
    soundEngine.stopHedwigTheme();
  };

  const toggleMusic = () => {
    if (isPlayingMusic) {
      pauseAllAudio();
    } else {
      playAllAudio();
    }
  };

  // Intentos proactivos al entrar en la escena mágica
  useEffect(() => {
    soundEngine.setMasterVolume(1.0);

    const t1 = setTimeout(() => {
      sendIframeCommand('unMute', []);
      sendIframeCommand('setVolume', [100]);
      sendIframeCommand('playVideo', []);
    }, 600);

    const t2 = setTimeout(() => {
      sendIframeCommand('unMute', []);
      sendIframeCommand('setVolume', [100]);
      sendIframeCommand('playVideo', []);
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      sendIframeCommand('pauseVideo', []);
      soundEngine.stopHedwigTheme();
    };
  }, []);

  // Normalizar contraseña mágica ("lumos" o "lumos maxima")
  const normalizeSpell = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');

  const handleUserGesture = () => {
    if (!isLumosTriggered && isPlayingMusic) {
      playAllAudio();
    }
  };

  const handleBookClick = () => {
    handleUserGesture();
    if (bookState === 'closed') {
      soundEngine.playMagicOpen();
      setBookState('opening');
      setTimeout(() => {
        setBookState('open');
      }, 1200);
    }
  };

  const handleCastSpell = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanAttempt = normalizeSpell(spellInput);
    const cleanTarget = normalizeSpell(CONFIG.magicPassword); // "lumos"

    if (cleanAttempt === cleanTarget || cleanAttempt === 'lumosmaxima') {
      setSpellError('');
      setIsLumosTriggered(true);
      pauseAllAudio();
      soundEngine.playLumosMaxima();

      // Transición cinemática luminosa a la siguiente etapa
      setTimeout(() => {
        onComplete();
      }, 3000);
    } else {
      soundEngine.playErrorSubtle();
      setSpellError('El encantamiento no vibra en la frecuencia correcta... Recuerda la luz.');
      setTimeout(() => setSpellError(''), 4500);
    }
  };

  return (
    <div
      onClick={handleUserGesture}
      className="relative w-full min-h-screen bg-[#070503] text-amber-100 flex flex-col justify-between p-4 md:p-8 overflow-hidden select-none"
    >
      {/* Reproductor de YouTube de la Biblioteca Mágica (Fondo sonoro ambiental) */}
      {!isLumosTriggered && (
        <div className="fixed -bottom-96 -right-96 w-64 h-36 opacity-1 pointer-events-none">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${CONFIG.magicYouTubeId || 'wtHra9tFISY'}?enablejsapi=1&autoplay=1&mute=0&loop=1&playlist=${CONFIG.magicYouTubeId || 'wtHra9tFISY'}&playsinline=1&controls=1&origin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}`}
            title="Musica de fondo de la Biblioteca Magica"
            allow="autoplay; encrypted-media; picture-in-picture"
            tabIndex={-1}
            className="w-full h-full"
          />
        </div>
      )}

      {/* Fondo de biblioteca antigua con arcos góticos y luz cálida de velas */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(90,45,15,0.28)_0%,rgba(7,5,3,0.98)_80%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0%,rgba(20,10,5,0.3)_50%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

      {/* Partículas / chispas mágicas flotando */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              y: '100vh',
              x: `${(i * 4.2) % 100}vw`,
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              y: '-10vh',
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.2, 0.3],
            }}
            transition={{
              duration: 8 + (i % 6),
              repeat: Infinity,
              delay: (i * 0.4) % 6,
              ease: 'easeInOut',
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
          />
        ))}
      </div>

      {/* Velas mágicas flotando en el aire */}
      <div className="absolute inset-0 pointer-events-none">
        {FLOATING_CANDLES.map((candle) => (
          <motion.div
            key={candle.id}
            animate={{
              y: ['0px', '-14px', '0px'],
              rotate: [-1, 1, -1],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              delay: candle.delay,
              ease: 'easeInOut',
            }}
            style={{ left: candle.x, top: candle.y }}
            className="absolute hidden sm:flex flex-col items-center"
          >
            {/* Llama trémula */}
            <div className="w-2.5 h-4 bg-amber-300 rounded-full blur-[0.5px] shadow-[0_0_14px_rgba(251,191,36,0.9)] animate-pulse" />
            <div className="w-1 h-1 bg-amber-100 rounded-full -mt-2" />
            {/* Cuerpo de la vela de cera marfil */}
            <div className="w-3.5 h-14 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300/80 rounded-sm shadow-md mt-0.5 opacity-90" />
            {/* Halo sutil de luz */}
            <div className="absolute -top-3 w-16 h-16 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* Encabezado limpio con reproductor de música: pausar y reanudar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="relative z-30 text-center max-w-2xl mx-auto pt-2 md:pt-4"
      >
        <h2 className="mt-2 text-2xl md:text-3xl font-cinzel text-amber-100 font-semibold tracking-wider">
          {bookState === 'closed' ? 'Un Tomo Aguarda en Silencio' : 'El Saber se Despliega'}
        </h2>
        <p className="mt-1 text-xs md:text-sm font-serif-vintage italic text-amber-300/80">
          {bookState === 'closed'
            ? 'Haz clic sobre el grimorio central para romper el sello arcano.'
            : 'Pronuncia el sortilegio necesario para que la luz sea absoluta.'}
        </p>

        {/* =========================================================================
            REPRODUCTOR DE MÚSICA MÁGICA: SOLO PAUSAR Y REANUDAR
           ========================================================================= */}
        {!isLumosTriggered && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-3 mx-auto px-4 py-2 rounded-full bg-stone-950/90 border border-amber-600/50 shadow-[0_4px_20px_rgba(0,0,0,0.85)] inline-flex items-center justify-center gap-3 backdrop-blur-md"
          >
            <button
              type="button"
              onClick={toggleMusic}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-cinzel font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              title={isPlayingMusic ? 'Pausar música' : 'Reanudar música'}
            >
              {isPlayingMusic ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-stone-950" />
                  <span>Pausar música</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-stone-950 translate-x-0.5" />
                  <span>Reanudar música</span>
                </>
              )}
            </button>

            <span className="text-xs font-cinzel text-amber-200 font-medium">
              Hedwig's Theme
            </span>

            {isPlayingMusic && (
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-amber-400 animate-pulse" />
                <span className="w-0.5 h-3 bg-amber-300 animate-pulse delay-75" />
                <span className="w-0.5 h-1.5 bg-amber-500 animate-pulse delay-150" />
              </div>
            )}
          </div>
        )}
      </motion.header>

      {/* Escenario Central: El Grimorio Mágico sobre el atril */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center my-6">
        <div className="relative flex flex-col items-center">
          {/* Libros de fondo en penumbra a los lados */}
          <div className="absolute -left-28 md:-left-44 bottom-0 hidden sm:flex items-end gap-1 opacity-40 pointer-events-none">
            <div className="w-6 h-28 bg-stone-900 border-l border-amber-800/30 rotate-[-4deg]" />
            <div className="w-8 h-36 bg-amber-950 border-l border-amber-800/30" />
            <div className="w-7 h-32 bg-stone-900" />
          </div>

          <div className="absolute -right-28 md:-right-44 bottom-0 hidden sm:flex items-end gap-1 opacity-40 pointer-events-none">
            <div className="w-7 h-32 bg-amber-950 border-r border-amber-800/30" />
            <div className="w-8 h-36 bg-stone-900" />
            <div className="w-6 h-28 bg-amber-950 rotate-[4deg]" />
          </div>

          {/* El Libro Especial (Interactivo) */}
          <div className="relative cursor-pointer group flex flex-col items-center" onClick={handleBookClick}>
            {/* Halo mágico pulsante cuando está cerrado */}
            {bookState === 'closed' && (
              <div className="absolute -inset-6 bg-amber-500/25 rounded-2xl blur-2xl animate-magic-glow pointer-events-none" />
            )}

            {/* Libro Cerrado con la portada oficial tal cual, sin gradientes molestos ni cortes */}
            {bookState === 'closed' && (
              <div className="flex flex-col items-center">
                <motion.div
                  whileHover={{ scale: 1.04, y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-[260px] sm:w-[290px] md:w-[310px] aspect-[2/3] rounded-md p-1.5 flex flex-col items-center justify-center border-2 border-amber-500/80 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_35px_rgba(245,158,11,0.5)] transition-all duration-300 bg-[#140c06] overflow-hidden"
                >
                  {/* Textura de lomo y encuadernación */}
                  <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-stone-950 via-amber-950/80 to-transparent z-10 pointer-events-none" />

                  {/* Portada de Harry Potter oficial: limpia, nítida y visible al 100% */}
                  <div className="relative w-full h-full rounded-xs overflow-hidden bg-black flex items-center justify-center">
                    <img
                      src={hpCoverImg || CONFIG.harryPotterCoverSrc}
                      alt={CONFIG.magicBookTitle}
                      className="w-full h-full object-contain select-none"
                    />
                  </div>

                  {/* Cinta marcapáginas dorada sobresaliendo sutilmente */}
                  <div className="absolute -top-1 right-6 w-3 h-8 bg-amber-500 rounded-b-xs shadow-md border-b-2 border-amber-200 z-20 pointer-events-none" />
                </motion.div>

                {/* Indicador de acción limpio y elegante debajo del libro */}
                <motion.div
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="mt-4 px-4 py-1.5 rounded-full bg-stone-900/90 border border-amber-500/40 shadow-lg flex items-center gap-2 text-amber-300 font-cinzel text-xs tracking-widest uppercase"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Tocar el grimorio para abrir</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </motion.div>
              </div>
            )}

            {/* Animación del Libro Abriéndose / Abierto */}
            {bookState !== 'closed' && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative w-[92vw] max-w-2xl min-h-[380px] md:min-h-[420px] rounded-lg p-6 md:p-10 flex flex-col justify-between border-2 border-amber-600/70 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_50px_rgba(245,158,11,0.4)]"
                style={{
                  background: 'linear-gradient(145deg, #1f1207 0%, #110903 50%, #29180a 100%)',
                }}
              >
                {/* Rayo de luz saliendo del centro del libro */}
                <div className="absolute inset-x-12 top-0 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent blur-sm pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.18)_0%,transparent_70%)] pointer-events-none" />

                {/* Páginas con textura de pergamino iluminado */}
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-800/40 pb-3">
                    <span className="text-[10px] tracking-[0.25em] text-amber-400 font-cinzel uppercase">
                      Página VII · Encantamiento de la Varita
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>

                  <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-sm">
                    <p className="text-sm md:text-base font-serif-vintage italic text-amber-200/90 leading-relaxed text-center">
                      "Para disipar las tinieblas y revelar el sendero oculto, invoca la palabra que enciende la punta de tu varita."
                    </p>
                  </div>

                  {/* Pista mágica desplegable */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowSpellHint((prev) => !prev)}
                      className="text-[11px] text-amber-400/80 hover:text-amber-300 tracking-wider underline underline-offset-4 cursor-pointer font-cinzel"
                    >
                      {showSpellHint ? 'Ocultar susurro arcano' : 'Consultar susurro arcano'}
                    </button>
                    {showSpellHint && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-xs text-amber-300/80 font-serif-vintage italic"
                      >
                        "{CONFIG.magicHint}"
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Caja de Conjuro integrada estilo inscripción / pergamino */}
                <form onSubmit={handleCastSpell} className="relative z-10 mt-6 space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={spellInput}
                      onChange={(e) => setSpellInput(e.target.value)}
                      disabled={isLumosTriggered}
                      placeholder="Escribe el encantamiento aquí..."
                      className="w-full py-3 px-4 bg-stone-950/90 border-2 border-amber-700/60 rounded-sm text-center text-amber-100 placeholder-stone-600 font-cinzel text-sm md:text-base tracking-[0.2em] uppercase focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLumosTriggered || !spellInput.trim()}
                    className={`w-full py-3 px-6 rounded-sm text-xs md:text-sm font-cinzel tracking-[0.3em] uppercase font-bold transition-all duration-500 ${
                      isLumosTriggered
                        ? 'bg-amber-300 text-black border border-white shadow-[0_0_40px_rgba(255,255,255,0.9)]'
                        : 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 border border-amber-400/50 shadow-lg cursor-pointer'
                    }`}
                  >
                    {isLumosTriggered ? '¡LUMOS!' : 'LANZAR ENCANTAMIENTO'}
                  </button>

                  <AnimatePresence>
                    {spellError && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-amber-400 text-center font-serif-vintage italic mt-1"
                      >
                        {spellError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Atril de madera tallada debajo del libro */}
      <footer className="relative z-10 max-w-sm mx-auto w-full text-center pb-2">
        <div className="w-48 h-2 bg-gradient-to-r from-transparent via-amber-900/60 to-transparent mx-auto rounded-full" />
        <span className="text-[10px] tracking-[0.2em] text-stone-600 font-cinzel uppercase">
          Biblioteca Ancestral
        </span>
      </footer>

      {/* Explosión Lumos (Pantalla llena de luz blanca/dorada brillante) */}
      <AnimatePresence>
        {isLumosTriggered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.1 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            className="fixed inset-0 bg-gradient-to-b from-amber-100 via-white to-amber-200 z-50 pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="text-center space-y-2 text-stone-950 font-cinzel"
            >
              <div className="text-4xl md:text-6xl font-bold tracking-widest">
                LUMOS
              </div>
              <p className="text-sm tracking-wider font-serif-vintage italic text-stone-800">
                La penumbra se rinde ante el resplandor...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
