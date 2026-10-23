import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CONFIG } from '../config';
import { soundEngine } from '../utils/audioSystem';
import {
  Terminal,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Eye,
  Key,
  Database,
  Lock,
  Unlock,
  Cpu,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface StageMurderDronesProps {
  onComplete: () => void;
}

interface MemoryRecord {
  id: string; // 'K-01', 'K-04', 'K-02', 'K-07'
  episodeLabel: string;
  canonTitle: string;
  text: string;
  question: string;
  optionalHint: string;
  associatedDigit: number;
  correctChronologicalIndex: number; // 0, 1, 2, 3
  themeColor: string;
}

// Los cuatro registros canónicos de Murder Drones
// Cronología canónica:
// 1º Ep 1: Piloto (K-01) -> Dígito 1
// 2º Ep 3: The Promening (K-04) -> Dígito 3
// 3º Ep 4: Cabin Fever (K-02) -> Dígito 4
// 4º Ep 5: Home / Memories (K-07) -> Dígito 5
// Secuencia cronológica: K-01 -> K-04 -> K-02 -> K-07
// Código final: 1 3 4 5
const INITIAL_RECORDS: MemoryRecord[] = [
  {
    id: 'K-04',
    episodeLabel: 'ARCHIVO MEMORIAL CLASIFICADO',
    canonTitle: 'Evento Social y Conflicto Solver',
    text: 'Una estudiante se infiltra en una celebración escolar. Una rival con poderes relacionados con el Solver se convierte en una pieza importante del conflicto.',
    question: '¿Qué acontecimiento de la serie describe este registro?',
    optionalHint: 'Ocurre en la pista de baile escolar. Doll revela poderes telequinéticos ante Uzi y N.',
    associatedDigit: 3,
    correctChronologicalIndex: 1,
    themeColor: 'from-purple-900/40 to-fuchsia-950/30 border-purple-500/40 text-purple-300',
  },
  {
    id: 'K-01',
    episodeLabel: 'ARCHIVO MEMORIAL CLASIFICADO',
    canonTitle: 'Brecha Perimetral y Alianza Improbable',
    text: 'Una Worker Drone sale de su refugio y se encuentra con un Disassembly Drone. El encuentro altera los planes de ambos.',
    question: '¿Qué encuentro marca el inicio de esta historia?',
    optionalHint: 'Uzi se aventura al páramo helado fuera de las tres compuertas del búnker y conoce a N.',
    associatedDigit: 1,
    correctChronologicalIndex: 0,
    themeColor: 'from-amber-900/30 to-yellow-950/30 border-yellow-500/40 text-yellow-300',
  },
  {
    id: 'K-07',
    episodeLabel: 'ARCHIVO MEMORIAL CLASIFICADO',
    canonTitle: 'Inmersión en Datos Arcanos y Orígenes',
    text: 'Los recuerdos conducen a una mansión humana. Las relaciones entre varios personajes y los orígenes de ciertos acontecimientos comienzan a revelarse.',
    question: '¿Qué episodio profundiza en esos recuerdos del pasado?',
    optionalHint: 'La Mansión Elliott en la Tierra. El pasado compartido de N, V, J y Cyn antes de Copper 9.',
    associatedDigit: 5,
    correctChronologicalIndex: 3,
    themeColor: 'from-rose-950/30 to-red-950/30 border-red-500/40 text-red-300',
  },
  {
    id: 'K-02',
    episodeLabel: 'ARCHIVO MEMORIAL CLASIFICADO',
    canonTitle: 'Expedición Boscosa y Mutación Biomecánica',
    text: 'Un campamento escolar se convierte en un escenario peligroso. La conducta de Uzi comienza a mostrar señales preocupantes relacionadas con el Solver.',
    question: '¿Qué episodio presenta este incidente?',
    optionalHint: 'Campamento 98.7 entre la nieve. Uzi manifiesta alas biomecánicas y sed de aceite.',
    associatedDigit: 4,
    correctChronologicalIndex: 2,
    themeColor: 'from-violet-950/40 to-indigo-950/30 border-indigo-500/40 text-indigo-300',
  },
];

export const StageMurderDrones: React.FC<StageMurderDronesProps> = ({ onComplete }) => {
  // Fases de la escena:
  // 'intro': terminal typewriter con briefing de JCJenson
  // 'investigation': mesa de reconstrucción de registros
  // 'success': autorización conseguida y código revelado
  const [phase, setPhase] = useState<'intro' | 'investigation' | 'success'>('intro');

  // Estado del texto de máquina de escribir en la intro
  const [introStep, setIntroStep] = useState<number>(0);
  const [typedHeader, setTypedHeader] = useState<string>('');
  const [typedBody, setTypedBody] = useState<string>('');
  const [introReady, setIntroReady] = useState<boolean>(false);

  // Registros en el orden que la jugadora va acomodando
  const [recordsOrder, setRecordsOrder] = useState<MemoryRecord[]>(() => [...INITIAL_RECORDS]);

  // Selección activa para reordenar en móviles o con clicks
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Visibilidad de pistas individuales por registro
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});

  // Modal de pistas generales
  const [showGeneralHints, setShowGeneralHints] = useState<boolean>(false);
  const [unlockedHintLevel, setUnlockedHintLevel] = useState<number>(0);

  // Estados de validación
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGlitching, setIsGlitching] = useState<boolean>(false);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');

  // ==========================================
  // AUDIO DE FONDO // BSO OFICIAL MURDER DRONES
  // ==========================================
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(true);

  const sendIframeCommand = (command: 'playVideo' | 'pauseVideo') => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: command, args: '' }),
          '*'
        );
      }
    } catch {
      // Ignorar excepciones al inicializar
    }
  };

  const toggleBgm = () => {
    if (isBgmPlaying) {
      sendIframeCommand('pauseVideo');
      setIsBgmPlaying(false);
    } else {
      sendIframeCommand('playVideo');
      setIsBgmPlaying(true);
    }
  };

  // Detener música procedural previa y pausar al desmontar
  useEffect(() => {
    soundEngine.stopLaufeyTurntable();
    soundEngine.stopOceanWaves();

    // Intentar arrancar la reproducción de la BSO
    const timer = setTimeout(() => {
      sendIframeCommand('playVideo');
    }, 600);

    return () => {
      clearTimeout(timer);
      sendIframeCommand('pauseVideo');
    };
  }, []);

  // ==========================================
  // TYPEWRITER DE LA INTRODUCCIÓN
  // ==========================================
  useEffect(() => {
    if (phase !== 'intro') return;

    const fullHeader = 'JCJENSON // ARCHIVO CONFIDENCIAL\nINCIDENTE: COPPER 9';
    const fullBody =
      '"Se han recuperado cuatro registros de memoria, pero sus marcas temporales han sido eliminadas.\n\n' +
      'Los registros contienen fragmentos de cuatro acontecimientos diferentes. Debes reconstruir su orden original para recuperar el código de acceso.\n\n' +
      'No confíes en el orden de los archivos."';

    let headerIndex = 0;
    let bodyIndex = 0;

    const headerInterval = setInterval(() => {
      if (headerIndex < fullHeader.length) {
        setTypedHeader(fullHeader.slice(0, headerIndex + 1));
        if (headerIndex % 3 === 0) soundEngine.playTerminalBeep(1.2);
        headerIndex++;
      } else {
        clearInterval(headerInterval);
        setIntroStep(1);

        // Iniciar el cuerpo
        const bodyInterval = setInterval(() => {
          if (bodyIndex < fullBody.length) {
            setTypedBody(fullBody.slice(0, bodyIndex + 1));
            if (bodyIndex % 4 === 0) soundEngine.playTerminalBeep(0.9);
            bodyIndex++;
          } else {
            clearInterval(bodyInterval);
            setIntroReady(true);
            soundEngine.playSolverRumble();
          }
        }, 18);
      }
    }, 28);

    return () => {
      clearInterval(headerInterval);
    };
  }, [phase]);

  // Saltear animación de tipeo al hacer clic en cualquier parte de la intro
  const skipTypewriter = () => {
    // Si el navegador restringió autoplay sin gesto previo, activar música con este click
    sendIframeCommand('playVideo');
    setIsBgmPlaying(true);

    if (!introReady) {
      setTypedHeader('JCJENSON // ARCHIVO CONFIDENCIAL\nINCIDENTE: COPPER 9');
      setTypedBody(
        '"Se han recuperado cuatro registros de memoria, pero sus marcas temporales han sido eliminadas.\n\n' +
          'Los registros contienen fragmentos de cuatro acontecimientos diferentes. Debes reconstruir su orden original para recuperar el código de acceso.\n\n' +
          'No confíes en el orden de los archivos."'
      );
      setIntroReady(true);
      soundEngine.playSolverRumble();
    }
  };

  const handleStartInvestigation = () => {
    sendIframeCommand('playVideo');
    setIsBgmPlaying(true);
    soundEngine.playTerminalBeep(1.5);
    soundEngine.playGlitchNoise();
    setPhase('investigation');
  };

  // ==========================================
  // REORDENAMIENTO DE REGISTROS
  // ==========================================
  const moveRecord = (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= recordsOrder.length) return;

    soundEngine.playTerminalBeep(1.1);
    const newOrder = [...recordsOrder];
    const [moved] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, moved);
    setRecordsOrder(newOrder);
    setValidationError(null);
  };

  const assignRecordToSlot = (recordId: string, targetSlotIndex: number) => {
    const currentIndex = recordsOrder.findIndex((r) => r.id === recordId);
    if (currentIndex === -1 || currentIndex === targetSlotIndex) {
      setSelectedRecordId(null);
      return;
    }

    soundEngine.playTerminalBeep(1.3);
    const newOrder = [...recordsOrder];
    const [moved] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetSlotIndex, 0, moved);
    setRecordsOrder(newOrder);
    setSelectedRecordId(null);
    setValidationError(null);
  };

  const toggleHintForRecord = (recordId: string) => {
    soundEngine.playHintChime();
    setRevealedHints((prev) => ({
      ...prev,
      [recordId]: !prev[recordId],
    }));
  };

  // ==========================================
  // COMPROBACIÓN DEL ORDEN CRONOLÓGICO DE LOS REGISTROS
  // Secuencia canónica exacta de Murder Drones:
  // 1º K-01 (Piloto) -> 2º K-04 (Promening) -> 3º K-02 (Cabin Fever) -> 4º K-07 (Home/Memories)
  // ==========================================
  const isOrderCorrect =
    recordsOrder.length === 4 &&
    recordsOrder[0].id === 'K-01' &&
    recordsOrder[1].id === 'K-04' &&
    recordsOrder[2].id === 'K-02' &&
    recordsOrder[3].id === 'K-07';

  // Sonido al desbloquear el candado cuando los registros se alinean por primera vez
  const prevOrderCorrectRef = useRef<boolean>(false);
  useEffect(() => {
    if (phase === 'investigation') {
      if (isOrderCorrect && !prevOrderCorrectRef.current) {
        soundEngine.playHintChime();
        soundEngine.playTerminalBeep(1.6);
      }
    }
    prevOrderCorrectRef.current = isOrderCorrect;
  }, [isOrderCorrect, phase]);

  // ==========================================
  // VALIDACIÓN DE LA INVESTIGACIÓN (CÓDIGO MANUAL OBLIGATORIO)
  // ==========================================
  const verifyCode = (codeToTest?: string) => {
    if (!isOrderCorrect) {
      soundEngine.playAccessDeniedGlitch();
      setValidationError(
        'ACCESO DENEGADO // CANDADO CERRADO: Primero debes organizar los 4 registros en el orden cronológico correcto para desbloquear la terminal.'
      );
      return;
    }

    const rawInput = (codeToTest !== undefined ? codeToTest : manualCodeInput).trim();

    if (!rawInput) {
      soundEngine.playAccessDeniedGlitch();
      setValidationError('DEBES INGRESAR EL CÓDIGO DE 4 DÍGITOS PARA PODER CONTINUAR.');
      return;
    }

    if (rawInput === '1345') {
      // ¡Éxito!
      setValidationError(null);
      soundEngine.playAccessGrantedCyber();
      soundEngine.playSolverRumble();
      setPhase('success');
    } else {
      // Error
      soundEngine.playAccessDeniedGlitch();
      soundEngine.playGlitchNoise();
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 500);

      setValidationError(
        'ERROR 403 // CÓDIGO INCORRECTO: El código ingresado no coincide con el protocolo cronológico. Revisa los sucesos y consulta las pistas si lo requieres.'
      );
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#07070a] text-neutral-200 font-mono flex flex-col justify-between overflow-x-hidden select-none">
      {/* Fondo con textura tecnológica y scanlines */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Gradiente radial violeta/rojo oscuro */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/20 via-[#07070a] to-[#040406]" />

        {/* Cuadrícula sutil de terminal */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, #a855f7 1px, transparent 1px), linear-gradient(to bottom, #a855f7 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Scanlines animadas tipo monitor CRT de JCJenson */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-screen pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 1px, transparent 1px, transparent 3px)`,
          }}
        />

        {/* Efecto de viñeta oscura */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]" />
      </div>

      {/* Símbolo decorativo del ABSOLUTE SOLVER en fondo flotante */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none opacity-[0.05] transition-opacity duration-1000">
        <svg
          viewBox="0 0 200 200"
          className="w-[500px] h-[500px] text-purple-400 animate-[spin_120s_linear_infinite]"
        >
          {/* Círculo exterior con flechas Absolute Solver */}
          <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
          <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
          {/* Tres puntas de flecha a 120 grados */}
          <path d="M 100 15 L 100 70 M 90 35 L 100 15 L 110 35" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M 26 142 L 74 115 M 34 125 L 26 142 L 46 147" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M 174 142 L 126 115 M 154 147 L 174 142 L 166 125" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="100" cy="100" r="6" fill="currentColor" />
        </svg>
      </div>

      {/* =========================================================================
          ENCABEZADO DE TERMINAL JCJENSON
          ========================================================================= */}
      <header className="relative z-10 w-full max-w-5xl mx-auto pt-4 px-4 sm:px-6 flex flex-wrap items-center justify-between border-b border-purple-900/30 pb-3 gap-3">
        <div className="flex items-center gap-3">
          {/* Icono del Absolute Solver miniatura */}
          <div className="w-8 h-8 rounded border border-purple-500/50 bg-purple-950/40 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <svg viewBox="0 0 100 100" className="w-5 h-5 text-yellow-400">
              <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="4" />
              <circle cx="50" cy="50" r="8" fill="currentColor" />
              <path d="M 50 10 L 50 35 M 44 22 L 50 10 L 56 22" fill="none" stroke="currentColor" strokeWidth="4" />
              <path d="M 15 70 L 37 57 M 21 60 L 15 70 L 27 72" fill="none" stroke="currentColor" strokeWidth="4" />
              <path d="M 85 70 L 63 57 M 73 72 L 85 70 L 79 60" fill="none" stroke="currentColor" strokeWidth="4" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-neutral-100 flex items-center gap-1.5">
              <span>EXPEDIENTE 013</span>
              <span className="text-xs text-neutral-500 font-normal">| Protocolo Solver</span>
            </h1>
          </div>
        </div>

        {/* Indicador de estado, botón de pistas y control de audio BSO */}
        <div className="flex items-center gap-2">
          {/* Botón de control de la música de Murder Drones */}
          <button
            onClick={toggleBgm}
            className={`px-2.5 py-1 text-xs rounded border transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm ${
              isBgmPlaying
                ? 'border-purple-500/50 bg-purple-950/40 text-purple-200 hover:bg-purple-900/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
            }`}
            title={isBgmPlaying ? 'Pausar música de fondo' : 'Reproducir música de fondo'}
          >
            {isBgmPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span className="text-[10px] tracking-wider hidden xs:inline">BSO ACTIVA</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-[10px] tracking-wider hidden xs:inline">BSO PAUSADA</span>
              </>
            )}
          </button>

          <div className="text-[10px] text-neutral-500 hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>DISASSEMBLY TERMINAL V2.4</span>
          </div>
        </div>
      </header>

      {/* =========================================================================
          AUDIO DE FONDO OCULTO: BSO OFICIAL MURDER DRONES (YOUTUBE EMBED)
          https://www.youtube.com/watch?v=2RL2e6cK5DI&list=PLwyyUdV4sEKOnT3elPE5d_THK1TDQPnmQ&index=1
         ========================================================================= */}
      <iframe
        ref={iframeRef}
        src={`https://www.youtube-nocookie.com/embed/${CONFIG.murderDronesYouTubeId}?enablejsapi=1&autoplay=1&loop=1&playlist=${CONFIG.murderDronesYouTubeId}&controls=0`}
        title="Murder Drones BGM"
        allow="autoplay"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute top-0 left-0 w-1 h-1 opacity-[0.001] pointer-events-none -z-50"
      />

      {/* =========================================================================
          CUERPO PRINCIPAL
          ========================================================================= */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col justify-center">
        {/* -------------------------------------------------------------
            FASE 1: INTRODUCCIÓN CON TYPEWRITER DE TERMINAL
            ------------------------------------------------------------- */}
        {phase === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            onClick={skipTypewriter}
            className="w-full max-w-2xl mx-auto cursor-pointer"
          >
            {/* Terminal Card */}
            <div className="relative rounded-xl border border-purple-900/50 bg-[#0a0912]/90 backdrop-blur-md p-6 sm:p-8 shadow-[0_0_40px_rgba(168,85,247,0.12)] overflow-hidden">
              {/* Barra superior de terminal */}
              <div className="flex items-center justify-between border-b border-purple-950 pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-purple-500/80 inline-block" />
                  <span className="text-xs text-neutral-400 ml-2 font-mono">
                    terminal://jcjenson/copper9/case_013.log
                  </span>
                </div>
                <span className="text-[10px] text-purple-400/70 border border-purple-900/60 px-2 py-0.5 rounded">
                  ENCRIPTACIÓN ACTIVA
                </span>
              </div>

              {/* Título progresivo */}
              <div className="mb-6">
                <pre className="font-mono text-xs sm:text-sm font-bold text-amber-400 tracking-wider whitespace-pre-wrap">
                  {typedHeader}
                </pre>
              </div>

              {/* Mensaje de la corporación JCJenson */}
              <div className="min-h-[140px] text-xs sm:text-sm text-neutral-300 leading-relaxed font-mono whitespace-pre-wrap">
                {typedBody}
                {!introReady && <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse" />}
              </div>

              {/* Aviso de terminal */}
              <div className="mt-6 pt-4 border-t border-purple-900/30 flex items-center justify-between text-[11px] text-neutral-400">
                <div className="flex items-center gap-1.5 text-purple-300">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Protocolo de Investigación // Copper 9</span>
                </div>
                {!introReady && (
                  <span className="text-neutral-500 text-[10px] italic">
                    (Click para mostrar todo)
                  </span>
                )}
              </div>

              {/* Botón de Iniciar Investigación */}
              {introReady && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-8 flex justify-center"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartInvestigation();
                    }}
                    className="relative group px-6 py-3.5 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-sm tracking-widest uppercase transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.7)] flex items-center gap-2.5 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Terminal className="w-4 h-4 text-yellow-300" />
                    <span>[ INICIAR INVESTIGACIÓN ]</span>
                    <ArrowRight className="w-4 h-4 text-purple-200 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* -------------------------------------------------------------
            FASE 2: MESA DE INVESTIGACIÓN (LOS CUATRO REGISTROS)
            ------------------------------------------------------------- */}
        {phase === 'investigation' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className={`space-y-6 ${isGlitching ? 'filter invert-[0.2] contrast-125' : ''}`}
          >
            {/* Panel de estado de investigación & Visor de descifrado */}
            <div className="rounded-xl border border-purple-900/40 bg-[#0d0c18]/80 p-4 sm:p-5 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span>REGISTROS DE MEMORIA RECUPERADOS: 4 / 4</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Organiza los 4 sucesos en orden cronológico (del más antiguo al más reciente según la serie).
                </p>
              </div>

              {/* Indicador de estado del candado */}
              <div
                className={`flex items-center gap-2.5 bg-black/70 border px-3.5 py-2 rounded-lg transition-all duration-300 ${
                  isOrderCorrect
                    ? 'border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-emerald-950/20'
                    : 'border-red-800/60 shadow-[0_0_12px_rgba(239,68,68,0.2)] bg-red-950/20'
                }`}
              >
                {isOrderCorrect ? (
                  <Unlock className="w-4 h-4 text-emerald-400 animate-pulse" />
                ) : (
                  <Lock className="w-4 h-4 text-red-400" />
                )}
                <div className="text-right">
                  <div className="text-[10px] text-neutral-400 tracking-wider">CANDADO DE SEGURIDAD</div>
                  <div
                    className={`text-[10px] font-bold font-mono tracking-wider ${
                      isOrderCorrect ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {isOrderCorrect ? '🔓 ABIERTO // PERMITIDO' : '🔒 CERRADO // BLOQUEADO'}
                  </div>
                </div>
              </div>
            </div>

            {/* Error de validación si existe */}
            <AnimatePresence>
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-lg border border-red-500/60 bg-red-950/40 p-4 text-xs text-red-200 flex items-start gap-3 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold tracking-wide">{validationError}</p>
                    <p className="text-[11px] text-red-300/80 mt-1">
                      💡 Consejo: Consulta el análisis de memoria en cada registro si deseas una orientación cronológica.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ranuras de Orden Cronológico (Slots) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['1º Primer Suceso', '2º Segundo Suceso', '3º Tercer Suceso', '4º Cuarto Suceso'].map(
                (label, slotIdx) => {
                  const recordInSlot = recordsOrder[slotIdx];
                  const isSlotCorrect = recordInSlot.correctChronologicalIndex === slotIdx;
                  const isSelected = selectedRecordId === recordInSlot.id;

                  return (
                    <div
                      key={slotIdx}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        isSlotCorrect
                          ? 'border-emerald-500/70 bg-emerald-950/30 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                          : isSelected
                          ? 'border-yellow-400 bg-yellow-950/30 shadow-[0_0_15px_rgba(234,179,8,0.25)]'
                          : 'border-purple-900/40 bg-black/40'
                      }`}
                    >
                      <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                        Posición {slotIdx + 1}
                      </div>
                      <div
                        className={`mt-1 flex items-center justify-center gap-1.5 font-mono text-base font-black transition-colors ${
                          isSlotCorrect
                            ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                            : 'text-neutral-500'
                        }`}
                      >
                        {isSlotCorrect ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 inline" />
                            <span>{recordInSlot.id}</span>
                          </span>
                        ) : (
                          <span className="tracking-widest opacity-75">??</span>
                        )}
                      </div>
                      <div
                        className={`text-[9px] truncate mt-0.5 font-mono ${
                          isSlotCorrect ? 'text-emerald-300/80 font-medium' : 'text-neutral-600'
                        }`}
                      >
                        {isSlotCorrect ? recordInSlot.canonTitle : 'Registro sin confirmar'}
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* Listado de Tarjetas Interactivas de los 4 Registros */}
            <div className="space-y-3">
              {recordsOrder.map((record, index) => {
                const isSelected = selectedRecordId === record.id;
                const isHintOpen = revealedHints[record.id];

                return (
                  <motion.div
                    key={record.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`relative rounded-xl border p-4 sm:p-5 transition-all duration-200 backdrop-blur-sm ${
                      isSelected
                        ? 'border-yellow-400/90 bg-[#141022] shadow-[0_0_25px_rgba(234,179,8,0.2)]'
                        : 'border-purple-900/40 bg-[#0c0a15]/90 hover:border-purple-700/60 shadow-lg'
                    }`}
                  >
                    {/* Fila superior de la tarjeta */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-950 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        {/* Identificador del Registro */}
                        <span className="px-2.5 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300 font-mono text-xs font-black tracking-widest">
                          REGISTRO {record.id}
                        </span>

                        <span className="text-[10px] text-neutral-400 font-bold tracking-wider">
                          Posición actual: #{index + 1}
                        </span>
                      </div>

                      {/* Controles para mover tarjeta arriba/abajo */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => moveRecord(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded bg-stone-900 hover:bg-purple-900/40 text-neutral-300 hover:text-white border border-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                          title="Mover antes en la línea de tiempo"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveRecord(index, 'down')}
                          disabled={index === recordsOrder.length - 1}
                          className="p-1 rounded bg-stone-900 hover:bg-purple-900/40 text-neutral-300 hover:text-white border border-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                          title="Mover después en la línea de tiempo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Botón para seleccionar y mover a slot */}
                        <button
                          onClick={() => {
                            if (isSelected) {
                              setSelectedRecordId(null);
                            } else {
                              soundEngine.playTerminalBeep(1.1);
                              setSelectedRecordId(record.id);
                            }
                          }}
                          className={`ml-2 px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-yellow-500 text-black border-yellow-400'
                              : 'bg-stone-900/80 text-neutral-300 border-white/10 hover:border-purple-500 hover:text-white'
                          }`}
                        >
                          {isSelected ? 'CANCELAR SELECCIÓN' : 'ASIGNAR POSICIÓN'}
                        </button>
                      </div>
                    </div>

                    {/* Selector de Slots si la tarjeta está seleccionada */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-3 p-2 rounded bg-yellow-950/20 border border-yellow-500/30 flex items-center justify-between text-xs text-yellow-300"
                      >
                        <span>Elige la posición a la que deseas mover este archivo:</span>
                        <div className="flex gap-1.5">
                          {[0, 1, 2, 3].map((slotIdx) => (
                            <button
                              key={slotIdx}
                              onClick={() => assignRecordToSlot(record.id, slotIdx)}
                              className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                                index === slotIdx
                                  ? 'bg-yellow-400 text-black'
                                  : 'bg-purple-950/60 hover:bg-purple-800 text-white border border-purple-500/40'
                              }`}
                            >
                              Pos #{slotIdx + 1}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Texto descriptivo del evento */}
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm text-neutral-100 font-sans leading-relaxed">
                        "{record.text}"
                      </p>

                      <div className="pt-2 text-xs text-purple-300/90 font-mono flex items-start gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-purple-200">Pregunta de investigación:</strong>{' '}
                          {record.question}
                        </span>
                      </div>
                    </div>

                    {/* Desplegable de Pista Opcional del Registro */}
                    <div className="mt-3 pt-2 border-t border-purple-950/40 flex items-center justify-between">
                      <button
                        onClick={() => toggleHintForRecord(record.id)}
                        className="text-[11px] text-neutral-400 hover:text-yellow-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-purple-400" />
                        <span>
                          {isHintOpen ? 'Ocultar análisis de memoria' : '🔍 Consultar análisis de memoria (Pista)'}
                        </span>
                        {isHintOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      <span className="text-[10px] text-neutral-500 font-mono">
                        REF: JCJ-EP-0{record.correctChronologicalIndex + 1}
                      </span>
                    </div>

                    {isHintOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 p-2.5 rounded bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-200 font-mono"
                      >
                        <span className="text-yellow-400 font-bold">ANÁLISIS JCJENSON: </span>
                        {record.optionalHint}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* =========================================================================
                SECCIÓN DE ACCIÓN: CONSOLA DE DESBLOQUEO CON CANDADO
                (Si no está en orden, NO se puede acceder a colocar contraseña y tiene candado.
                 Cuando estén en orden, se abre el candado y se habilita la contraseña)
                ========================================================================= */}
            <div className="pt-6 border-t border-purple-900/50">
              <div
                className={`max-w-xl mx-auto rounded-xl border-2 p-5 sm:p-6 backdrop-blur-md transition-all duration-300 ${
                  isOrderCorrect
                    ? 'border-emerald-500/70 bg-[#081410]/95 shadow-[0_0_40px_rgba(16,185,129,0.25)]'
                    : 'border-red-900/50 bg-[#0d0711]/95 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
                }`}
              >
                {/* Cabecera de la terminal */}
                <div className="flex items-center justify-between border-b border-purple-900/40 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    {isOrderCorrect ? (
                      <Unlock className="w-5 h-5 text-emerald-400 animate-pulse" />
                    ) : (
                      <Lock className="w-5 h-5 text-red-400" />
                    )}
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-200">
                      TERMINAL DE AUTORIZACIÓN COPPER 9
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 transition-all ${
                      isOrderCorrect
                        ? 'text-emerald-300 bg-emerald-950/70 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'text-red-400 bg-red-950/70 border-red-500/40'
                    }`}
                  >
                    {isOrderCorrect ? (
                      <>
                        <Unlock className="w-3 h-3 text-emerald-400" />
                        <span>CANDADO ABIERTO</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-red-400" />
                        <span>CANDADO CERRADO</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Banner de estado del candado */}
                {isOrderCorrect ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-3 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  >
                    <Unlock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-emerald-300 tracking-wide">
                        ¡CANDADO ABIERTO // REGISTROS ALINEADOS!
                      </p>
                      <p className="text-[11px] text-emerald-400/90 mt-0.5 font-sans leading-relaxed">
                        Los cuatro sucesos están en el orden cronológico correcto. La terminal de contraseña está habilitada. Escribe el código de 4 dígitos para continuar:
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="mb-4 p-3 rounded-lg bg-red-950/30 border border-red-900/50 flex items-start gap-3 text-red-200">
                    <Lock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-red-300 tracking-wide">
                        ACCESO BLOQUEADO // CANDADO DE SEGURIDAD ACTIVO
                      </p>
                      <p className="text-[11px] text-red-300/80 mt-0.5 font-sans leading-relaxed">
                        No se puede ingresar la contraseña mientras los registros no estén en el orden cronológico correcto. Reordena los 4 registros arriba para abrir el candado.
                      </p>
                    </div>
                  </div>
                )}

                {/* Formulario de entrada de código con teclado táctil/físico */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    verifyCode();
                  }}
                  className="space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        disabled={!isOrderCorrect}
                        value={isOrderCorrect ? manualCodeInput : ''}
                        onChange={(e) => {
                          if (!isOrderCorrect) return;
                          const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setManualCodeInput(val);
                          setValidationError(null);
                          if (val.length > 0) soundEngine.playTerminalBeep(1.2);
                        }}
                        placeholder={isOrderCorrect ? '____' : '🔒 [BLOQUEADO]'}
                        className={`w-full text-center tracking-[0.4em] font-mono text-2xl font-black rounded-lg py-2.5 px-4 outline-none transition-all shadow-inner ${
                          isOrderCorrect
                            ? 'text-yellow-400 bg-black/80 border-2 border-emerald-500/70 focus:border-yellow-400 placeholder:text-neutral-700 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'text-neutral-600 bg-black/90 border-2 border-red-950 placeholder:text-neutral-700 cursor-not-allowed opacity-50'
                        }`}
                      />
                      {isOrderCorrect && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-500">
                          {manualCodeInput.length}/4
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!isOrderCorrect || manualCodeInput.length === 0}
                      className={`w-full sm:w-auto px-6 py-3 rounded-lg font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                        isOrderCorrect && manualCodeInput.length > 0
                          ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.7)] cursor-pointer'
                          : 'bg-stone-900 border border-stone-800 text-stone-500 cursor-not-allowed opacity-40'
                      }`}
                    >
                      {isOrderCorrect ? (
                        <>
                          <Unlock className="w-4 h-4 text-black" />
                          <span>[ DESBLOQUEAR ]</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-stone-500" />
                          <span>[ CANDADO CERRADO ]</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Teclado numérico táctil estilo Murder Drones */}
                  <div className="pt-2 flex flex-col items-center">
                    <div className="text-[10px] text-neutral-500 font-mono mb-2 uppercase flex items-center gap-1.5">
                      {isOrderCorrect ? (
                        <>
                          <Unlock className="w-3 h-3 text-emerald-400" />
                          <span>Teclado táctil habilitado</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-red-400" />
                          <span>Teclado bloqueado por candado</span>
                        </>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 max-w-xs w-full">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                        <button
                          key={num}
                          type="button"
                          disabled={!isOrderCorrect}
                          onClick={() => {
                            if (!isOrderCorrect) return;
                            if (manualCodeInput.length < 4) {
                              soundEngine.playTerminalBeep(1.1);
                              setManualCodeInput((prev) => prev + num.toString());
                              setValidationError(null);
                            }
                          }}
                          className={`h-10 rounded font-mono font-bold text-sm transition-all flex items-center justify-center ${
                            isOrderCorrect
                              ? 'bg-stone-900/90 hover:bg-purple-900/50 border border-purple-900/60 hover:border-yellow-400/80 text-neutral-200 hover:text-yellow-300 cursor-pointer active:scale-95'
                              : 'bg-neutral-950 border border-neutral-900 text-neutral-700 cursor-not-allowed opacity-30'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!isOrderCorrect}
                        onClick={() => {
                          if (!isOrderCorrect) return;
                          soundEngine.playTerminalBeep(0.9);
                          setManualCodeInput((prev) => prev.slice(0, -1));
                          setValidationError(null);
                        }}
                        className="px-3 py-1 rounded bg-stone-900 hover:bg-stone-800 text-[11px] text-neutral-400 hover:text-white border border-white/10 disabled:opacity-20 disabled:pointer-events-none cursor-pointer font-mono"
                      >
                        ← Borrar
                      </button>
                      <button
                        type="button"
                        disabled={!isOrderCorrect}
                        onClick={() => {
                          if (!isOrderCorrect) return;
                          soundEngine.playTerminalBeep(0.8);
                          setManualCodeInput('');
                          setValidationError(null);
                        }}
                        className="px-3 py-1 rounded bg-stone-900 hover:bg-stone-800 text-[11px] text-neutral-400 hover:text-rose-400 border border-white/10 disabled:opacity-20 disabled:pointer-events-none cursor-pointer font-mono"
                      >
                        Limpiar todo
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}

        {/* -------------------------------------------------------------
            FASE 3: ACCESO CONCEDIDO (RESOLUCIÓN EXITOSA)
            ------------------------------------------------------------- */}
        {phase === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-2xl mx-auto"
          >
            <div className="relative rounded-2xl border-2 border-yellow-400/80 bg-[#0d091a]/95 backdrop-blur-xl p-6 sm:p-10 shadow-[0_0_60px_rgba(234,179,8,0.3)] text-center overflow-hidden">
              {/* Resplandor del Solver en el centro */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-yellow-500/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

              {/* Símbolo animado del Absolute Solver */}
              <motion.div
                initial={{ rotate: -45, scale: 0.7 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.8, type: 'spring' }}
                className="w-20 h-20 mx-auto rounded-full border-2 border-yellow-400 bg-yellow-950/40 flex items-center justify-center text-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.5)] mb-6"
              >
                <svg viewBox="0 0 100 100" className="w-12 h-12 text-yellow-300">
                  <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="4" />
                  <circle cx="50" cy="50" r="8" fill="currentColor" />
                  <path d="M 50 10 L 50 35 M 44 22 L 50 10 L 56 22" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path d="M 15 70 L 37 57 M 21 60 L 15 70 L 27 72" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path d="M 85 70 L 63 57 M 73 72 L 85 70 L 79 60" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </motion.div>

              <div className="inline-block px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs font-bold tracking-widest uppercase mb-3">
                ✓ AUTORIZACIÓN JCJENSON // ACCESO CONCEDIDO
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-neutral-100 tracking-tight mb-2">
                EXPEDIENTE 013 DESCLASIFICADO
              </h2>

              <p className="text-xs sm:text-sm text-purple-300 max-w-lg mx-auto font-mono mb-6">
                Línea temporal de Copper 9 restaurada exitosamente:
                <br />
                <span className="text-yellow-300 font-bold text-base tracking-widest mt-1 block">
                  K-01 → K-04 → K-02 → K-07
                </span>
              </p>

              {/* Caja de Código de Seguridad */}
              <div className="max-w-xs mx-auto p-4 rounded-xl bg-black/80 border border-yellow-400/60 shadow-[0_0_30px_rgba(234,179,8,0.25)] mb-6">
                <div className="text-[10px] text-neutral-400 font-mono tracking-widest mb-1">
                  CÓDIGO DE DESBLOQUEO VERIFICADO
                </div>
                <div className="font-mono text-3xl font-black tracking-[0.3em] text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]">
                  1 3 4 5
                </div>
              </div>

              {/* Mensaje de resolución */}
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs sm:text-sm text-neutral-200 leading-relaxed max-w-lg mx-auto mb-8 font-sans">
                <p className="font-semibold text-yellow-300 mb-1">
                  ¡Impresionante deducción! ✨🖤💛
                </p>
                <p className="text-neutral-300">
                  Has demostrado un conocimiento absoluto de cada episodio y misterio de Murder Drones. El sistema ha desbloqueado la siguiente etapa del viaje.
                </p>
              </div>

              {/* Botón para pasar a la siguiente escena */}
              <button
                onClick={() => {
                  soundEngine.playAccessGrantedCyber();
                  onComplete();
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-sm tracking-widest uppercase transition-all shadow-[0_0_35px_rgba(234,179,8,0.5)] hover:shadow-[0_0_45px_rgba(234,179,8,0.8)] flex items-center justify-center gap-3 cursor-pointer mx-auto"
              >
                <span>CONTINUAR HACIA EL OCÉANO</span>
                <ArrowRight className="w-5 h-5 text-black" />
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* =========================================================================
          MODAL DE PISTAS GENERALES (2 NIVELES REQUERIDOS)
          ========================================================================= */}
      <AnimatePresence>
        {showGeneralHints && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="w-full max-w-lg rounded-xl border border-yellow-500/50 bg-[#0d0a17] p-6 shadow-[0_0_40px_rgba(234,179,8,0.2)] text-neutral-200 font-mono"
            >
              <div className="flex items-center justify-between border-b border-purple-900/50 pb-3 mb-4">
                <div className="flex items-center gap-2 text-yellow-400 text-sm font-bold">
                  <HelpCircle className="w-4 h-4" />
                  <span>TERMINAL DE ASISTENCIA TÁCTICA</span>
                </div>
                <button
                  onClick={() => setShowGeneralHints(false)}
                  className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded bg-stone-900 border border-white/10 cursor-pointer"
                >
                  Cerrar [ESC]
                </button>
              </div>

              <p className="text-xs text-neutral-400 mb-4 font-sans">
                Consulta los niveles de ayuda graduales si necesitas orientar la investigación cronológica de los episodios:
              </p>

              {/* Nivel 1 */}
              <div className="mb-4 p-3.5 rounded-lg bg-black/50 border border-purple-800/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-purple-300">NIVEL 1 // ORIENTACIÓN BÁSICA</span>
                  {unlockedHintLevel < 1 && (
                    <button
                      onClick={() => setUnlockedHintLevel(1)}
                      className="text-[10px] px-2 py-0.5 rounded bg-yellow-500 text-black font-bold cursor-pointer hover:bg-yellow-400"
                    >
                      Revelar Pista 1
                    </button>
                  )}
                </div>
                {unlockedHintLevel >= 1 ? (
                  <p className="text-xs text-yellow-200 font-sans leading-relaxed">
                    "Piensa en el orden de los acontecimientos de la serie, no en el orden en el que aparecen los archivos."
                  </p>
                ) : (
                  <p className="text-[11px] text-neutral-600 italic">Pista codificada. Haz clic para revelar.</p>
                )}
              </div>

              {/* Nivel 2 */}
              <div className="mb-6 p-3.5 rounded-lg bg-black/50 border border-purple-800/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-purple-300">NIVEL 2 // RELACIÓN DE SUCESOS</span>
                  {unlockedHintLevel < 2 && (
                    <button
                      onClick={() => setUnlockedHintLevel(2)}
                      className="text-[10px] px-2 py-0.5 rounded bg-yellow-500 text-black font-bold cursor-pointer hover:bg-yellow-400"
                    >
                      Revelar Pista 2
                    </button>
                  )}
                </div>
                {unlockedHintLevel >= 2 ? (
                  <p className="text-xs text-yellow-200 font-sans leading-relaxed">
                    "El encuentro que inicia la historia ocurre antes de la celebración escolar y del campamento."
                  </p>
                ) : (
                  <p className="text-[11px] text-neutral-600 italic">
                    {unlockedHintLevel >= 1
                      ? 'Pista adicional disponible. Haz clic para revelar.'
                      : 'Requiere haber leído primero la Pista 1.'}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowGeneralHints(false)}
                  className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold cursor-pointer"
                >
                  Regresar a la investigación
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          PIE DE PÁGINA TECNOLÓGICO
          ========================================================================= */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto py-3 px-4 sm:px-6 border-t border-purple-950/40 text-[10px] text-neutral-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>JCJENSON EXOPLANET DIVISION</span>
          <span>•</span>
          <span>SISTEMA COPPER 9 // AUTORIZACIÓN SOLVER</span>
        </div>
        <div className="font-mono text-neutral-600">
          [ ABSOLUTE SOLVER INTERFACE // ENCRYPTED 1345 ]
        </div>
      </footer>
    </div>
  );
};
