# AGENTS.md

D-Utils is a static, dependency-free GitHub Pages site with browser-only tools.
There is no package manager, build step, bundler, linter, or test suite.

## Verify changes

- No commands to run. Open `index.html` in a browser and exercise the page.
- `recortar/` needs real JPG/PNG files to verify; it also supports drag/drop and
  (CORS permitting) URLs.
- Keep everything working as plain static files; there is no dev-server config.

## Layout and wiring

- Root `index.html` is the launcher plus the client-side search.
- Each tool is a self-contained `<folder>/index.html`; `recortar/index.html` is
  the only one today.
- Every page must load `assets/css/base.css` and `assets/base.js` (adjust `../` by
  depth). `base.css` holds theme variables and shared styles; `base.js` sets the
  theme, renders the toggle, and injects the favicon.
- `base.js` must stay in `<head>` **without** `defer`: it sets `data-theme`
  before first paint to avoid a theme flash.
- `base.js` resolves `FAVICON` relative to its own `src`, so the value is a name
  inside `assets/` (currently `favicon.png`), not a page-relative path.

## Conventions

- UI text, code comments, identifiers, and commit messages are in **Spanish**.
  Keep new code consistent with that.
- Style with the CSS variables in `base.css` (`--bg`, `--fg`, `--muted`,
  `--accent`, `--card`, `--line`, `--error`). Do not hard-code theme colors.
- No CDNs, external requests, or third-party libraries: fonts are self-hosted
  and all processing is client-side. `recortar` implements its own ZIP writer,
  so do not replace it with JSZip.
- To add a tool: create `<name>/index.html`, then add an
  `<li data-keywords="...">` entry linking to it in root `index.html`. The
  search matches every typed word, ignoring case and accents.
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
