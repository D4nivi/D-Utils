/* =========================================================
   D-Utils · Código común a todas las páginas
   - Aplica el tema claro/oscuro antes de pintar (sin parpadeos)
   - Inserta la barra superior (topbar) con slot de radio, tema y sonido
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
  var urlRaiz = "";
  try {
    urlRaiz = new URL("../index.html", base).href;
  } catch (e) {
    urlRaiz = "../index.html";
  }

  function leerLS(clave) {
    try { return localStorage.getItem(clave); } catch (e) { return null; }
  }
  function guardarLS(clave, valor) {
    try { localStorage.setItem(clave, valor); } catch (e) { /* sin almacenamiento */ }
  }

  // ---------- 1. GESTIÓN DEL TEMA (inmediato en <head>) ----------
  function normalizarTemaInicial(t) {
    if (t === "dark") return "tactico";
    if (t === "light") return "laboratorio";
    return t || "tactico";
  }

  var temaGuardado = normalizarTemaInicial(leerLS(CLAVE_TEMA));
  raiz.setAttribute("data-theme", temaGuardado);

  // Favicon (relativo a assets/)
  try {
    var icono = document.createElement("link");
    icono.rel = "icon";
    icono.href = new URL(FAVICON, base).href;
    document.head.appendChild(icono);
  } catch (e) {
    /* fallback si URL falla */
  }

  // Estilos globales (relativo a assets/css/base.css)
  if (typeof document !== "undefined" && !document.querySelector('link[href*="base.css"]')) {
    try {
      var linkEstilos = document.createElement("link");
      linkEstilos.rel = "stylesheet";
      linkEstilos.href = new URL("css/base.css", base).href;
      document.head.appendChild(linkEstilos);
    } catch (e) {
      /* fallback si URL falla */
    }
  }

  // Asegura la disponibilidad de iconos UI desde componentes/iconos.js
  if (typeof window !== "undefined" && !window.DUtilsIconos) {
    try {
      var scriptIconos = document.createElement("script");
      scriptIconos.src = new URL("../componentes/iconos.js", base).href;
      scriptIconos.onload = function () {
        actualizarBotonSonido();
        if (window.DUtilsTemas && window.DUtilsTemas.actualizarIconos) {
          window.DUtilsTemas.actualizarIconos();
        }
        if (window.DUtilsRadio && window.DUtilsRadio.actualizarIconos) {
          window.DUtilsRadio.actualizarIconos();
        }
      };
      document.head.appendChild(scriptIconos);
    } catch (e) {
      /* fallback si URL falla */
    }
  }

  // Asegura la disponibilidad del selector de temas desde componentes/temas.js
  if (typeof window !== "undefined" && !window.DUtilsTemas) {
    try {
      var scriptTemas = document.createElement("script");
      scriptTemas.src = new URL("../componentes/temas.js", base).href;
      scriptTemas.onload = function () {
        var host = document.getElementById("tema-host");
        if (host && window.DUtilsTemas && window.DUtilsTemas.montar) {
          window.DUtilsTemas.montar(host);
        }
      };
      document.head.appendChild(scriptTemas);
    } catch (e) {
      /* fallback si URL falla */
    }
  }

  // Asegura la disponibilidad del módulo de radio táctica desde componentes/radio.js
  if (typeof window !== "undefined" && !window.DUtilsRadio) {
    try {
      var scriptRadio = document.createElement("script");
      scriptRadio.src = new URL("../componentes/radio.js", base).href;
      scriptRadio.onload = function () {
        var host = document.getElementById("radio-host");
        if (host && window.DUtilsRadio && window.DUtilsRadio.montar) {
          window.DUtilsRadio.montar(host);
        }
      };
      document.head.appendChild(scriptRadio);
    } catch (e) {
      /* fallback si URL falla */
    }
  }

  // Asegura la disponibilidad del fondo interactivo táctico desde componentes/fondo.js
  if (typeof window !== "undefined" && !window.DUtilsFondo) {
    try {
      var scriptFondo = document.createElement("script");
      scriptFondo.src = new URL("../componentes/fondo.js", base).href;
      scriptFondo.onload = function () {
        if (window.DUtilsFondo && window.DUtilsFondo.iniciar) {
          window.DUtilsFondo.iniciar();
        }
      };
      document.head.appendChild(scriptFondo);
    } catch (e) {
      /* fallback si URL falla */
    }
  }

  // ---------- 2. MOTOR DE AUDIO SINTÉTICO (Web Audio API) ----------
  // Sin archivos externos: audio táctico generado en tiempo real para clics/hovers.
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
    get radio() {
      return window.DUtilsRadio;
    },
    get fondo() {
      return window.DUtilsFondo;
    },
    tema: {
      actual: function () { return raiz.getAttribute("data-theme") || "tactico"; },
      fijar: function (id) {
        if (window.DUtilsTemas && window.DUtilsTemas.fijarTema) {
          window.DUtilsTemas.fijarTema(id, true);
        } else {
          raiz.setAttribute("data-theme", id);
          guardarLS(CLAVE_TEMA, id);
        }
      },
      siguiente: function () {
        if (window.DUtilsTemas && window.DUtilsTemas.siguienteTema) {
          window.DUtilsTemas.siguienteTema();
        }
      }
    }
  };

  // ---------- 4. MONTAJE DE LA INTERFAZ SUPERIOR (TOPBAR) ----------
  var botonSonidoEl = null;

  function actualizarBotonSonido() {
    if (!botonSonidoEl) return;
    botonSonidoEl.classList.toggle("active", sonidoActivo);
    botonSonidoEl.setAttribute("aria-pressed", String(sonidoActivo));
    var texto = botonSonidoEl.querySelector(".sound-text");
    if (texto) {
      texto.textContent = sonidoActivo ? "FX: ON" : "FX: OFF";
    }

    if (!botonSonidoEl.querySelector("svg") && window.DUtilsIconos && window.DUtilsIconos.sonido) {
      botonSonidoEl.insertAdjacentHTML("afterbegin", window.DUtilsIconos.sonido);
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
    enlaceInicio.href = urlRaiz || "index.html";
    enlaceInicio.innerHTML = '<span class="topbar-brand-mark">D</span><span>D-UTILS // TACTICAL</span>';

    var contenedorControles = document.createElement("div");
    contenedorControles.className = "topbar-controls";

    // Slot receptor para el componente modular de la radio táctica
    var slotRadio = document.createElement("div");
    slotRadio.className = "topbar-radio-slot";
    slotRadio.id = "radio-host";
    if (window.DUtilsRadio && window.DUtilsRadio.montar) {
      window.DUtilsRadio.montar(slotRadio);
    }
    contenedorControles.appendChild(slotRadio);

    // Botón de sonido sintético (FX)
    botonSonidoEl = document.createElement("button");
    botonSonidoEl.type = "button";
    botonSonidoEl.className = "sound-btn";
    botonSonidoEl.setAttribute("aria-label", "Activar o desactivar efectos de sonido");
    var iconoSonido = (window.DUtilsIconos && window.DUtilsIconos.sonido) || "";
    botonSonidoEl.innerHTML = iconoSonido + '<span class="sound-text">FX: OFF</span>';

    botonSonidoEl.addEventListener("click", function () {
      alternarSonido();
    });

    // Slot receptor para el componente modular de selección de temas
    var slotTema = document.createElement("div");
    slotTema.className = "topbar-theme-slot";
    slotTema.id = "tema-host";
    if (window.DUtilsTemas && window.DUtilsTemas.montar) {
      window.DUtilsTemas.montar(slotTema);
    }

    contenedorControles.appendChild(botonSonidoEl);
    contenedorControles.appendChild(slotTema);

    barra.appendChild(enlaceInicio);
    barra.appendChild(contenedorControles);

    document.body.insertBefore(barra, document.body.firstChild);

    actualizarBotonSonido();
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

      // Atajo [ M ]: alternar sonido FX
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        alternarSonido();
        return;
      }

      // Atajo [ R ]: alternar radio (play / pause)
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        if (window.DUtilsRadio && window.DUtilsRadio.alternar) {
          window.DUtilsRadio.alternar();
        }
        return;
      }

      // Atajo [ T ]: siguiente tema visual
      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        if (window.DUtilsTemas && window.DUtilsTemas.siguienteTema) {
          window.DUtilsTemas.siguienteTema();
        }
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
      if (window.DUtilsFondo && window.DUtilsFondo.iniciar) {
        window.DUtilsFondo.iniciar();
      }
    });
  } else {
    montarTopbar();
    delegarSonidos();
    registrarAtajos();
    if (window.DUtilsFondo && window.DUtilsFondo.iniciar) {
      window.DUtilsFondo.iniciar();
    }
  }
})();
