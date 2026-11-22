# AGENTS.md

D-Utils is a static, dependency-free GitHub Pages site with browser-only tools.
There is no package manager, build step, bundler, linter, or test suite.

## Verify changes

- No commands to run. Open `index.html` in a browser and exercise the page.
- `recortar/` needs real JPG/PNG files to verify; it also supports drag/drop and
  (CORS permitting) URLs.
- Keep everything working as plain static files; there is no dev-server config.

## Layout and wiring

- Root `index.html` is the tactical launcher with search, filters, and dynamic cards.
- `assets/css/` contains all stylesheets:
  - `base.css`: global theme variables, reset, HUD badges, and navigation links.
    Loads Rubik via `url("../fonts/...")`.
  - `portada.css`: desktop layout, card grid, search bar, and filter chips.
  - `animaciones.css`: preview animations and keyframes.
- `assets/base.js` stays in `<head>` **without** `defer`: sets `data-theme` before
  first paint to avoid theme flash, injects topbar skeleton/slots (theme switch, FX Web Audio API,
  host de radio), y gestiona atajos de teclado (`/`, `Esc`, `T`, `M`, `R`).
  Do NOT add full components here; extract them to `componentes/`.
- `componentes/` holds client-side JS modules only. All feature widgets and tools
  must live here, never bloated into `base.js`:
  - `catalogo.js`: central array of tools and card renderer (`window.DUtilsCatalogo`).
  - `iconos.js`: inline SVG illustrations and UI icons dictionary (`window.DUtilsIconos`).
    All icons belong here; never hardcode SVGs in other scripts.
  - `radio.js`: reproductor de radio táctica integrada (`window.DUtilsRadio`).
  - `buscador.js`: accent-insensitive search, filter chips, and empty state.
- Each tool is a self-contained `<folder>/index.html`. Every tool page must load
  `assets/css/base.css` and `assets/base.js` (adjust `../` by folder depth).
- Finished tools use the status label **"Disponible"** (`data-estado="disponibles"`).
  Pending tools link to their folder's placeholder or `en-construccion.html`.

## Conventions

- UI text, code comments, identifiers, and commit messages are in **Spanish**.
  Keep new code consistent with that.
- Style with CSS variables in `base.css` (`--bg`, `--fg`, `--muted`, `--accent`,
  `--card`, `--line`, `--error`, `--accent-glow`, etc.). Do not hard-code theme colors.
- Completed tools are always labeled **"Disponible"** (never "Lista").
- No CDNs, external requests, or third-party libraries: fonts are self-hosted
  and all processing is client-side. `recortar` implements its own ZIP writer,
  so do not replace it with JSZip.
- **Component modularity**: New components must NOT be implemented in full inside
  `assets/base.js`. `base.js` only handles shared base wiring, slots, theme, and global hotkeys.
  Extract all component logic, widgets, and state into dedicated files in `componentes/`
  (e.g., `componentes/<nombre>.js`). In case of doubt, ask the user before proceeding.
- **Icon centralization**: ALL icons and SVGs must go in `componentes/iconos.js`
  under `window.DUtilsIconos`. Never hardcode inline SVGs in `base.js` or other component files.
  In case of doubt, ask the user before proceeding.
- To add a tool: create `<name>/index.html`, add its SVG preview to `componentes/iconos.js`,
  and append an entry to `DUtilsCatalogo` in `componentes/catalogo.js` (with title,
  description, category, status, tags, and search `keywords`).
- In `recortar/index.html`, images are downscaled (~1 MP, max side 1200 px)
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
