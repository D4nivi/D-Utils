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
      '</svg>'
  };
})();
