# AGENTS.md

D-Utils es un sitio estático alojado en GitHub Pages con herramientas que se ejecutan exclusivamente en el navegador, sin dependencias externas.
No cuenta con gestores de paquetes, pasos de compilación, empaquetadores, linters ni suites de pruebas automatizadas.

## Verificación de cambios

- No hay comandos que ejecutar. Abre `index.html` en un navegador web y prueba la funcionalidad de la página.
- `pages/recortar/` requiere archivos reales JPG/PNG para su verificación; también admite arrastrar y soltar y URLs remotas (siempre que CORS lo permita).
- Mantén todo funcionando como archivos estáticos puros; no existe configuración para servidores locales de desarrollo.

## Estructura y arquitectura

- `index.html` raíz es el lanzador táctico con buscador, filtros y tarjetas dinámicas.
- `pages/` contiene todas las herramientas modulares y subaplicaciones (cada una en su propia carpeta autocontenida).
- `assets/css/` contiene las hojas de estilo de cimientos y temas globales:
  - `base.css`: reset de estilos, fuentes `@font-face`, etiquetas HTML base, maquetación estructural y orquestador de submódulos mediante `@import`. Carga Rubik vía `url("../fonts/...")`.
  - `temas.css`: variables CSS globales y skins de tema (`tactico`, `laboratorio`, `cartoon`, `gatos`).
  - `tactico-ui.css`: primitivas y controles HUD tácticos comunes (botones, badges, interruptores, selects, paneles de control).
  - `portada.css`: maquetación de escritorio, cuadrícula de tarjetas, barra de búsqueda y chips de filtro de la página principal.
  - `animaciones.css`: animaciones de vista previa y keyframes.
- `assets/base.js` se carga en el `<head>` **sin** atributo `defer`: establece `data-theme` antes del primer renderizado para evitar parpadeos visuales (FOUC), inyecta el esqueleto y los slots de la barra superior (selector de temas `#tema-host`, efectos de audio con Web Audio API, host de radio) y gestiona los atajos de teclado globales (`/`, `Esc`, `T`, `M`, `R`).
  NO añadas componentes completos aquí; extrae los componentes compartidos a `componentes/` y los específicos de herramientas a `pages/<carpeta>/`.
- `componentes/` aloja módulos JavaScript reutilizables compartidos entre múltiples páginas, con sus respectivas hojas de estilo en `componentes/css/`:
  - `temas.js`: registro y selector accesible de temas visuales (`window.DUtilsTemas`). Los temas (`tactico`, `laboratorio`, `cartoon`, `gatos`, etc.) definen la estética completa y reemplazan el antiguo modo binario claro/oscuro.
  - `catalogo.js`: array central de herramientas y renderizador de tarjetas (`window.DUtilsCatalogo`).
  - `iconos.js`: diccionario de ilustraciones SVG en línea e iconos de UI (`window.DUtilsIconos`). Soporta variantes por tema mediante `window.DUtilsIconos.obtener(id, tema)`. Todos los iconos pertenecen a este archivo; nunca insertes SVGs directamente en otros scripts.
  - `fondo.js`: fondo dinámico y nebulosas en canvas adaptables al tema visual (`window.DUtilsFondo`).
  - `radio.js` / `css/radio.css`: reproductor de radio táctica integrada (`window.DUtilsRadio`).
  - `buscador.js` / `css/buscador.css`: buscador con normalización insensible a acentos, chips de filtro y estado vacío.
  - `css/modal.css`: ventanas modales y popups tácticos (`.modal-overlay`, `.modal-card`).
  - `footer.js` / `css/footer.css`: pie del sistema táctico y atajos interactivos (`window.DUtilsFooter`).
  - `dropzone.js` / `css/dropzone.css`: panel común de arrastre y subida de archivos parametrizable (`window.DUtilsDropzone`).
  - `bloque-texto.js` / `css/bloque-texto.css`: editor y visor de texto reutilizable con barra de acciones (`window.DUtilsBloqueTexto`).
- Cada herramienta es una unidad autocontenida en `pages/<carpeta>/`:
  - Vista principal: `pages/<carpeta>/index.html`. Carga `../../assets/css/base.css` y `../../assets/base.js`.
  - Estilos específicos de la herramienta: se extraen en `pages/<carpeta>/<herramienta>.css` (ej. `pages/contador-palabras/contador.css`) en lugar de incrustar bloques `<style>` en `index.html`.
  - Módulos específicos de la herramienta: se extraen en `pages/<carpeta>/<herramienta>.js` (ej. `pages/contador-palabras/contador.js`) en lugar de sobrecargar `componentes/` (reservado para utilidades transversales).
- Las herramientas completadas utilizan la etiqueta de estado **"Disponible"** (`data-estado="disponibles"`). Las pendientes enlazan al marcador de posición de su carpeta o a `en-construccion.html`.

## Convenciones

- Textos de interfaz, comentarios en el código, identificadores y mensajes de commit deben redactarse en **español**. Mantén cualquier código nuevo consistente con esta norma.
- **Commits de Git**: NUNCA hacer un commit (`git commit`) de forma automática ni por iniciativa propia; solo crear commits cuando el usuario lo solicite explícitamente en su mensaje.
- Aplica estilos mediante variables CSS definidas en `base.css` / `temas.css` (`--bg`, `--fg`, `--muted`, `--accent`, `--card`, `--line`, `--error`, `--accent-glow`, etc.). No uses colores fijos codificados a mano.
- **Guía de Arquitectura CSS y Antiduplicación**:
  - **Dónde buscar antes de escribir CSS (para evitar duplicación)**:
    1. `assets/css/base.css` (orquestador `@import`): reset, fuentes `@font-face`, layout estructural de `main`, `nav a`, títulos y estilos HTML base.
    2. `assets/css/temas.css`: variables y skins de tema (`--bg`, `--fg`, `--accent`, etc.) para los 4 temas visuales.
    3. `assets/css/tactico-ui.css`: primitivas y controles HUD comunes: botones tácticos (`.btn-tactico`, `.btn-tactico-primario`), badges (`.hud-badge`, `.pulse-dot`), selects (`.select-tactico`), interruptores (`.switch-contenedor`), paneles (`.panel-controles`, `.variable-card`), conmutadores segmentados (`.selector-segmentado`, `.btn-segmento`), métricas (`.kpi-tile`), banners de aviso (`.aviso-tactico`), estados vacíos (`.estado-vacio`), toasts (`.hud-toast`) y borde neón decorativo (`.card-accent-top::before`).
    4. `componentes/css/`: estilos modulares compartidos (`buscador.css`, `modal.css`, `topbar.css`, `radio.css`, `footer.css`, `dropzone.css`, `bloque-texto.css`).
  - **Ubicación de hojas de estilo**:
    - Estilos de componentes compartidos: van OBLIGATORIAMENTE en `componentes/css/<nombre>.css`, nunca mezclados en la raíz de `componentes/` ni acumulados en `base.css`.
    - Estilos de herramientas individuales: van en `pages/<herramienta>/<herramienta>.css`. NUNCA usar etiquetas `<style>` incrustadas en `index.html`.
  - **Prohibición de re-declaración**: Antes de crear un botón, buscador, diálogo modal, conmutador de pestañas o tarjeta KPI, reutilizar las clases de `tactico-ui.css` o `componentes/css/`. No sobreescribir `.btn-tactico`, `.search-wrapper`, `nav a` ni duplicar gradientes `::before`.
  - **Orquestación en `base.css`**: Los nuevos submódulos CSS comunes que apliquen a toda la aplicación deben registrarse mediante `@import` en `assets/css/base.css`.
  - **Radios de borde (`--radio-borde` vs `--radio-card`)**: En los temas `tactico` y `laboratorio`, `--radio-borde` vale `999px` (diseñado exclusivamente para botones tipo píldora, chips y controles circulares). **Nunca** uses `--radio-borde` en contenedores rectangulares, `div`s, paneles, visores de vídeo/imagen o campos de texto/número, porque los convierte en óvalos; usa siempre `--radio-card` (`12px`–`20px` según el tema) para cualquier caja o contenedor.
- Las herramientas terminadas siempre llevan la etiqueta **"Disponible"** (nunca "Lista").
- Sin CDNs, peticiones externas ni librerías de terceros: las fuentes se alojan localmente y todo el procesamiento ocurre en el cliente. `recortar` implementa su propio generador de ZIP, no lo sustituyas por JSZip.
- **Modularidad de componentes**: Los nuevos componentes NO deben implementarse íntegramente dentro de `assets/base.js`. `base.js` solo gestiona los enlaces base compartidos, slots, tema y atajos globales. Extrae los componentes reutilizables a `componentes/` (ej. `componentes/<nombre>.js`), mientras que la lógica y estilos dedicados a una sola herramienta deben residir en su carpeta correspondiente (ej. `pages/<herramienta>/<herramienta>.js` y `pages/<herramienta>/<herramienta>.css`). En caso de duda, consulta al usuario antes de proceder.
- **Centralización de iconos**: TODOS los iconos y SVGs deben registrarse en `componentes/iconos.js` bajo `window.DUtilsIconos`. Nunca insertes SVGs en línea en `base.js` ni en otros componentes. En caso de duda, consulta al usuario antes de proceder.
- Para añadir una herramienta: crea `pages/<nombre>/index.html`, añade su previsualización SVG a `componentes/iconos.js` e incorpora una entrada en `DUtilsCatalogo` dentro de `componentes/catalogo.js` (con título, descripción, categoría, estado, etiquetas y palabras clave de búsqueda `keywords`).
- En `pages/recortar/index.html`, las imágenes se reducen (~1 MP, lado máximo 1200 px) **antes** de aplicar el margen, de modo que `margen` representa exactamente píxeles finales. Las constantes se ubican al inicio del script. El script de Python mencionado en comentarios no forma parte de este repositorio.

## Despliegue

- `.github/workflows/static.yml` sube el repositorio completo (`path: '.'`) y lo despliega en GitHub Pages en cada push a la rama `main`. Las demás ramas no se despliegan; fusiona con `main` para publicar.
- Todo lo que se sube en un commit se vuelve público. La carpeta `.personal/` está expresamente en `.gitignore`; guarda notas y tareas privadas allí.
- Las páginas nuevas deben conservar `<meta name="robots" content="noindex">` para mantener el sitio fuera de los motores de búsqueda.
