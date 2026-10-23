# Archivos y Personalización

Esta carpeta `public/assets/` está organizada para que puedas colocar tus propios archivos multimedia cuando los tengas listos:

### 1. Fotografía del Gato (`/assets/photos/gato.jpg`)
Coloca aquí la fotografía de tu gato con la cinta/diadema con la palabra **"ROMPERACHAS"**.
- La aplicación ya busca esta ruta por defecto en `src/config.ts`.
- Mientras no esté el archivo físico, la web muestra un marco de ilustración placeholder muy elegante.

### 2. Canción de Laufey (`/assets/audio/from-the-start.mp3`)
Si deseas que suene el audio real en la etapa de Laufey, coloca aquí el archivo `.mp3`.
- Si el archivo no está presente, la web genera de forma automática y procedural los acordes jazz/bossa-nova con Web Audio API y el sonido vintage del tocadiscos.

### 3. Memes y Fotos de la Fiesta (`/assets/memes/`)
Puedes agregar imágenes como:
- `meme1.jpg`
- `meme2.jpg`
- `meme3.jpg`
- `meme4.jpg`
- `meme5.jpg`
Y ajustar sus nombres o añadir más en la lista `memes` dentro de `src/config.ts`.

### 4. Modificar Textos, Contraseñas y Tiempos
Abre el archivo `src/config.ts` donde encontrarás:
- Contraseñas (`firstPassword`, `magicPassword`, `musicPassword`)
- Respuestas de la mecánica ("turron", "toffee", "dulce")
- El tiempo del temporizador oculto (`hiddenTimerMs = 60000`)
- El texto del océano (`personalOceanText` y `deepSeaQuote`)
- Tu enlace final (`finalUrl`)
