/* =========================================================
   D-Utils · Gestor y Selector de Temas Visuales
   - Registro centralizado de temas (Táctico, Laboratorio, Cartoon, Michis)
   - Selector en la barra superior (topbar) con menú flotante accesible
   - Persistencia en localStorage ("dutils-tema")
   - Emisión global del evento 'dutils:tema-cambiado'
   ========================================================= */
(function () {
  "use strict";

  var CLAVE_TEMA = "dutils-tema";
  var raiz = document.documentElement;

  // Catálogo de temas visuales disponibles en D-Utils
  var TEMAS = [
    {
      id: "tactico",
      nombre: "Táctico",
      desc: "Cyberpunk / Mecha HUD táctico",
      icono: "temaTactico",
      colorTag: "#00f0ff"
    },
    {
      id: "laboratorio",
      nombre: "Laboratorio",
      desc: "Clean Sci-Fi / Modo claro",
      icono: "temaLab",
      colorTag: "#0077b6"
    },
    {
      id: "cartoon",
      nombre: "Cartoon",
      desc: "Estilo cómic pop-art dinámico",
      icono: "temaCartoon",
      colorTag: "#ff477e"
    },
    {
      id: "gatos",
      nombre: "Michis",
      desc: "Estilo felino acogedor y tonos pastel",
      icono: "temaGatos",
      colorTag: "#ff85a2"
    }
  ];

  function leerLS() {
    try { return localStorage.getItem(CLAVE_TEMA); } catch (e) { return null; }
  }
  function guardarLS(valor) {
    try { localStorage.setItem(CLAVE_TEMA, valor); } catch (e) {}
  }

  // Normaliza temas antiguos (dark -> tactico, light -> laboratorio)
  function normalizarTema(t) {
    if (t === "dark") return "tactico";
    if (t === "light") return "laboratorio";
    for (var i = 0; i < TEMAS.length; i++) {
      if (TEMAS[i].id === t) return t;
    }
    return "tactico";
  }

  var temaActualId = normalizarTema(raiz.getAttribute("data-theme") || leerLS() || "tactico");
  raiz.setAttribute("data-theme", temaActualId);

  var hostEl = null;
  var widgetEl = null;
  var dropdownEl = null;
  var abierto = false;

  function obtenerTema(id) {
    for (var i = 0; i < TEMAS.length; i++) {
      if (TEMAS[i].id === id) return TEMAS[i];
    }
    return TEMAS[0];
  }

  function fijarTema(nuevoId, conSonido) {
    var valido = normalizarTema(nuevoId);
    temaActualId = valido;
    raiz.setAttribute("data-theme", valido);
    guardarLS(valido);

    actualizarWidget();
    cerrarDropdown();

    if (conSonido && window.DUtils && window.DUtils.audio && window.DUtils.audio.accion) {
      window.DUtils.audio.accion();
    }

    // Notificar al ecosistema de D-Utils
    window.dispatchEvent(new CustomEvent("dutils:tema-cambiado", { detail: { tema: valido } }));
    if (window.DUtilsFondo && window.DUtilsFondo.actualizarTema) {
      window.DUtilsFondo.actualizarTema(valido);
    }
  }

  function siguienteTema() {
    var idx = 0;
    for (var i = 0; i < TEMAS.length; i++) {
      if (TEMAS[i].id === temaActualId) {
        idx = i;
        break;
      }
    }
    var siguiente = TEMAS[(idx + 1) % TEMAS.length];
    fijarTema(siguiente.id, true);
  }

  function abrirDropdown() {
    if (!dropdownEl || abierto) return;
    abierto = true;
    dropdownEl.classList.add("open");
    if (widgetEl) {
      var btn = widgetEl.querySelector(".theme-btn");
      if (btn) btn.setAttribute("aria-expanded", "true");
    }
    var actualBtn = dropdownEl.querySelector('.theme-opt[data-id="' + temaActualId + '"]');
    if (actualBtn) actualBtn.focus();
  }

  function cerrarDropdown() {
    if (!dropdownEl || !abierto) return;
    abierto = false;
    dropdownEl.classList.remove("open");
    if (widgetEl) {
      var btn = widgetEl.querySelector(".theme-btn");
      if (btn) btn.setAttribute("aria-expanded", "false");
    }
  }

  function toggleDropdown() {
    if (abierto) cerrarDropdown(); else abrirDropdown();
  }

  function actualizarWidget() {
    if (!widgetEl) return;
    var tema = obtenerTema(temaActualId);
    var btn = widgetEl.querySelector(".theme-btn");
    if (!btn) return;

    var iconoHtml = (window.DUtilsIconos && window.DUtilsIconos[tema.icono]) || "";
    var iconSpan = btn.querySelector(".theme-btn-icon");
    if (iconSpan) iconSpan.innerHTML = iconoHtml;

    var nameSpan = btn.querySelector(".theme-btn-label");
    if (nameSpan) nameSpan.textContent = tema.nombre;

    if (dropdownEl) {
      var opciones = dropdownEl.querySelectorAll(".theme-opt");
      for (var i = 0; i < opciones.length; i++) {
        var opt = opciones[i];
        var activo = opt.getAttribute("data-id") === temaActualId;
        opt.classList.toggle("active", activo);
        opt.setAttribute("aria-selected", String(activo));
      }
    }
  }

  function montar(contenedor) {
    hostEl = contenedor;
    if (!hostEl) return;
    hostEl.innerHTML = "";

    widgetEl = document.createElement("div");
    widgetEl.className = "theme-picker";

    var tema = obtenerTema(temaActualId);
    var iconoHtml = (window.DUtilsIconos && window.DUtilsIconos[tema.icono]) || "";
    var chevronHtml = (window.DUtilsIconos && window.DUtilsIconos.chevronAbajo) ||
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:10px;height:10px;"><polyline points="6 9 12 15 18 9"/></svg>';

    widgetEl.innerHTML =
      '<button type="button" class="theme-btn" aria-haspopup="listbox" aria-expanded="false" aria-label="Cambiar tema visual (Pulsa T)">' +
        '<span class="theme-btn-icon">' + iconoHtml + '</span>' +
        '<span class="theme-btn-label">' + tema.nombre + '</span>' +
        '<span class="theme-btn-arrow">' + chevronHtml + '</span>' +
      '</button>' +
      '<div class="theme-dropdown" role="listbox" aria-label="Temas visuales disponibles">' +
        TEMAS.map(function (t) {
          var ico = (window.DUtilsIconos && window.DUtilsIconos[t.icono]) || "";
          var activo = t.id === temaActualId ? " active" : "";
          return (
            '<button type="button" class="theme-opt' + activo + '" role="option" data-id="' + t.id + '" aria-selected="' + (t.id === temaActualId) + '">' +
              '<span class="theme-opt-color" style="background:' + t.colorTag + ';box-shadow:0 0 6px ' + t.colorTag + '"></span>' +
              '<span class="theme-opt-icon">' + ico + '</span>' +
              '<div class="theme-opt-text">' +
                '<span class="theme-opt-name">' + t.nombre + '</span>' +
                '<span class="theme-opt-desc">' + t.desc + '</span>' +
              '</div>' +
            '</button>'
          );
        }).join("") +
      '</div>';

    dropdownEl = widgetEl.querySelector(".theme-dropdown");
    var btn = widgetEl.querySelector(".theme-btn");

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleDropdown();
    });

    var opts = widgetEl.querySelectorAll(".theme-opt");
    for (var i = 0; i < opts.length; i++) {
      (function (opt) {
        opt.addEventListener("click", function (e) {
          e.stopPropagation();
          var id = opt.getAttribute("data-id");
          fijarTema(id, true);
        });
      })(opts[i]);
    }

    document.addEventListener("click", function (e) {
      if (abierto && widgetEl && !widgetEl.contains(e.target)) {
        cerrarDropdown();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (abierto && e.key === "Escape") {
        cerrarDropdown();
        if (btn) btn.focus();
      }
    });

    hostEl.appendChild(widgetEl);
    actualizarWidget();
  }

  window.DUtilsTemas = {
    temas: TEMAS,
    montar: montar,
    fijarTema: fijarTema,
    siguienteTema: siguienteTema,
    temaActual: function () { return temaActualId; },
    actualizarIconos: actualizarWidget
  };

  // Auto-montaje si el slot está presente en el DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      var host = document.getElementById("tema-host");
      if (host && !host.hasChildNodes()) montar(host);
    });
  } else {
    var host = document.getElementById("tema-host");
    if (host && !host.hasChildNodes()) montar(host);
  }
})();
