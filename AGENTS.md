# AGENTS.md

D-Utils is a static, dependency-free GitHub Pages site with browser-only tools.
There is no package manager, build step, bundler, linter, or test suite.

## Verify changes

- No commands to run. Open `index.html` in a browser and exercise the page.
- `pages/recortar/` needs real JPG/PNG files to verify; it also supports drag/drop and
  (CORS permitting) URLs.
- Keep everything working as plain static files; there is no dev-server config.

## Layout and wiring

- Root `index.html` is the tactical launcher with search, filters, and dynamic cards.
- `pages/` holds all modular tools and sub-applications (each in its own self-contained folder).
- `assets/css/` contains global foundation and theme stylesheets:
  - `base.css`: core reset, font-face, HTML base tags, structural layout, and submodule orchestrator via `@import`.
    Loads Rubik via `url("../fonts/...")`.
  - `temas.css`: global CSS variables and theme skins (`tactico`, `laboratorio`, `cartoon`, `gatos`).
  - `tactico-ui.css`: shared tactical HUD UI primitives (buttons, badges, switches, selects, control panels).
  - `portada.css`: desktop layout, card grid, search bar, and filter chips.
  - `animaciones.css`: preview animations and keyframes.
- `assets/base.js` stays in `<head>` **without** `defer`: sets `data-theme` before
  first paint to avoid theme flash, injects topbar skeleton/slots (selector de temas `#tema-host`,
  FX Web Audio API, host de radio), y gestiona atajos de teclado (`/`, `Esc`, `T`, `M`, `R`).
  Do NOT add full components here; extract shared ones to `componentes/` and tool-specific ones to `pages/<folder>/`.
- `componentes/` holds reusable client-side JS modules, with their stylesheets in `componentes/css/`:
  - `temas.js`: registro y selector accesible de temas visuales (`window.DUtilsTemas`).
    Los temas (`tactico`, `laboratorio`, `cartoon`, `gatos`, etc.) definen la estética completa y
    reemplazan el antiguo modo binario claro/oscuro.
  - `catalogo.js`: central array of tools and card renderer (`window.DUtilsCatalogo`).
  - `iconos.js`: inline SVG illustrations and UI icons dictionary (`window.DUtilsIconos`).
    Soporta variantes por tema mediante `window.DUtilsIconos.obtener(id, tema)`.
    All icons belong here; never hardcode SVGs in other scripts.
  - `fondo.js`: fondo dinámico y nebulosas en canvas adaptables al tema (`window.DUtilsFondo`).
  - `radio.js` / `css/radio.css`: reproductor de radio táctica integrada (`window.DUtilsRadio`).
  - `buscador.js`: accent-insensitive search, filter chips, and empty state.
  - `footer.js` / `css/footer.css`: pie del sistema táctico y atajos interactivos (`window.DUtilsFooter`).
  - `dropzone.js` / `css/dropzone.css`: panel común de arrastre y subida de archivos parametrizable (`window.DUtilsDropzone`).
  - `bloque-texto.js` / `css/bloque-texto.css`: editor y visor de texto reutilizable con barra de acciones (`window.DUtilsBloqueTexto`).
- Each tool is a self-contained `pages/<folder>/`:
  - Main view: `pages/<folder>/index.html`. Loads `../../assets/css/base.css` and `../../assets/base.js`.
  - Tool-specific styles: extract into `pages/<folder>/<tool>.css` (e.g. `pages/contador-palabras/contador.css`) instead of embedding full `<style>` blocks in `index.html`.
  - Tool-specific modules: extract into `pages/<folder>/<tool>.js` (e.g. `pages/contador-palabras/contador.js`) instead of bloating `componentes/` (which is reserved for cross-page utilities).
- Finished tools use the status label **"Disponible"** (`data-estado="disponibles"`).
  Pending tools link to their folder's placeholder or `en-construccion.html`.

## Conventions

- UI text, code comments, identifiers, and commit messages are in **Spanish**.
  Keep new code consistent with that.
- **Commits de Git**: NUNCA hacer un commit (`git commit`) de forma automática ni por iniciativa propia; solo crear commits cuando el usuario lo solicite explícitamente en su mensaje.
- Style with CSS variables in `base.css` (`--bg`, `--fg`, `--muted`, `--accent`,
  `--card`, `--line`, `--error`, `--accent-glow`, etc.). Do not hard-code theme colors.
- Completed tools are always labeled **"Disponible"** (never "Lista").
- No CDNs, external requests, or third-party libraries: fonts are self-hosted
  and all processing is client-side. `recortar` implements its own ZIP writer,
  so do not replace it with JSZip.
- **Component modularity**: New components must NOT be implemented in full inside
  `assets/base.js`. `base.js` only handles shared base wiring, slots, theme, and global hotkeys.
  Extract shared reusable components into `componentes/` (e.g. `componentes/<nombre>.js`),
  while single-tool logic and dedicated styles must live in their respective folder
  (e.g. `pages/<tool>/<tool>.js` and `pages/<tool>/<tool>.css`). In case of doubt, ask the user before proceeding.
- **Icon centralization**: ALL icons and SVGs must go in `componentes/iconos.js`
  under `window.DUtilsIconos`. Never hardcode inline SVGs in `base.js` or other component files.
  In case of doubt, ask the user before proceeding.
- To add a tool: create `pages/<name>/index.html`, add its SVG preview to `componentes/iconos.js`,
  and append an entry to `DUtilsCatalogo` in `componentes/catalogo.js` (with title,
  description, category, status, tags, and search `keywords`).
- In `pages/recortar/index.html`, images are downscaled (~1 MP, max side 1200 px)
  **before** the margin is applied, so `margen` is exact final pixels.
  Constants sit at the top of the inline script. The Python script mentioned in
  a comment is not part of this repo.

## Deploy

- `.github/workflows/static.yml` uploads the whole repo (`path: '.'`) and
  deploys to GitHub Pages on every push to `main`. Other branches do not deploy;
  merge to `main` to publish.
- Everything committed becomes public. `.personal/` is gitignored on purpose;
  keep private notes and TODOs there.
- New pages should keep `<meta name="robots" content="noindex">` so the site
  stays out of search engines.
