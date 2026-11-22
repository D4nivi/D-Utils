/* =========================================================
   D-Utils · Código común a todas las páginas
   - Aplica el tema claro/oscuro antes de pintar (sin parpadeos)
   - Inserta la barra superior (topbar) con switches de tema y sonido
   - Gestiona el favicon
   - Motor de efectos de sonido sintéticos tácticos (Web Audio API)
   - Atajos de teclado en escritorio
   Se carga en el <head> de cada página, sin "defer".
   ========================================================= */
(function () {
  "use strict";

  // ▼▼▼ FAVICON ▼▼▼ ----------------------------------------------------
  var FAVICON = "favicon.png";
  // ▲▲▲ FAVICON ▲▲▲ ----------------------------------------------------

  var CLAVE_TEMA = "dutils-tema";
  var CLAVE_SONIDO = "dutils-sonido";
  var raiz = document.documentElement;
  var base = document.currentScript ? document.currentScript.src : location.href;

  function leerLS(clave) {
    try { return localStorage.getItem(clave); } catch (e) { return null; }
  }
  function guardarLS(clave, valor) {
    try { localStorage.setItem(clave, valor); } catch (e) { /* sin almacenamiento */ }
  }

  // ---------- 1. GESTIÓN DEL TEMA (inmediato en <head>) ----------
  var sistemaColor = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function temaPorDefecto() {
    return sistemaColor && sistemaColor.matches ? "dark" : "light";
  }

  var temaGuardado = leerLS(CLAVE_TEMA);
  raiz.setAttribute("data-theme", temaGuardado || temaPorDefecto());

  // Favicon (relativo a assets/)
  try {
    var icono = document.createElement("link");
    icono.rel = "icon";
    icono.href = new URL(FAVICON, base).href;
    document.head.appendChild(icono);
  } catch (e) {
    /* fallback si URL falla */
  }

  // Asegura la disponibilidad de iconos UI desde componentes/iconos.js
  if (typeof window !== "undefined" && !window.DUtilsIconos) {
    try {
      var scriptIconos = document.createElement("script");
      scriptIconos.src = new URL("../componentes/iconos.js", base).href;
      scriptIconos.onload = function () {
        actualizarBotonTema();
      };
      document.head.appendChild(scriptIconos);
    } catch (e) {
      /* fallback si URL falla */
    }
  }

  // ---------- 2. MOTOR DE AUDIO SINTÉTICO (Web Audio API) ----------
  // Sin archivos externos: audio táctico generado en tiempo real.
  var audioCtx = null;
  var sonidoActivo = leerLS(CLAVE_SONIDO) === "1"; // por defecto silenciado

  function obtenerAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      var AudioCtor = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtor();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function reproducirTono(freqInicio, freqFin, duracion, tipo, gananciaMax) {
    if (!sonidoActivo) return;
    try {
      var ctx = obtenerAudioContext();
      if (!ctx) return;

      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = tipo || "sine";
      osc.frequency.setValueAtTime(freqInicio, now);
      if (freqFin && freqFin !== freqInicio) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, freqFin), now + duracion);
      }

      var maxVol = gananciaMax || 0.025;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(maxVol, now + duracion * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duracion);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duracion + 0.01);
    } catch (e) {
      /* silenciar cualquier excepción de audio */
    }
  }

  var Sonidos = {
    hover: function () {
      reproducirTono(780, 1040, 0.03, "sine", 0.018);
    },
    click: function () {
      reproducirTono(520, 880, 0.065, "triangle", 0.04);
    },
    accion: function () {
      reproducirTono(660, 1320, 0.09, "sine", 0.045);
    },
    tecleo: function () {
      reproducirTono(1200, 900, 0.015, "triangle", 0.012);
    },
    activado: function () {
      // Arpegio ascendente futurista
      reproducirTono(440, 660, 0.06, "sine", 0.035);
      setTimeout(function () {
        reproducirTono(660, 880, 0.08, "sine", 0.04);
      }, 70);
    },
    desactivado: function () {
      reproducirTono(550, 320, 0.07, "sine", 0.03);
    }
  };

  function fijarSonido(activo, conSonidoFeedback) {
    sonidoActivo = !!activo;
    guardarLS(CLAVE_SONIDO, sonidoActivo ? "1" : "0");
    if (sonidoActivo && conSonidoFeedback) {
      Sonidos.activado();
    }
    actualizarBotonSonido();
  }

  function alternarSonido() {
    var nuevo = !sonidoActivo;
    if (nuevo) {
      obtenerAudioContext();
      fijarSonido(true, true);
    } else {
      Sonidos.desactivado();
      fijarSonido(false, false);
    }
  }

  // ---------- 3. API GLOBAL WINDOW.DUtils ----------
  window.DUtils = {
    audio: {
      activo: function () { return sonidoActivo; },
      alternar: alternarSonido,
      activar: function () { fijarSonido(true, true); },
      desactivar: function () { fijarSonido(false, false); },
      hover: Sonidos.hover,
      click: Sonidos.click,
      accion: Sonidos.accion,
      tecleo: Sonidos.tecleo
    },
    tema: {
      actual: function () { return raiz.getAttribute("data-theme"); },
      alternar: alternarTema
    }
  };

  function alternarTema() {
    var actual = raiz.getAttribute("data-theme");
    var nuevo = actual === "dark" ? "light" : "dark";
    raiz.setAttribute("data-theme", nuevo);
    guardarLS(CLAVE_TEMA, nuevo);
    actualizarBotonTema();
    if (sonidoActivo) Sonidos.accion();
  }

  // ---------- 4. MONTAJE DE LA INTERFAZ SUPERIOR (TOPBAR) ----------
  var botonTemaEl = null;
  var botonSonidoEl = null;

  function actualizarBotonTema() {
    if (!botonTemaEl) return;
    var esOscuro = raiz.getAttribute("data-theme") === "dark";
    botonTemaEl.setAttribute("aria-checked", String(esOscuro));
    var label = botonTemaEl.querySelector(".switch-label");
    if (label) label.textContent = esOscuro ? "Modo oscuro" : "Modo claro";

    var thumb = botonTemaEl.querySelector(".switch-thumb");
    if (thumb && !thumb.querySelector(".switch-icon") && window.DUtilsIconos) {
      var sol = window.DUtilsIconos.sol || "";
      var luna = window.DUtilsIconos.luna || "";
      if (sol) thumb.insertAdjacentHTML("beforeend", sol);
      if (luna) thumb.insertAdjacentHTML("beforeend", luna);
    }
  }

  function actualizarBotonSonido() {
    if (!botonSonidoEl) return;
    botonSonidoEl.classList.toggle("active", sonidoActivo);
    botonSonidoEl.setAttribute("aria-pressed", String(sonidoActivo));
    var texto = botonSonidoEl.querySelector(".sound-text");
    if (texto) {
      texto.textContent = sonidoActivo ? "FX: ON" : "FX: OFF";
    }
    botonSonidoEl.title = sonidoActivo
      ? "Efectos de sonido tácticos activados (Pulsa M para silenciar)"
      : "Efectos de sonido silenciados (Pulsa M para activar)";
  }

  function montarTopbar() {
    // Si ya existe una barra topbar en el DOM, no crear duplicados
    if (document.querySelector(".topbar")) return;

    var barra = document.createElement("header");
    barra.className = "topbar";

    // Logo / Brand táctico que lleva al inicio
    var enlaceInicio = document.createElement("a");
    enlaceInicio.className = "topbar-brand";
    // Si estamos en una subcarpeta (ej: recortar/), el enlace a inicio es ../index.html
    var profundidad = location.pathname.split("/").filter(Boolean).length;
    var esSubcarpeta = !location.pathname.endsWith("index.html") && profundidad > 0
      ? true
      : /([^/]+)\/index\.html$/.test(location.pathname) && !/\/D-Utils\/index\.html$/i.test(location.pathname) && !location.pathname.endsWith("/index.html")
      ? true
      : location.pathname.indexOf("/recortar/") !== -1 ||
        location.pathname.indexOf("/simbolos/") !== -1 ||
        location.pathname.indexOf("/ruleta/") !== -1 ||
        location.pathname.indexOf("/contador-palabras/") !== -1 ||
        location.pathname.indexOf("/comparador-textos/") !== -1 ||
        location.pathname.indexOf("/ocr/") !== -1 ||
        location.pathname.indexOf("/indexator/") !== -1;

    // Determinamos la ruta a la raíz de D-Utils
    var rutaRaiz = esSubcarpeta ? "../index.html" : "index.html";
    enlaceInicio.href = rutaRaiz;
    enlaceInicio.innerHTML = '<span class="topbar-brand-mark">D</span><span>D-UTILS // TACTICAL</span>';

    var contenedorControles = document.createElement("div");
    contenedorControles.className = "topbar-controls";

    // Botón de sonido sintético
    botonSonidoEl = document.createElement("button");
    botonSonidoEl.type = "button";
    botonSonidoEl.className = "sound-btn";
    botonSonidoEl.setAttribute("aria-label", "Activar o desactivar efectos de sonido");
    var iconoSonido = (window.DUtilsIconos && window.DUtilsIconos.sonido) ||
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>' +
      '<path class="sound-waves" d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>' +
      '<path class="sound-waves" d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>' +
      '</svg>';
    botonSonidoEl.innerHTML = iconoSonido + '<span class="sound-text">FX: OFF</span>';

    botonSonidoEl.addEventListener("click", function () {
      alternarSonido();
    });

    // Botón switch de tema
    botonTemaEl = document.createElement("button");
    botonTemaEl.type = "button";
    botonTemaEl.className = "switch";
    botonTemaEl.setAttribute("role", "switch");
    botonTemaEl.setAttribute("aria-label", "Alternar modo claro y oscuro");
    var iconoSol = (window.DUtilsIconos && window.DUtilsIconos.sol) || "";
    var iconoLuna = (window.DUtilsIconos && window.DUtilsIconos.luna) || "";
    botonTemaEl.innerHTML =
      '<span class="switch-track">' +
        '<span class="switch-thumb">' +
          iconoSol +
          iconoLuna +
        '</span>' +
      '</span>' +
      '<span class="switch-label">Modo oscuro</span>';

    botonTemaEl.addEventListener("click", function () {
      alternarTema();
    });

    contenedorControles.appendChild(botonSonidoEl);
    contenedorControles.appendChild(botonTemaEl);

    barra.appendChild(enlaceInicio);
    barra.appendChild(contenedorControles);

    document.body.insertBefore(barra, document.body.firstChild);

    actualizarBotonTema();
    actualizarBotonSonido();

    // Detectar cambios en el tema del sistema
    if (sistemaColor && sistemaColor.addEventListener) {
      sistemaColor.addEventListener("change", function () {
        if (!leerLS(CLAVE_TEMA)) {
          raiz.setAttribute("data-theme", temaPorDefecto());
          actualizarBotonTema();
        }
      });
    }
  }

  // ---------- 5. DELEGACIÓN GLOBAL DE SONIDOS INTERACTIVOS ----------
  function delegarSonidos() {
    var ultimoElementoHover = null;

    document.addEventListener("mouseover", function (e) {
      if (!sonidoActivo) return;
      var el = e.target.closest("a, button, .tool-card, .filter-chip, input, select");
      if (!el || el.disabled) {
        ultimoElementoHover = null;
        return;
      }

      // Si el cursor viene de un hijo dentro del mismo elemento interactivo, ignorar
      if (el === ultimoElementoHover || (e.relatedTarget && el.contains(e.relatedTarget))) {
        return;
      }

      ultimoElementoHover = el;
      Sonidos.hover();
    }, { passive: true });

    document.addEventListener("mouseout", function (e) {
      if (ultimoElementoHover && (!e.relatedTarget || !ultimoElementoHover.contains(e.relatedTarget))) {
        ultimoElementoHover = null;
      }
    }, { passive: true });

    document.addEventListener("click", function (e) {
      var el = e.target.closest("a, button, .filter-chip, .tool-card");
      if (el && !el.disabled && sonidoActivo) {
        Sonidos.click();
      }
    });
  }

  // ---------- 6. ATAJOS DE TECLADO EN ESCRITORIO ----------
  function registrarAtajos() {
    window.addEventListener("keydown", function (e) {
      var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
      var esInput = tag === "input" || tag === "textarea" || (e.target && e.target.isContentEditable);

      // Tecla Escape: deseleccionar o limpiar buscador
      if (e.key === "Escape") {
        var buscador = document.getElementById("buscador");
        if (buscador && document.activeElement === buscador) {
          if (buscador.value) {
            buscador.value = "";
            buscador.dispatchEvent(new Event("input", { bubbles: true }));
          } else {
            buscador.blur();
          }
        }
        return;
      }

      // Si el usuario está escribiendo en un input, no interceptar 'm', 't', '/'
      if (esInput) return;

      // Atajo [ / ] o [ Ctrl+K ]: enfocar buscador
      if (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
        var inputBuscador = document.getElementById("buscador");
        if (inputBuscador) {
          e.preventDefault();
          inputBuscador.focus();
          inputBuscador.select();
          if (sonidoActivo) Sonidos.accion();
        }
        return;
      }

      // Atajo [ M ]: alternar sonido
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        alternarSonido();
        return;
      }

      // Atajo [ T ]: alternar tema
      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        alternarTema();
        return;
      }
    });
  }

  // Inicialización cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      montarTopbar();
      delegarSonidos();
      registrarAtajos();
    });
  } else {
    montarTopbar();
    delegarSonidos();
    registrarAtajos();
  }
})();
