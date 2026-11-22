/* =========================================================
   D-Utils · Catálogo de ilustraciones vectoriales SVG
   Funciona 100% estático en GitHub Pages y disco local (file://)
   ========================================================= */
(function () {
  "use strict";

  window.DUtilsIconos = {
    // 1. Recortar imágenes
    "recortar":
      '<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="25" y="15" width="110" height="90" rx="4" fill="rgba(255,255,255,0.06)" stroke="var(--line)" stroke-width="1"/>' +
        '<path d="M80 34 L104 68 H56 Z" fill="rgba(var(--accent-rgb), 0.22)" stroke="var(--accent)" stroke-width="1.5"/>' +
        '<circle cx="80" cy="54" r="8" fill="var(--accent-sec)" opacity="0.8"/>' +
        '<rect class="anim-crop-border" x="44" y="24" width="72" height="72" rx="2" stroke="var(--accent)" stroke-width="1.8"/>' +
        '<path d="M40 28 V20 H48 M112 20 H120 V28 M120 92 V100 H112 M48 100 H40 V92" stroke="var(--accent-ok)" stroke-width="2"/>' +
        '<text x="80" y="112" font-family="monospace" font-size="7" fill="var(--accent-ok)" text-anchor="middle" font-weight="700">MARGEN 60PX</text>' +
      '</svg>',

    // 2. Símbolos para copiar/pegar
    "simbolos":
      '<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<g opacity="0.35" stroke="var(--line)" stroke-width="0.8">' +
          '<rect x="25" y="20" width="32" height="32" rx="4"/>' +
          '<rect x="64" y="20" width="32" height="32" rx="4"/>' +
          '<rect x="103" y="20" width="32" height="32" rx="4"/>' +
          '<rect x="25" y="58" width="32" height="32" rx="4"/>' +
          '<rect x="64" y="58" width="32" height="32" rx="4"/>' +
          '<rect x="103" y="58" width="32" height="32" rx="4"/>' +
        '</g>' +
        '<text x="41" y="42" font-family="sans-serif" font-size="16" fill="var(--fg)" text-anchor="middle" opacity="0.7">✦</text>' +
        '<text x="80" y="42" font-family="sans-serif" font-size="16" fill="var(--accent)" text-anchor="middle" class="anim-glyph">⌘</text>' +
        '<text x="119" y="42" font-family="sans-serif" font-size="16" fill="var(--fg)" text-anchor="middle" opacity="0.7">⬡</text>' +
        '<text x="41" y="80" font-family="sans-serif" font-size="16" fill="var(--accent-sec)" text-anchor="middle">⚡</text>' +
        '<text x="80" y="80" font-family="sans-serif" font-size="16" fill="var(--accent-ok)" text-anchor="middle">刀</text>' +
        '<text x="119" y="80" font-family="sans-serif" font-size="16" fill="var(--fg)" text-anchor="middle" opacity="0.7">◈</text>' +
        '<rect x="42" y="96" width="76" height="16" rx="3" fill="var(--card)" stroke="var(--accent)" stroke-width="1"/>' +
        '<text x="80" y="107" font-family="monospace" font-size="7" fill="var(--accent)" text-anchor="middle" font-weight="700">BUFFER_COPIED</text>' +
      '</svg>',

    // 3. Ruleta para sorteos (centrada en 80, 58 con marcador apuntando hacia abajo)
    "ruleta":
      '<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<g class="anim-wheel">' +
          '<circle cx="80" cy="58" r="38" stroke="var(--line)" stroke-width="2.5" fill="var(--card)"/>' +
          '<path d="M80 58 L80 20 A38 38 0 0 1 106.9 31.1 Z" fill="rgba(var(--accent-rgb), 0.35)" stroke="var(--accent)" stroke-width="0.8"/>' +
          '<path d="M80 58 L106.9 31.1 A38 38 0 0 1 118 58 Z" fill="rgba(var(--accent-sec-rgb), 0.28)" stroke="var(--accent-sec)" stroke-width="0.8"/>' +
          '<path d="M80 58 L118 58 A38 38 0 0 1 106.9 84.9 Z" fill="rgba(255, 184, 0, 0.28)" stroke="var(--accent-warn)" stroke-width="0.8"/>' +
          '<path d="M80 58 L106.9 84.9 A38 38 0 0 1 80 96 Z" fill="rgba(0, 255, 159, 0.28)" stroke="var(--accent-ok)" stroke-width="0.8"/>' +
          '<path d="M80 58 L80 96 A38 38 0 0 1 53.1 84.9 Z" fill="rgba(var(--accent-rgb), 0.25)" stroke="var(--accent)" stroke-width="0.8"/>' +
          '<path d="M80 58 L53.1 84.9 A38 38 0 0 1 42 58 Z" fill="rgba(var(--accent-sec-rgb), 0.28)" stroke="var(--accent-sec)" stroke-width="0.8"/>' +
          '<path d="M80 58 L42 58 A38 38 0 0 1 53.1 31.1 Z" fill="rgba(255, 184, 0, 0.28)" stroke="var(--accent-warn)" stroke-width="0.8"/>' +
          '<path d="M80 58 L53.1 31.1 A38 38 0 0 1 80 20 Z" fill="rgba(0, 255, 159, 0.28)" stroke="var(--accent-ok)" stroke-width="0.8"/>' +
          '<circle cx="80" cy="20" r="1.5" fill="var(--fg)"/>' +
          '<circle cx="106.9" cy="31.1" r="1.5" fill="var(--fg)"/>' +
          '<circle cx="118" cy="58" r="1.5" fill="var(--fg)"/>' +
          '<circle cx="106.9" cy="84.9" r="1.5" fill="var(--fg)"/>' +
          '<circle cx="80" cy="96" r="1.5" fill="var(--fg)"/>' +
          '<circle cx="53.1" cy="84.9" r="1.5" fill="var(--fg)"/>' +
          '<circle cx="42" cy="58" r="1.5" fill="var(--fg)"/>' +
          '<circle cx="53.1" cy="31.1" r="1.5" fill="var(--fg)"/>' +
          '<circle cx="80" cy="58" r="11" fill="var(--card)" stroke="var(--line)" stroke-width="1.5"/>' +
          '<circle cx="80" cy="58" r="6" fill="var(--fg)"/>' +
          '<circle cx="80" cy="58" r="2" fill="var(--accent)"/>' +
        '</g>' +
        '<!-- Marcador táctico superior (apunta hacia abajo, hacia la ruleta) -->' +
        '<polygon points="74,12 86,12 80,22" fill="var(--accent-sec)"/>' +
        '<circle cx="80" cy="15" r="2" fill="#fff"/>' +
        '<text x="80" y="112" font-family="monospace" font-size="7" fill="var(--muted)" text-anchor="middle" font-weight="700">RNG_DECIDER // TACTICAL</text>' +
      '</svg>',

    // 4. Contador de palabras
    "contador-palabras":
      '<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="24" y="18" width="112" height="84" rx="4" fill="var(--card)" stroke="var(--card-border)" stroke-width="1"/>' +
        '<line x1="34" y1="32" x2="100" y2="32" stroke="var(--muted)" stroke-width="3" stroke-linecap="round"/>' +
        '<line x1="34" y1="42" x2="124" y2="42" stroke="var(--muted)" stroke-width="3" stroke-linecap="round" opacity="0.6"/>' +
        '<line x1="34" y1="52" x2="80" y2="52" stroke="var(--muted)" stroke-width="3" stroke-linecap="round" opacity="0.4"/>' +
        '<line x1="85" y1="48" x2="85" y2="56" stroke="var(--accent)" stroke-width="2"/>' +
        '<g transform="translate(34, 68)">' +
          '<rect class="anim-bar-1" x="0" y="8" width="8" height="18" rx="1" fill="var(--accent)"/>' +
          '<rect class="anim-bar-2" x="14" y="2" width="8" height="24" rx="1" fill="var(--accent-ok)"/>' +
          '<rect class="anim-bar-3" x="28" y="12" width="8" height="14" rx="1" fill="var(--accent-sec)"/>' +
          '<rect class="anim-bar-1" x="42" y="6" width="8" height="20" rx="1" fill="var(--accent)"/>' +
        '</g>' +
        '<rect x="88" y="66" width="42" height="26" rx="2" fill="rgba(var(--accent-rgb), 0.1)" stroke="var(--accent)" stroke-width="0.8"/>' +
        '<text x="109" y="77" font-family="monospace" font-size="6" fill="var(--accent)" text-anchor="middle" font-weight="700">WPM: 240</text>' +
        '<text x="109" y="86" font-family="monospace" font-size="6" fill="var(--fg)" text-anchor="middle">CHARS: 1.4K</text>' +
      '</svg>',

    // 5. Comparador de textos
    "comparador-textos":
      '<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="22" y="20" width="54" height="78" rx="3" fill="var(--card)" stroke="var(--line)" stroke-width="1"/>' +
        '<rect x="84" y="20" width="54" height="78" rx="3" fill="var(--card)" stroke="var(--line)" stroke-width="1"/>' +
        '<rect x="22" y="20" width="54" height="12" rx="3" fill="rgba(255, 42, 133, 0.15)"/>' +
        '<text x="26" y="28" font-family="monospace" font-size="6" fill="var(--error)" font-weight="700">- ORIGINAL</text>' +
        '<rect x="84" y="20" width="54" height="12" rx="3" fill="rgba(0, 255, 159, 0.15)"/>' +
        '<text x="88" y="28" font-family="monospace" font-size="6" fill="var(--accent-ok)" font-weight="700">+ MODIFICADO</text>' +
        '<line x1="28" y1="42" x2="68" y2="42" stroke="var(--muted)" stroke-width="2"/>' +
        '<rect x="26" y="48" width="46" height="8" fill="rgba(255, 42, 133, 0.25)"/>' +
        '<line x1="28" y1="52" x2="62" y2="52" stroke="var(--error)" stroke-width="2"/>' +
        '<line x1="28" y1="64" x2="70" y2="64" stroke="var(--muted)" stroke-width="2"/>' +
        '<line x1="90" y1="42" x2="130" y2="42" stroke="var(--muted)" stroke-width="2"/>' +
        '<rect x="88" y="48" width="46" height="8" fill="rgba(0, 255, 159, 0.25)"/>' +
        '<line x1="90" y1="52" x2="132" y2="52" stroke="var(--accent-ok)" stroke-width="2"/>' +
        '<line x1="90" y1="64" x2="124" y2="64" stroke="var(--muted)" stroke-width="2"/>' +
        '<line class="anim-diff-beam" x1="20" y1="38" x2="140" y2="38" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 2"/>' +
        '<text x="80" y="112" font-family="monospace" font-size="7" fill="var(--accent)" text-anchor="middle" font-weight="700">DIFF_ENGINE // V1.0</text>' +
      '</svg>',

    // 6. OCR
    "ocr":
      '<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="30" y="18" width="100" height="84" rx="4" fill="var(--card)" stroke="var(--line)" stroke-width="1"/>' +
        '<rect x="40" y="26" width="34" height="26" rx="2" fill="rgba(var(--accent-rgb), 0.15)" stroke="var(--accent)" stroke-width="1"/>' +
        '<path d="M43 46 L50 36 L60 48 H43 Z" fill="var(--accent)" opacity="0.6"/>' +
        '<line x1="80" y1="30" x2="120" y2="30" stroke="var(--fg)" stroke-width="2"/>' +
        '<line x1="80" y1="38" x2="114" y2="38" stroke="var(--fg)" stroke-width="2"/>' +
        '<line x1="80" y1="46" x2="122" y2="46" stroke="var(--fg)" stroke-width="2"/>' +
        '<line x1="40" y1="62" x2="120" y2="62" stroke="var(--muted)" stroke-width="2" stroke-linecap="round"/>' +
        '<line x1="40" y1="72" x2="108" y2="72" stroke="var(--muted)" stroke-width="2" stroke-linecap="round"/>' +
        '<line x1="40" y1="82" x2="88" y2="82" stroke="var(--muted)" stroke-width="2" stroke-linecap="round"/>' +
        '<g class="anim-ocr-beam" transform="translate(0, 24)">' +
          '<line x1="26" y1="0" x2="134" y2="0" stroke="var(--accent-sec)" stroke-width="2"/>' +
          '<polygon points="26,-4 26,4 32,0" fill="var(--accent-sec)"/>' +
          '<polygon points="134,-4 134,4 128,0" fill="var(--accent-sec)"/>' +
        '</g>' +
        '<text x="80" y="114" font-family="monospace" font-size="7" fill="var(--accent-sec)" text-anchor="middle" font-weight="700">OPTICAL_SCAN // ACTIVE</text>' +
      '</svg>',

    // 7. Indexator
    "indexator":
      '<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<g stroke="var(--accent)" stroke-width="1.2" opacity="0.6">' +
          '<line x1="80" y1="34" x2="44" y2="68"/>' +
          '<line x1="80" y1="34" x2="116" y2="68"/>' +
          '<line x1="44" y1="68" x2="80" y2="88"/>' +
          '<line x1="116" y1="68" x2="80" y2="88"/>' +
          '<line x1="80" y1="34" x2="80" y2="88"/>' +
          '<line x1="44" y1="68" x2="30" y2="92"/>' +
          '<line x1="116" y1="68" x2="130" y2="92"/>' +
        '</g>' +
        '<circle class="anim-node" cx="80" cy="34" r="7" fill="var(--accent)"/>' +
        '<circle cx="44" cy="68" r="6" fill="var(--card)" stroke="var(--accent)" stroke-width="2"/>' +
        '<circle cx="116" cy="68" r="6" fill="var(--card)" stroke="var(--accent-sec)" stroke-width="2"/>' +
        '<circle cx="80" cy="88" r="8" fill="var(--card)" stroke="var(--accent-ok)" stroke-width="2.5"/>' +
        '<circle cx="30" cy="92" r="4" fill="var(--accent-warn)"/>' +
        '<circle cx="130" cy="92" r="4" fill="var(--accent-sec)"/>' +
        '<text x="80" y="112" font-family="monospace" font-size="7" fill="var(--accent-ok)" text-anchor="middle" font-weight="700">INDEX_NODES // TOPOLOGY</text>' +
      '</svg>',

    // Iconos de interfaz (UI)
    "sol":
      '<svg class="switch-icon switch-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="4"></circle>' +
        '<path d="M12 2v2"></path>' +
        '<path d="M12 20v2"></path>' +
        '<path d="m4.93 4.93 1.41 1.41"></path>' +
        '<path d="m17.66 17.66 1.41 1.41"></path>' +
        '<path d="M2 12h2"></path>' +
        '<path d="M20 12h2"></path>' +
        '<path d="m6.34 17.66-1.41 1.41"></path>' +
        '<path d="m19.07 4.93-1.41 1.41"></path>' +
      '</svg>',

    "luna":
      '<svg class="switch-icon switch-icon-moon" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">' +
        '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>' +
      '</svg>',

    "sonido":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
        '<path class="sound-waves" d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>' +
        '<path class="sound-waves" d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>' +
      '</svg>',

    // Iconos de la radio táctica integrada
    "radioPlay":
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<polygon points="7 5 19 12 7 19 7 5"/>' +
      '</svg>',

    "radioPause":
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<rect x="6" y="5" width="4" height="14" rx="1"/>' +
        '<rect x="14" y="5" width="4" height="14" rx="1"/>' +
      '</svg>',

    "radioPrev":
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>' +
      '</svg>',

    "radioNext":
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="m6 18 8.5-6L6 6v12zM16 6v12h2V6h-2z"/>' +
      '</svg>',

    "radioVol":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
        '<path class="sound-waves" d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>' +
        '<path class="sound-waves" d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>' +
      '</svg>',

    "radioMute":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
        '<line x1="23" y1="9" x2="17" y2="15"></line>' +
        '<line x1="17" y1="9" x2="23" y2="15"></line>' +
      '</svg>',

    // Iconos de Temas Visuales (Selector en Topbar)
    "temaTactico":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="8"/>' +
        '<path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>' +
        '<circle cx="12" cy="12" r="2" fill="currentColor"/>' +
      '</svg>',

    "temaLab":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M10 2v7.5L4.5 19.5A2 2 0 0 0 6.2 22h11.6a2 2 0 0 0 1.7-2.5L14 9.5V2h-4z"/>' +
        '<line x1="8.5" y1="2" x2="15.5" y2="2"/>' +
        '<circle cx="10" cy="17" r="1" fill="currentColor"/>' +
        '<circle cx="14" cy="15" r="1" fill="currentColor"/>' +
      '</svg>',

    "temaCartoon":
      '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">' +
        '<polygon points="12 2 15 8.5 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 8.5 12 2"/>' +
      '</svg>',

    "temaGatos":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M12 6c-4.4 0-8 3.4-8 7.5 0 4.1 3.6 7.5 8 7.5s8-3.4 8-7.5c0-4.1-3.6-7.5-8-7.5z"/>' +
        '<polygon points="4,11 2,4 9,6" fill="currentColor"/>' +
        '<polygon points="20,11 22,4 15,6" fill="currentColor"/>' +
        '<circle cx="9" cy="13.5" r="1.5" fill="currentColor"/>' +
        '<circle cx="15" cy="13.5" r="1.5" fill="currentColor"/>' +
        '<path d="M10.5 16.5c1 .5 2 .5 3 0"/>' +
      '</svg>',

    "chevronAbajo":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polyline points="6 9 12 15 18 9"/>' +
      '</svg>',

    // Iconos de acciones para el analizador de texto y herramientas
    "pegar":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>' +
        '<rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>' +
      '</svg>',

    "subir":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
        '<polyline points="17 8 12 3 7 8"/>' +
        '<line x1="12" y1="3" x2="12" y2="15"/>' +
      '</svg>',

    "copiar":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>' +
        '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
      '</svg>',

    "borrar":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polyline points="3 6 5 6 21 6"/>' +
        '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>' +
        '<line x1="10" y1="11" x2="10" y2="17"/>' +
        '<line x1="14" y1="11" x2="14" y2="17"/>' +
      '</svg>',

    "reiniciar":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>' +
        '<path d="M3 3v5h5"/>' +
      '</svg>',

    "reloj":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="10"/>' +
        '<polyline points="12 6 12 12 16 14"/>' +
      '</svg>',

    "habla":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>' +
        '<path d="M19 10v2a7 7 0 0 1-14 0v-2"/>' +
        '<line x1="12" y1="19" x2="12" y2="22"/>' +
      '</svg>',

    "check":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polyline points="20 6 9 17 4 12"/>' +
      '</svg>',

    "escanear":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M3 7V5a2 2 0 0 1 2-2h2"/>' +
        '<path d="M17 3h2a2 2 0 0 1 2 2v2"/>' +
        '<path d="M21 17v2a2 2 0 0 1-2 2h-2"/>' +
        '<path d="M7 21H5a2 2 0 0 1-2-2v-2"/>' +
        '<line x1="7" y1="12" x2="17" y2="12"/>' +
      '</svg>',

    // Variaciones temáticas específicas para el tema "cartoon"
    "cartoon": {
      "recortar":
        '<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect x="25" y="16" width="110" height="88" rx="14" fill="#ffffff" stroke="#181818" stroke-width="3"/>' +
          '<rect x="42" y="28" width="76" height="64" rx="10" fill="#fff3b0" stroke="#ff477e" stroke-width="3" stroke-dasharray="8 6"/>' +
          '<!-- Tijera estilo cartoon con ojos -->' +
          '<g transform="translate(68, 46)">' +
            '<circle cx="-10" cy="-6" r="8" fill="#ff477e" stroke="#181818" stroke-width="2"/>' +
            '<circle cx="-10" cy="14" r="8" fill="#ff477e" stroke="#181818" stroke-width="2"/>' +
            '<circle cx="-10" cy="-6" r="3" fill="#ffffff"/>' +
            '<circle cx="-10" cy="14" r="3" fill="#ffffff"/>' +
            '<path d="M-4 -2 L24 16 M-4 10 L24 -8" stroke="#181818" stroke-width="3" stroke-linecap="round"/>' +
            '<circle cx="6" cy="4" r="2.5" fill="#ffd600" stroke="#181818" stroke-width="1.5"/>' +
          '</g>' +
          '<rect x="45" y="86" width="70" height="14" rx="7" fill="#ff477e" stroke="#181818" stroke-width="2"/>' +
          '<text x="80" y="96" font-family="sans-serif" font-size="8" fill="#ffffff" text-anchor="middle" font-weight="900">¡CORTE POP!</text>' +
        '</svg>',

      "ruleta":
        '<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<circle cx="80" cy="58" r="40" fill="#ff9f43" stroke="#181818" stroke-width="3"/>' +
          '<g class="anim-wheel">' +
            '<circle cx="80" cy="58" r="36" fill="#ffd600" stroke="#181818" stroke-width="2"/>' +
            '<path d="M80 58 L80 22 A36 36 0 0 1 116 58 Z" fill="#ff477e" stroke="#181818" stroke-width="2"/>' +
            '<path d="M80 58 L116 58 A36 36 0 0 1 80 94 Z" fill="#00d2d3" stroke="#181818" stroke-width="2"/>' +
            '<path d="M80 58 L80 94 A36 36 0 0 1 44 58 Z" fill="#10ac84" stroke="#181818" stroke-width="2"/>' +
            '<circle cx="80" cy="58" r="9" fill="#181818"/>' +
            '<circle cx="80" cy="58" r="5" fill="#ffffff"/>' +
          '</g>' +
          '<!-- Flecha estilo dibujo animado -->' +
          '<polygon points="73,12 87,12 80,24" fill="#ff477e" stroke="#181818" stroke-width="2"/>' +
          '<text x="80" y="112" font-family="sans-serif" font-size="8" fill="#181818" text-anchor="middle" font-weight="900">★ GIRA LA RULETA ★</text>' +
        '</svg>',

      "contador-palabras":
        '<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect x="26" y="16" width="108" height="88" rx="14" fill="#ffffff" stroke="#181818" stroke-width="3"/>' +
          '<rect x="36" y="26" width="88" height="40" rx="8" fill="#fff3b0" stroke="#181818" stroke-width="2"/>' +
          '<line x1="44" y1="36" x2="114" y2="36" stroke="#ff477e" stroke-width="3" stroke-linecap="round"/>' +
          '<line x1="44" y1="46" x2="98" y2="46" stroke="#00d2d3" stroke-width="3" stroke-linecap="round"/>' +
          '<line x1="44" y1="56" x2="80" y2="56" stroke="#10ac84" stroke-width="3" stroke-linecap="round"/>' +
          '<rect x="38" y="74" width="84" height="22" rx="6" fill="#ff477e" stroke="#181818" stroke-width="2"/>' +
          '<text x="80" y="89" font-family="sans-serif" font-size="9" fill="#ffffff" text-anchor="middle" font-weight="900">1.250 PALABRAS</text>' +
        '</svg>',

      "ocr":
        '<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect x="25" y="16" width="110" height="88" rx="14" fill="#ffffff" stroke="#181818" stroke-width="3"/>' +
          '<rect x="36" y="24" width="46" height="34" rx="8" fill="#fff3b0" stroke="#181818" stroke-width="2"/>' +
          '<circle cx="50" cy="38" r="5" fill="#ff477e"/>' +
          '<polygon points="40,54 52,44 60,50 72,38 78,54" fill="#00d2d3" stroke="#181818" stroke-width="1.5"/>' +
          '<line x1="90" y1="28" x2="124" y2="28" stroke="#181818" stroke-width="3" stroke-linecap="round"/>' +
          '<line x1="90" y1="38" x2="118" y2="38" stroke="#ff477e" stroke-width="3" stroke-linecap="round"/>' +
          '<line x1="90" y1="48" x2="122" y2="48" stroke="#00d2d3" stroke-width="3" stroke-linecap="round"/>' +
          '<line class="anim-ocr-beam" x1="28" y1="64" x2="132" y2="64" stroke="#ff477e" stroke-width="3" stroke-dasharray="6 4"/>' +
          '<rect x="42" y="76" width="76" height="20" rx="8" fill="#ffd600" stroke="#181818" stroke-width="2"/>' +
          '<text x="80" y="90" font-family="sans-serif" font-size="8" fill="#181818" text-anchor="middle" font-weight="900">★ ESCÁNER POP ★</text>' +
        '</svg>'
    },

    // Variaciones temáticas específicas para el tema "gatos" (Michis)
    "gatos": {
      "recortar":
        '<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect x="25" y="16" width="110" height="88" rx="16" fill="rgba(255,255,255,0.08)" stroke="var(--line)" stroke-width="1.5"/>' +
          '<rect class="anim-crop-border" x="42" y="24" width="76" height="72" rx="12" stroke="var(--accent)" stroke-width="2"/>' +
          '<!-- Caja de gatito con orejas -->' +
          '<path d="M60 52 L66 40 L74 48 L86 48 L94 40 L100 52 Z" fill="var(--accent)" opacity="0.9"/>' +
          '<circle cx="72" cy="58" r="2.5" fill="#ffffff"/>' +
          '<circle cx="88" cy="58" r="2.5" fill="#ffffff"/>' +
          '<polygon points="80,62 78,60 82,60" fill="var(--accent-sec)"/>' +
          '<!-- Patitas asomándose -->' +
          '<ellipse cx="64" cy="74" rx="6" ry="4" fill="var(--card)" stroke="var(--accent)" stroke-width="1.5"/>' +
          '<ellipse cx="96" cy="74" rx="6" ry="4" fill="var(--card)" stroke="var(--accent)" stroke-width="1.5"/>' +
          '<text x="80" y="110" font-family="sans-serif" font-size="8" fill="var(--accent)" text-anchor="middle" font-weight="700">♥ RECORTE MISHI ♥</text>' +
        '</svg>',

      "ruleta":
        '<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<g class="anim-wheel">' +
            '<circle cx="80" cy="58" r="38" stroke="var(--line)" stroke-width="2" fill="var(--card)"/>' +
            '<path d="M80 58 L80 20 A38 38 0 0 1 106.9 31.1 Z" fill="rgba(255,133,162,0.4)" stroke="var(--accent)" stroke-width="0.8"/>' +
            '<path d="M80 58 L106.9 31.1 A38 38 0 0 1 118 58 Z" fill="rgba(192,132,252,0.35)" stroke="var(--accent-sec)" stroke-width="0.8"/>' +
            '<path d="M80 58 L118 58 A38 38 0 0 1 106.9 84.9 Z" fill="rgba(252,211,77,0.35)" stroke="var(--accent-warn)" stroke-width="0.8"/>' +
            '<path d="M80 58 L106.9 84.9 A38 38 0 0 1 80 96 Z" fill="rgba(110,231,183,0.35)" stroke="var(--accent-ok)" stroke-width="0.8"/>' +
            '<path d="M80 58 L80 96 A38 38 0 0 1 53.1 84.9 Z" fill="rgba(255,133,162,0.4)" stroke="var(--accent)" stroke-width="0.8"/>' +
            '<path d="M80 58 L53.1 84.9 A38 38 0 0 1 42 58 Z" fill="rgba(192,132,252,0.35)" stroke="var(--accent-sec)" stroke-width="0.8"/>' +
            '<path d="M80 58 L42 58 A38 38 0 0 1 53.1 31.1 Z" fill="rgba(252,211,77,0.35)" stroke="var(--accent-warn)" stroke-width="0.8"/>' +
            '<path d="M80 58 L53.1 31.1 A38 38 0 0 1 80 20 Z" fill="rgba(110,231,183,0.35)" stroke="var(--accent-ok)" stroke-width="0.8"/>' +
            '<circle cx="80" cy="58" r="10" fill="var(--card)" stroke="var(--line)" stroke-width="1.5"/>' +
            '<!-- Huellita central -->' +
            '<circle cx="80" cy="59" r="3" fill="var(--accent)"/>' +
            '<circle cx="77" cy="55" r="1.2" fill="var(--accent)"/>' +
            '<circle cx="80" cy="54" r="1.2" fill="var(--accent)"/>' +
            '<circle cx="83" cy="55" r="1.2" fill="var(--accent)"/>' +
          '</g>' +
          '<!-- Marcador en forma de pececito apuntando hacia abajo -->' +
          '<path d="M80 22 L75 12 L85 12 Z" fill="var(--accent)"/>' +
          '<text x="80" y="112" font-family="sans-serif" font-size="8" fill="var(--accent)" text-anchor="middle" font-weight="700">♥ RULETA DE PREMIOS ♥</text>' +
        '</svg>',

      "contador-palabras":
        '<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect x="25" y="16" width="110" height="88" rx="16" fill="rgba(255,255,255,0.08)" stroke="var(--line)" stroke-width="1.5"/>' +
          '<rect x="36" y="24" width="88" height="52" rx="10" fill="var(--card)" stroke="var(--accent)" stroke-width="2"/>' +
          '<line x1="46" y1="38" x2="114" y2="38" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" opacity="0.8"/>' +
          '<line x1="46" y1="48" x2="100" y2="48" stroke="var(--accent-sec)" stroke-width="2" stroke-linecap="round" opacity="0.8"/>' +
          '<line x1="46" y1="58" x2="84" y2="58" stroke="var(--accent-ok)" stroke-width="2" stroke-linecap="round" opacity="0.8"/>' +
          '<circle cx="106" cy="58" r="4" fill="var(--accent)"/>' +
          '<circle cx="102" cy="52" r="1.5" fill="var(--accent)"/>' +
          '<circle cx="106" cy="50" r="1.5" fill="var(--accent)"/>' +
          '<circle cx="110" cy="52" r="1.5" fill="var(--accent)"/>' +
          '<rect x="42" y="82" width="76" height="16" rx="8" fill="var(--card)" stroke="var(--accent)" stroke-width="1.5"/>' +
          '<text x="80" y="93" font-family="sans-serif" font-size="8" fill="var(--accent)" text-anchor="middle" font-weight="700">♥ CONTEO MISHI ♥</text>' +
        '</svg>',

      "ocr":
        '<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect x="25" y="16" width="110" height="88" rx="16" fill="rgba(255,255,255,0.08)" stroke="var(--line)" stroke-width="1.5"/>' +
          '<rect x="36" y="24" width="48" height="34" rx="10" fill="var(--card)" stroke="var(--accent)" stroke-width="2"/>' +
          '<!-- Gato escaneando documento -->' +
          '<circle cx="52" cy="40" r="7" fill="var(--accent)"/>' +
          '<polygon points="46,35 48,29 53,34" fill="var(--accent)"/>' +
          '<polygon points="56,34 61,29 63,35" fill="var(--accent)"/>' +
          '<line x1="92" y1="30" x2="124" y2="30" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>' +
          '<line x1="92" y1="40" x2="116" y2="40" stroke="var(--accent-sec)" stroke-width="2" stroke-linecap="round"/>' +
          '<line x1="92" y1="50" x2="120" y2="50" stroke="var(--accent-ok)" stroke-width="2" stroke-linecap="round"/>' +
          '<g class="anim-ocr-beam">' +
            '<line x1="30" y1="64" x2="130" y2="64" stroke="var(--accent-sec)" stroke-width="2"/>' +
            '<circle cx="80" cy="64" r="3" fill="var(--accent-sec)"/>' +
          '</g>' +
          '<rect x="42" y="78" width="76" height="18" rx="8" fill="var(--card)" stroke="var(--accent)" stroke-width="1.5"/>' +
          '<text x="80" y="90" font-family="sans-serif" font-size="8" fill="var(--accent)" text-anchor="middle" font-weight="700">♥ ESCÁNER MISHI ♥</text>' +
        '</svg>'
    }
  };

  // Helper para obtener ilustraciones vectoriales sensibles al tema activo (con fallback)
  window.DUtilsIconos.obtener = function (id, tema) {
    if (tema && window.DUtilsIconos[tema] && window.DUtilsIconos[tema][id]) {
      return window.DUtilsIconos[tema][id];
    }
    return window.DUtilsIconos[id] || "";
  };
})();
