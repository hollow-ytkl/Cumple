/**
 * CONFIGURACIÓN PRINCIPAL DE LA EXPERIENCIA
 * 
 * Puedes modificar libremente cualquier texto, contraseña, imagen o tiempo en este archivo.
 * Todo está preparado para que lo adaptes a tu gusto.
 */

export interface MemeItem {
  id: string;
  title: string;
  src?: string; // Ruta de la imagen (ej: "/assets/memes/meme1.jpg" o dejar vacío para usar sticker interactivo)
  caption: string;
  fallbackEmoji: string;
  bgColor: string;
  tilt: number;
}

export const CONFIG = {
  // Información personal
  recipientName: "Catalina",

  // ==========================================
  // ETAPA 1 & 2: INTRODUCCIÓN Y GALERÍA OSCURA
  // ==========================================
  // Contraseña de la primera etapa (se evaluará ignorando mayúsculas/minúsculas y espacios accidentales)
  firstPassword: "romperachas",

  // Textos y pistas de la galería
  galleryPrompt: "Hay algo que ya viste antes.",
  galleryHint1: "No todo lo que buscas está aquí, aveces es bueno ver lo bueno y malo.",
  galleryHint2: "esta en cierta vincha",
  galleryErrorMsg: "Hmm... todavía falta descubrir algo.",

  // Foto especial: El gato con la cinta "ROMPERACHAS"
  // Si tienes el archivo, colócalo en public/assets/photos/gato.jpg o cambia la ruta aquí
  catPhotoSrc: "/assets/photos/gato.jpg",
  catPhotoNote: "Fotografía especial recibida anteriormente",

  // Fotografías de la galería vintage
  galleryPhotos: [
    {
      id: "photo-1",
      title: "El espíritu festivo",
      subtitle: "Bailando con los brazos abiertos",
      handwrittenNote: "cuando la alegría no cabe en el cuerpo...",
      src: "/assets/photos/photo-1.jpg",
      tilt: -2.5,
      isTarget: false,
    },
    {
      id: "photo-cat-target",
      title: "El cómplice con la cinta",
      subtitle: "Un pequeño protagonista que ya se cruzó en tu camino",
      handwrittenNote: "míralo bien... lleva algo puesto en la frente",
      src: "/assets/photos/photo-2.jpg",
      tilt: 2.2,
      isTarget: true, // Esta es la foto clave (Gato con la cinta "ROMPERACHAS")
    },
    {
      id: "photo-3",
      title: "Mirada sabia",
      subtitle: "Concentración total y lentes de lectura",
      handwrittenNote: "modo intelectual activado...",
      src: "/assets/photos/photo-3.jpg",
      tilt: -1.8,
      isTarget: false,
    },
    {
      id: "photo-4",
      title: "Sonrisa radiante",
      subtitle: "Dientes perfectos y mirada brillante",
      handwrittenNote: "la mejor de las sonrisas para hoy...",
      src: "/assets/photos/photo-4.jpg",
      tilt: 2.8,
      isTarget: false,
    },
  ],

  // ==========================================
  // ETAPA 3: MAGIA (INSPIRADA EN HARRY POTTER)
  // ==========================================
  // Contraseña mágica cambiada a "lumos"
  magicPassword: "lumos",
  magicHint: "Un encantamiento elemental para encender la luz en la punta de la varita...",
  magicBookTitle: "Harry Potter y la piedra filosofal",
  harryPotterCoverSrc: "/assets/books/harry_potter.jpg",
  magicYouTubeId: "wtHra9tFISY",
  magicYouTubeUrl: "https://www.youtube.com/watch?v=wtHra9tFISY&list=RDwtHra9tFISY&start_radio=1",

  // Grimorio de encantamientos clasificados
  grimoireSpells: {
    utilidad: [
      { name: "Accio", description: "Permite atraer un objeto hacia las manos del mago, incluso si está lejos.", isTarget: false },
      { name: "Alohomora", description: "Sirve para abrir puertas y cerraduras cerradas.", isTarget: false },
      { name: "Lumos", description: "Enciende la punta de la varita para producir luz.", isTarget: true },
      { name: "Nox", description: "Apaga la luz de la varita creada por Lumos.", isTarget: false },
      { name: "Reparo", description: "Arregla objetos que están rotos.", isTarget: false },
      { name: "Wingardium Leviosa", description: "Hace que los objetos floten en el aire.", isTarget: false },
    ],
    defensa: [
      { name: "Expecto Patronum", description: "Crea un protector luminoso contra los dementores.", isTarget: false },
      { name: "Expelliarmus", description: "Desarma al oponente quitándole su varita u objeto.", isTarget: false },
      { name: "Desmaius", description: "Deja inconsciente o inmoviliza al rival.", isTarget: false },
      { name: "Protego", description: "Crea un escudo mágico para bloquear otros hechizos.", isTarget: false },
      { name: "Riddikulus", description: "Se usa para vencer a un boggart transformándolo en algo gracioso.", isTarget: false },
    ],
    oscuras: [
      { name: "Avada Kedavra", description: "La maldición asesina que causa la muerte instantánea.", isTarget: false },
      { name: "Crucio", description: "Provoca un dolor físico extremo y tortura a la víctima.", isTarget: false },
      { name: "Imperio", description: "Controla las acciones de la persona eliminando su libre albedrío.", isTarget: false },
    ],
  },

  // ==========================================
  // ETAPA 4: ETAPA MUSICAL (INSPIRADA EN LAUFEY)
  // ==========================================
  // Contraseña musical
  musicPassword: "from the start",
  musicHint: "Una melodía bossa-nova... alguien que confiesa lo que siente desde el primer compás.",
  musicSongTitle: "From The Start",
  musicArtistCensored: "██████", // Nombre censurado
  // Video oficial de YouTube solicitado por el usuario (From The Start Audio Oficial)
  musicYouTubeId: "lSD_L-xic9o",
  musicAudioSrc: "/assets/audio/from-the-start.mp3",

  // ==========================================
  // ETAPA EXPEDIENTE 013: MURDER DRONES // COPPER 9
  // ==========================================
  murderDronesYouTubeId: "2RL2e6cK5DI",
  murderDronesPlaylistId: "PLwyyUdV4sEKOnT3elPE5d_THK1TDQPnmQ",
  murderDronesYouTubeUrl: "https://www.youtube.com/watch?v=2RL2e6cK5DI&list=PLwyyUdV4sEKOnT3elPE5d_THK1TDQPnmQ&index=1",

  // ==========================================
  // ETAPA 5: ETAPA PERSONAL (LA PLAYA Y EL MAR)
  // ==========================================
  // Video de YouTube solicitado para sonar de fondo en la playa
  beachYouTubeId: "fz9EZEMJi6M",
  beachYouTubeUrl: "https://www.youtube.com/watch?v=fz9EZEMJi6M&list=RDfz9EZEMJi6M&start_radio=1",
  beachImageSrc: "/assets/images/beach.jpg",

  // [AQUÍ IRÁ EL TEXTO PERSONAL] - Modifica este texto libremente
  personalOceanText:
    "Muy bien llegaste aca, sigue asi campeona, falta poco jijiji",

  // Texto que aparece al llegar al fondo del océano
  deepSeaQuote: "Esto va para una persona muy especial en todos los aspectos...",

  // ==========================================
  // ETAPA 6: MECÁNICA ESPECIAL - "ALGO QUE TE GUSTA"
  // ==========================================
  // Grupos de respuestas válidas (acepta singular, plural, con y sin tilde, mayúsculas y minúsculas)
  validAnswerGroups: {
    dulce: {
      tokens: ["dulce", "dulces"],
      reaction: "estás muy muy muy cerca",
    },
    toffee: {
      tokens: ["toffee", "toffees", "toffe", "tofes", "tofeee", "tofi", "tofis"],
      reaction: "estás muy muy cerca",
    },
    turron: {
      tokens: ["turron", "turrón", "turrones"],
      reaction: "cerca",
    },
    cafe: {
      tokens: ["cafe", "café", "cafes", "cafés"],
      reaction: "muy cerca, qué buen gusto...",
    },
    chocoteja: {
      tokens: ["chocoteja", "chocotejas"],
      reaction: "estás muy muy muy cerca",
    },
    kiss: {
      tokens: ["kiss", "kisses", "kis", "kises"],
      reaction: "muy cerca...",
    },
    conejo: {
      tokens: ["conejo", "conejos", "coneja", "conejas", "conejito", "conejitos", "conejita", "conejitas"],
      reaction: "estás muy muy cerca",
    },
    dibujo: {
      tokens: ["dibujo", "dibujos", "dibujar", "dibujito", "dibujitos"],
      reaction: "estás muy muy cerca",
    },
    rei: {
      tokens: ["rei", "reis", "rei ayanami", "ayanami rei", "ayanami"],
      reaction: "estás muy muy cerca",
    },
    attackOnTitan: {
      tokens: ["attack on titan", "attacks on titan", "aot", "shingeki", "shingeki no kyojin", "ataque a los titanes", "ataque de los titanes", "titanes"],
      reaction: "estás muy muy cerca",
    },
    paleta: {
      tokens: ["paleta", "paletas", "paletita", "paletitas"],
      reaction: "estás muy muy cerca",
    },
    chupetin: {
      tokens: ["chupetin", "chupetín", "chupetines", "chupete", "chupetes"],
      reaction: "estás muy muy cerca",
    },
    fruna: {
      tokens: ["fruna", "frunas", "frunita", "frunitas"],
      reaction: "estás muy muy cerca",
    },
    trufa: {
      tokens: ["trufa", "trufas", "trufita", "trufitas"],
      reaction: "estás muy muy cerca",
    },
  },

  // Temporizador oculto (en milisegundos). 60000 ms = 60 segundos
  // Para pruebas puedes reducirlo temporalmente (ej: 5000), pero por defecto son 60s
  hiddenTimerMs: 60000,
  hiddenTimerProcessingText: "Analizando respuesta...",
  hiddenTimerRevealText: "Bueno... la verdad es que todas eran correctas.",

  // ==========================================
  // ETAPA 7: FINAL DE CUMPLEAÑOS
  // ==========================================
  birthdayHeadline: "FELIZ CUMPLEAÑOS",
  birthdayRecipient: "PA MI LOLI FAV",
  
  // Canción de celebración de YouTube para la fiesta
  partyYouTubeId: "FE_KnGLsX5c",
  partyYouTubeUrl: "https://www.youtube.com/watch?v=FE_KnGLsX5c",
  
  // Enlace o URL final que quieras regalarle o compartir
  finalUrl: "https://wplace.live/?lat=-9.356022214816717&lng=-77.931826171875&zoom=21.082260156193005",
  finalUrlLabel: "Ver tu lugar especial en WPlace",

  // Audio opcional de celebración para la fiesta (si no se proporciona, se usa el sintetizador Web Audio)
  partyAudioSrc: "/assets/audio/party.mp3",

  // Lista de memes / imágenes animadas de la fiesta
  // Puedes colocar tus archivos en public/assets/memes/ y poner las rutas aquí
  memes: [
    {
      id: "meme-1",
      title: "Gato Fiestero",
      caption: "¡Hoy no se duerme!",
      fallbackEmoji: "🐱🎉",
      src: "/assets/memes/meme1.jpg",
      bgColor: "from-amber-400 to-pink-500",
      tilt: -6,
    },
    {
      id: "meme-2",
      title: "Bailoteo Épico",
      caption: "Modo cumpleaños activado",
      fallbackEmoji: "💃✨",
      src: "/assets/memes/meme2.jpg",
      bgColor: "from-purple-500 to-indigo-600",
      tilt: 8,
    },
    {
      id: "meme-3",
      title: "100% Vibra",
      caption: "Que los cumplas muy feliz",
      fallbackEmoji: "🥳🎂",
      src: "/assets/memes/meme3.jpg",
      bgColor: "from-emerald-400 to-teal-600",
      tilt: -4,
    },
    {
      id: "meme-4",
      title: "Gato Confundido",
      caption: "¿Alguien dijo romperachas?",
      fallbackEmoji: "😸🍰",
      src: "/assets/memes/meme4.jpg",
      bgColor: "from-rose-400 to-orange-500",
      tilt: 7,
    },
    {
      id: "meme-5",
      title: "Celebración Máxima",
      caption: "¡Por muchos años más!",
      fallbackEmoji: "⭐🎈",
      src: "/assets/memes/meme5.jpg",
      bgColor: "from-cyan-400 to-blue-600",
      tilt: -8,
    },
  ] as MemeItem[],
};
