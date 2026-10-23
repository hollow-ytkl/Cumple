import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CONFIG } from '../config';
import { soundEngine } from '../utils/audioSystem';
import { Play, Pause, Volume2, Sparkles, Disc3 } from 'lucide-react';

interface Stage4LaufeyProps {
  onComplete: () => void;
}

export const Stage4Laufey: React.FC<Stage4LaufeyProps> = ({ onComplete }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Detener cualquier música procedural para que solo suene la canción de YouTube
  useEffect(() => {
    soundEngine.stopLaufeyTurntable();
    return () => {
      sendIframeCommand('pauseVideo');
    };
  }, []);

  const sendIframeCommand = (func: string, args: unknown[] = []) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      }
    } catch {
      // Ignorar errores de postMessage si el iframe está inicializando
    }
  };

  const toggleTurntable = () => {
    if (isPlaying) {
      sendIframeCommand('pauseVideo', []);
      setIsPlaying(false);
    } else {
      sendIframeCommand('unMute', []);
      sendIframeCommand('setVolume', [100]);
      sendIframeCommand('playVideo', []);
      setIsPlaying(true);
    }
  };

  const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanAttempt = normalize(passwordInput);
    const cleanTarget = normalize(CONFIG.musicPassword);

    if (cleanAttempt === cleanTarget) {
      setErrorMsg('');
      setIsUnlocked(true);
      // Detener el vinilo y levantar la aguja
      setIsPlaying(false);
      sendIframeCommand('pauseVideo');

      // Transición cinematográfica con desaturación hacia el océano
      setTimeout(() => {
        onComplete();
      }, 3200);
    } else {
      soundEngine.playErrorSubtle();
      setErrorMsg('No es esa melodía... Escucha bien la canción que suena en el tocadiscos.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  return (
    <div
      className={`relative w-full min-h-screen text-[#3e2c24] flex flex-col justify-between p-4 md:p-8 overflow-x-hidden select-none transition-all duration-1000 ${
        isUnlocked
          ? 'bg-[#1a2332] text-neutral-300 filter grayscale-[0.6]'
          : 'bg-[#fcf8f2]'
      }`}
      style={{
        backgroundImage: isUnlocked
          ? 'radial-gradient(ellipse at center, rgba(16,36,54,0.9) 0%, rgba(5,12,20,1) 100%)'
          : 'radial-gradient(ellipse at center, rgba(255,250,244,1) 0%, rgba(243,234,223,1) 100%)',
      }}
    >
      {/* =========================================================================
          AUDIO DE FONDO OCULTO: REPRODUCCIÓN TRANSPARENTE DE LA CANCIÓN "FROM THE START"
          El iframe permanece completamente invisible para que parezca que la música
          proviene exclusivamente del tocadiscos físico de la pantalla.
         ========================================================================= */}
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${CONFIG.musicYouTubeId}?enablejsapi=1&autoplay=1&mute=0&loop=1&playlist=${CONFIG.musicYouTubeId}&playsinline=1&controls=0&origin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}`}
        title="Background Music"
        allow="autoplay; encrypted-media; picture-in-picture"
        tabIndex={-1}
        aria-hidden="true"
        className="fixed -bottom-96 -right-96 w-64 h-36 opacity-1 pointer-events-none"
      />

      {/* Textura sutil de papel artesanal antiguo */}
      <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#3e2c24_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Notas musicales flotantes cuando el vinilo gira */}
      {isPlaying && !isUnlocked && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {['♪', '♫', '♩', '♬', '♭'].map((symbol, idx) => (
            <motion.span
              key={idx}
              initial={{
                y: '80vh',
                x: `${22 + idx * 14}vw`,
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                y: '15vh',
                opacity: [0, 0.65, 0],
                scale: [0.8, 1.2, 0.9],
              }}
              transition={{
                duration: 6 + idx * 1.5,
                repeat: Infinity,
                delay: idx * 0.8,
                ease: 'easeInOut',
              }}
              className="absolute text-xl md:text-2xl text-[#9c7865] font-serif-vintage"
            >
              {symbol}
            </motion.span>
          ))}
        </div>
      )}

      {/* Encabezado: Estética vintage editorial con NOMBRE CENSURADO */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-xl mx-auto text-center pt-2 md:pt-4"
      >
        <h2 className="mt-1 text-2xl md:text-3xl font-serif-vintage text-[#2d1f19] tracking-normal font-normal">
          Un Susurro en Clave de Bossa
        </h2>
        <p className="mt-1 text-xs md:text-sm text-[#7a5e4f] font-serif-vintage italic">
          "Hay melodías que revelan verdades evidentes... si sabes escuchar desde dónde empiezan."
        </p>
      </motion.header>

      {/* Escenario Central: Tocadiscos Vintage Realista */}
      <main className="relative z-10 my-4 md:my-6 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4">
        {/* Tocadiscos */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-64 h-64 sm:w-76 sm:h-76 md:w-84 md:h-84 bg-[#ebe1d3] border-4 border-[#d5c3af] rounded-3xl p-5 shadow-[0_20px_45px_rgba(75,50,35,0.14),inset_0_2px_4px_rgba(255,255,255,0.6)] flex items-center justify-center">
            {/* Plato giratorio */}
            <div className="relative w-full h-full bg-[#352b27] rounded-full p-2 shadow-inner flex items-center justify-center">
              {/* Disco de vinilo */}
              <div
                className={`relative w-full h-full rounded-full bg-[#181514] border border-[#26201e] shadow-2xl flex items-center justify-center transition-transform ${
                  isPlaying ? 'animate-vinyl' : 'animate-vinyl-paused'
                }`}
                style={{
                  background: 'radial-gradient(circle, #241f1c 0%, #151210 50%, #0d0a09 100%)',
                }}
              >
                {/* Surcos concéntricos del vinilo */}
                <div className="absolute inset-3 rounded-full border border-neutral-700/20 pointer-events-none" />
                <div className="absolute inset-7 rounded-full border border-neutral-700/20 pointer-events-none" />
                <div className="absolute inset-12 rounded-full border border-neutral-700/20 pointer-events-none" />
                <div className="absolute inset-16 rounded-full border border-neutral-700/20 pointer-events-none" />

                {/* Etiqueta central vintage (Label del disco) CON NOMBRE CENSURADO */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#dfc0ab] border-2 border-[#b8957f] shadow-md flex flex-col items-center justify-center text-center p-2">
                  <span className="text-[8px] tracking-[0.25em] uppercase font-bold text-[#5c3e2e]">
                    SIDE A · 45 RPM
                  </span>
                  
                  <div className="w-10 h-[1px] bg-[#9c7865] my-1" />

                  {/* NOMBRE DE LA ARTISTA COMPLETAMENTE CENSURADO CON CINTA NEGRA */}
                  <div className="relative inline-block my-0.5">
                    <span className="bg-[#1f1612] text-[#e0cfbe] px-2 py-0.5 rounded-xs text-[10px] font-mono tracking-widest font-bold shadow-sm">
                      ██████
                    </span>
                    <span className="block text-[7px] tracking-wider text-[#6b4c39] font-serif-vintage italic mt-0.5 uppercase">
                      [Artista Censurada]
                    </span>
                  </div>

                  <span className="text-[7.5px] text-[#7a5845] mt-0.5">
                    Bewitched Records
                  </span>

                  {/* Agujero central del husillo */}
                  <div className="w-3.5 h-3.5 rounded-full bg-stone-900 border border-stone-600 mt-1" />
                </div>
              </div>

              {/* Brazo fonocaptor / aguja del tocadiscos */}
              <div
                className={`absolute -top-3 right-2 w-14 h-28 origin-top-right transition-transform duration-700 pointer-events-none ${
                  isPlaying ? 'rotate-12' : '-rotate-12'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-stone-400 border border-stone-500 shadow-md absolute right-1 top-1" />
                <div className="w-1.5 h-24 bg-gradient-to-r from-stone-300 via-stone-100 to-stone-400 rounded-full mx-auto -rotate-12 shadow" />
                <div className="w-3.5 h-5 bg-amber-800 rounded-xs shadow border border-amber-900 -mt-1 ml-1" />
              </div>
            </div>
          </div>

          {/* Controles directos del tocadiscos */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTurntable}
              className="px-5 py-2.5 bg-[#ebd9c9] hover:bg-[#dfc7b4] border border-[#cbb09c] rounded-full text-xs font-serif-vintage text-[#422c20] font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pausar Tocadiscos' : 'Hacer Girar el Vinilo'}</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-[#8f6d59] font-serif-vintage">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>{isPlaying ? 'Música sonando en el vinilo...' : 'Aguja levantada'}</span>
            </div>
          </div>
        </div>

        {/* Tarjeta de Misterio Musical y Formulario */}
        <div className="flex flex-col justify-center">
          <div className="bg-[#f7efe4] border border-[#e2d3c1] rounded-2xl p-6 md:p-8 shadow-[0_12px_30px_rgba(75,50,35,0.06)] relative">
            <div className="absolute -top-3 left-8 w-16 h-6 bg-[#eedecf]/90 rotate-[-3deg] border border-[#dfc9b7] shadow-xs pointer-events-none" />

            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#a07a66] font-cinzel">
                Pista Sonora
              </span>
              <h3 className="text-xl font-serif-vintage font-semibold text-[#32231c]">
                Emh creo que esta fácil.
              </h3>
              <p className="text-xs md:text-sm text-[#674e40] font-serif-vintage leading-relaxed">
                ねえ、これ本当に君が訳したの？完璧だよ、役になりきってるね。まあ、ここには何も書いてなかったけど。xdxd
              </p>

              {/* Botón de pista adicional */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowHint((prev) => !prev)}
                  className="text-xs text-[#a07358] hover:text-[#7f5539] underline underline-offset-4 font-serif-vintage italic cursor-pointer"
                >
                  {showHint ? 'Ocultar pista' : '¿Necesitas una pista?'}
                </button>
                {showHint && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-3 bg-[#ede1d3]/80 rounded-md text-xs text-[#523d31] font-serif-vintage italic border border-[#dac5b2]"
                  >
                    "{CONFIG.musicHint}"
                  </motion.p>
                )}
              </div>
            </div>

            {/* Formulario de Contraseña */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  disabled={isUnlocked}
                  placeholder="Escribe el nombre de la canción en inglés..."
                  className="w-full py-3 px-4 bg-[#fffdfa] border border-[#d2bea9] rounded-lg text-sm text-[#2d1e17] placeholder-[#a89283] font-serif-vintage text-center tracking-wider focus:outline-none focus:border-[#8f6a54] focus:ring-1 focus:ring-[#8f6a54]/30 shadow-inner transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isUnlocked || !passwordInput.trim()}
                className={`w-full py-3 px-6 rounded-lg text-xs tracking-[0.2em] font-cinzel uppercase font-semibold transition-all duration-500 cursor-pointer ${
                  isUnlocked
                    ? 'bg-[#1e293b] text-white border border-stone-600 shadow-md'
                    : 'bg-[#5c3e2e] hover:bg-[#482f22] text-[#fbf7f1] border border-[#442c20] shadow-md'
                }`}
              >
                {isUnlocked ? 'MELODÍA IDENTIFICADA' : 'CONFIRMAR CANCIÓN'}
              </button>

              <AnimatePresence>
                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-[#9c4a3b] font-serif-vintage italic text-center mt-1"
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </main>

      {/* Pie de página con nota decorativa */}
      <footer className="relative z-10 max-w-sm mx-auto text-center pb-2">
        <p className="text-[10px] tracking-widest text-[#9c7865] font-serif-vintage uppercase">
          Archivo Acústico Privado
        </p>
      </footer>
    </div>
  );
};
