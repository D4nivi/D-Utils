/* =========================================================
   D-Utils · Componente de Pie de Página Táctico (Footer)
   - Telemetría del sistema (STATIC GITHUB PAGES · ZERO SERVERS)
   - Atajos de teclado interactivos (/ Buscar, Esc Limpiar, T Tema, M SFX, R Radio)
   - Reutilizable en la portada y en todas las páginas de herramientas
   ========================================================= */
(function () {
  "use strict";

  var ATAJOS_DEFECTO = [
    { tecla: "/", descripcion: "Buscar", accion: "buscar", titulo: "Buscar utilidad o enfocar buscador (/ o Ctrl+K)" },
    { tecla: "Esc", descripcion: "Limpiar", accion: "limpiar", titulo: "Limpiar búsqueda o deseleccionar (Esc)" },
    { tecla: "T", descripcion: "Tema", accion: "tema", titulo: "Cambiar al siguiente tema visual (T)" },
    { tecla: "M", descripcion: "SFX", accion: "sfx", titulo: "Activar o silenciar efectos de sonido (M)" },
    { tecla: "R", descripcion: "Radio", accion: "radio", titulo: "Reproducir o pausar la radio táctica (R)" }
  ];

  var TEXTO_DEFECTO = "D-UTILS // 100% STATIC GITHUB PAGES · ZERO SERVERS";

  function reproducirClick() {
    if (window.DUtils && window.DUtils.audio && typeof window.DUtils.audio.click === "function") {
      try {
        window.DUtils.audio.click();
      } catch (e) {
        /* audio no disponible o silenciado */
      }
    }
  }

  function ejecutarAccionAtajo(accion) {
    reproducirClick();

    if (accion === "buscar") {
      var buscador = document.getElementById("buscador") ||
                     document.getElementById("buscador-simbolos") ||
                     document.querySelector('input[type="search"]') ||
                     document.querySelector('input[placeholder*="Buscar"]');
      if (buscador) {
        buscador.focus();
        if (typeof buscador.select === "function") buscador.select();
      }
      return;
    }

    if (accion === "limpiar") {
      var inputActivo = document.getElementById("buscador") ||
                        document.getElementById("buscador-simbolos") ||
                        document.querySelector('input[type="search"]');
      if (inputActivo && (inputActivo.value || document.activeElement === inputActivo)) {
        inputActivo.value = "";
        inputActivo.dispatchEvent(new Event("input", { bubbles: true }));
        inputActivo.blur();
      }
      return;
    }

    if (accion === "tema") {
      if (window.DUtils && window.DUtils.tema && typeof window.DUtils.tema.siguiente === "function") {
        window.DUtils.tema.siguiente();
      } else if (window.DUtilsTemas && typeof window.DUtilsTemas.siguienteTema === "function") {
        window.DUtilsTemas.siguienteTema();
      }
      return;
    }

    if (accion === "sfx") {
      if (window.DUtils && window.DUtils.audio && typeof window.DUtils.audio.alternar === "function") {
        window.DUtils.audio.alternar();
      }
      return;
    }

    if (accion === "radio") {
      if (window.DUtilsRadio && typeof window.DUtilsRadio.alternar === "function") {
        window.DUtilsRadio.alternar();
      }
      return;
    }
  }

  /**
   * Crea el elemento DOM del footer táctico
   */
  function crear(opciones) {
    opciones = opciones || {};
    var texto = typeof opciones.texto === "string" ? opciones.texto : TEXTO_DEFECTO;
    var atajos = Array.isArray(opciones.atajos) ? opciones.atajos : ATAJOS_DEFECTO;

    var footer = document.createElement("footer");
    footer.className = "system-footer";

    var telemetria = document.createElement("div");
    telemetria.className = "system-telemetry";
    telemetria.textContent = texto;

    var contenedorAtajos = document.createElement("div");
    contenedorAtajos.className = "system-shortcuts";
    contenedorAtajos.setAttribute("role", "toolbar");
    contenedorAtajos.setAttribute("aria-label", "Atajos de teclado");

    atajos.forEach(function (a) {
      var item = document.createElement("span");
      item.className = "shortcut-item";
      if (a.accion) {
        item.setAttribute("data-accion", a.accion);
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        if (a.titulo) item.setAttribute("title", a.titulo);

        item.addEventListener("click", function () {
          ejecutarAccionAtajo(a.accion);
        });

        item.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            ejecutarAccionAtajo(a.accion);
          }
        });
      }

      var kbd = document.createElement("kbd");
      kbd.textContent = a.tecla;

      item.appendChild(kbd);
      item.appendChild(document.createTextNode(" " + a.descripcion));
      contenedorAtajos.appendChild(item);
    });

    footer.appendChild(telemetria);
    footer.appendChild(contenedorAtajos);
    return footer;
  }

  /**
   * Monta el footer en el contenedor indicado o al final de <main> o <body>
   */
  function montar(contenedor, opciones) {
    // Si ya existe un .system-footer en el documento, evitar duplicados
    var existente = document.querySelector(".system-footer");
    if (existente) {
      return existente;
    }

    var host = null;
    if (typeof contenedor === "string") {
      host = document.querySelector(contenedor);
    } else if (contenedor && contenedor.nodeType === 1) {
      host = contenedor;
    } else {
      host = document.getElementById("footer-host") || document.querySelector("main") || document.body;
    }

    if (!host) return null;

    var footer = crear(opciones);
    if (host.id === "footer-host") {
      host.replaceWith(footer);
    } else {
      host.appendChild(footer);
    }
    return footer;
  }

  // API pública del componente
  window.DUtilsFooter = {
    crear: crear,
    montar: montar,
    ejecutarAccion: ejecutarAccionAtajo,
    atajosPorDefecto: ATAJOS_DEFECTO
  };
  window.DUtilsPie = window.DUtilsFooter;

  // Auto-montaje al cargar la página si aún no existe en el DOM
  function autoMontar() {
    if (!document.querySelector(".system-footer")) {
      montar();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMontar);
  } else {
    autoMontar();
  }
})();
