# Ledger — Colección Magic

App web (PWA) para llevar el control de tu colección de cartas de Magic: The Gathering: búsqueda y añadido de cartas (datos y precios de [Scryfall](https://scryfall.com)), escaneo por cámara con lectura de texto (OCR), mazos con curva de maná, carpetas/binders, valor total de la colección y exportación/importación en CSV.

Todo se guarda **solo en tu dispositivo** (en el almacenamiento del navegador), no hay servidor ni cuenta.

## Antes de nada: necesitas alojarla en algún sitio con HTTPS

Esta carpeta es una app web normal (HTML/CSS/JS, sin frameworks ni instalación). Puedes abrir `index.html` directamente en el navegador para probar la búsqueda y la colección, pero **la cámara y la instalación como app en el móvil solo funcionan si la sirves por HTTPS** (es una norma de seguridad de los navegadores, no de esta app). La forma más rápida y gratuita:

### Opción A — GitHub Pages (recomendada, gratis, en ~5 minutos)
1. Crea un repositorio nuevo en GitHub y sube el contenido de esta carpeta (`index.html`, `manifest.json`, `sw.js`, `icons/`).
2. En el repositorio: **Settings → Pages → Source: Deploy from a branch**, elige la rama `main` y la carpeta `/root`.
3. Espera un minuto y GitHub te dará una URL tipo `https://tu-usuario.github.io/tu-repo/`. Ábrela en el móvil.

### Opción B — Netlify Drop (sin cuenta, aún más rápido)
1. Ve a [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arrastra esta carpeta completa.
3. Netlify te da una URL HTTPS al instante.

### Instalar en el móvil
Abre la URL en Chrome (Android) o Safari (iPhone) y elige **"Añadir a pantalla de inicio"** (o el aviso automático de "Instalar app"). Quedará como una app normal, con icono propio y a pantalla completa.

## Funcionalidades

- **Colección**: busca cualquier carta (autocompletado), elige la edición exacta (cada edición tiene su propio precio e imagen), indica cantidad, estado (NM/LP/MP/HP/DMG), idioma, si es foil y en qué carpeta guardarla.
- **Escanear**: activa la cámara trasera, encuadra el nombre de la carta y pulsa "Capturar y leer". Usa reconocimiento de texto (OCR) sobre esa zona — no es reconocimiento de imagen completo como apps dedicadas, así que a veces habrá que corregir el texto a mano. Siempre puedes escribir el nombre directamente.
- **Mazos**: crea mazos, añade cartas por nombre, mira la curva de maná y cuántas copias ya tienes en tu colección.
- **Carpetas**: organiza tu colección física en carpetas/binders.
- **Ajustes**: tema claro/oscuro/automático, moneda (EUR/USD), actualizar precios de toda la colección contra Scryfall, exportar/importar CSV, vaciar todo.

## Importar tu colección desde ManaBox

1. En ManaBox: pestaña **Colección** → menú (arriba a la derecha) → **Export** → CSV. Te genera un archivo `.csv` con toda tu colección (o puedes exportar solo un binder/lista concreto desde su propia pantalla).
2. Pásate ese archivo a tu móvil u ordenador (por AirDrop, correo, Google Drive, cable, como prefieras).
3. Abre esta app → pestaña **Ajustes** → **Importar CSV** → elige el archivo.
4. La app reconoce directamente el formato de ManaBox (nombre, edición, número de colección, foil, estado de la carta, idioma, ID de Scryfall) y consulta Scryfall carta por carta para traer la imagen y el precio actual de cada una. Con colecciones grandes puede tardar varios minutos — no cierres la pestaña mientras la barra de progreso esté en marcha.
5. Si algunas cartas no se importan (contador de "con error" al terminar), suele ser porque esa edición ya no existe en Scryfall con ese código; puedes añadirlas a mano desde la pestaña Colección.

También puedes exportar tu propia colección de esta app y volver a importarla (por ejemplo, si cambias de móvil): usa "Exportar CSV" y luego "Importar CSV" con ese mismo archivo.

## Notas técnicas

- Los datos se guardan en **IndexedDB** del navegador. Si borras los datos de navegación del navegador o cambias de dispositivo, se pierden — usa "Exportar CSV" de vez en cuando como copia de seguridad.
- Los precios y datos de cartas vienen de la API pública de Scryfall en tiempo real; necesitas conexión a internet para buscar/añadir cartas y actualizar precios (el resto de la app funciona sin conexión una vez cargada, gracias al service worker).
- Sin dependencias de build: es HTML/CSS/JS plano. El único script externo es Tesseract.js (para el OCR del escáner), que se carga solo cuando lo usas.
