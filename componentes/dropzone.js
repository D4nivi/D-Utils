/* =========================================================
   D-Utils · Componente Reutilizable de Zona de Carga / Dropzone
   - Arrastre y soltado de archivos (drag & drop)
   - Clic para seleccionar desde el explorador de archivos
   - Accesible vía teclado (Enter / Espacio)
   - Parametrizable: formatos aceptados (accept), múltiple/único,
     textos principales, pista/formatos, icono SVG, pegado (Ctrl+V)
   - Compatible con Web Audio API de D-Utils para FX tácticos
   ========================================================= */
(function () {
  "use strict";

  function reproducirSonido(tipo) {
    if (window.DUtils && window.DUtils.audio && typeof window.DUtils.audio[tipo] === "function") {
      try {
        window.DUtils.audio[tipo]();
      } catch (e) {
        /* audio no disponible o silenciado */
      }
    }
  }

  function obtenerIconoSVG(idIcono) {
    if (!window.DUtilsIconos) return "";
    var tema = document.documentElement.getAttribute("data-theme") || "tactico";
    if (typeof window.DUtilsIconos.obtener === "function") {
      return window.DUtilsIconos.obtener(idIcono, tema);
    }
    return window.DUtilsIconos[idIcono] || "";
  }

  var ICONO_FALLBACK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
      '<polyline points="17 8 12 3 7 8"/>' +
      '<line x1="12" y1="3" x2="12" y2="15"/>' +
    '</svg>';

  /**
   * Comprueba si un archivo coincide con la cadena de tipos permitidos (accept).
   */
  function archivoCoincideAccept(archivo, acceptStr) {
    if (!acceptStr || acceptStr === "*/*" || acceptStr === "*") return true;
    var reglas = acceptStr.split(",").map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
    if (!reglas.length) return true;

    var tipoMime = (archivo.type || "").toLowerCase();
    var nombre = (archivo.name || "").toLowerCase();

    return reglas.some(function (regla) {
      if (regla.charAt(0) === ".") {
        return nombre.slice(-regla.length) === regla;
      }
      if (regla.slice(-2) === "/*") {
        var prefijo = regla.slice(0, -2);
        return tipoMime.indexOf(prefijo) === 0;
      }
      return tipoMime === regla;
    });
  }

  /**
   * Crea o inicializa una zona de carga (dropzone).
   *
   * @param {Object} opciones
   * @param {HTMLElement|string} opciones.contenedor - Elemento host o selector CSS.
   * @param {string} [opciones.id="drop"] - ID para el elemento dropzone.
   * @param {string} [opciones.idInput="fichero"] - ID para el input file oculto.
   * @param {string} [opciones.accept="image/jpeg,image/png"] - Tipos MIME o extensiones permitidas.
   * @param {boolean} [opciones.multiple=true] - Si permite seleccionar múltiples archivos.
   * @param {string} [opciones.texto] - Texto principal HTML.
   * @param {string} [opciones.pista] - Texto secundario/técnico de formatos.
   * @param {string|boolean} [opciones.icono="subir"] - Icono en DUtilsIconos, SVG, o false.
   * @param {string} [opciones.ariaLabel="Seleccionar o soltar archivos"] - Etiqueta accesible.
   * @param {boolean} [opciones.soportaPegado=false] - Si escucha Ctrl+V global para capturar imágenes.
   * @param {Function} [opciones.validarArchivo] - Función opcional para validación adicional (file => boolean).
   * @param {Function} [opciones.onArchivos] - Callback function(files, event).
   * @param {Function} [opciones.onError] - Callback function(mensaje, archivosRechazados).
   * @returns {Object} Instancia con referencias DOM y métodos de control.
   */
  function crear(opciones) {
    opciones = opciones || {};

    var host = typeof opciones.contenedor === "string"
      ? document.querySelector(opciones.contenedor)
      : opciones.contenedor;

    if (!host) {
      throw new Error("DUtilsDropzone: Se requiere un contenedor válido.");
    }

    var idDrop = opciones.id || host.id || "drop";
    var idInput = opciones.idInput || "fichero";
    var accept = typeof opciones.accept === "string" ? opciones.accept : "image/jpeg,image/png";
    var multiple = opciones.multiple !== false;
    var textoPrincipal = typeof opciones.texto === "string"
      ? opciones.texto
      : "Arrastra imágenes aquí o <strong>haz clic para elegirlas</strong>";
    var pistaTexto = typeof opciones.pista === "string"
      ? opciones.pista
      : "JPG y PNG, tantas como quieras";
    var idIcono = opciones.icono !== undefined ? opciones.icono : "subir";
    var ariaLabel = opciones.ariaLabel || "Seleccionar o soltar archivos";
    var soportaPegado = !!opciones.soportaPegado;
    var onArchivos = typeof opciones.onArchivos === "function" ? opciones.onArchivos : null;
    var validarExtra = typeof opciones.validarArchivo === "function" ? opciones.validarArchivo : null;

    var elDrop = host;
    elDrop.id = idDrop;
    if (!elDrop.classList.contains("dutils-dropzone")) {
      elDrop.classList.add("dutils-dropzone");
    }
    elDrop.setAttribute("tabindex", "0");
    elDrop.setAttribute("role", "button");
    elDrop.setAttribute("aria-label", ariaLabel);

    // Renderizar estructura interna
    var htmlIcono = "";
    if (idIcono) {
      var svgIcono = (typeof idIcono === "string" && idIcono.indexOf("<svg") === -1)
        ? (obtenerIconoSVG(idIcono) || ICONO_FALLBACK)
        : idIcono;
      htmlIcono = '<div class="dutils-dropzone-icono">' + svgIcono + '</div>';
    }

    var htmlTexto = '<div class="dutils-dropzone-texto">' + textoPrincipal + '</div>';
    var htmlPista = pistaTexto ? ('<div class="dutils-dropzone-pista">' + pistaTexto + '</div>') : '';
    var inputAttrs = 'id="' + idInput + '" type="file" accept="' + accept + '"' + (multiple ? ' multiple' : '') + ' hidden';
    var htmlInput = '<input ' + inputAttrs + '>';

    elDrop.innerHTML = htmlIcono + htmlTexto + htmlPista + htmlInput;

    var elInput = elDrop.querySelector("input[type='file']");

    function filtrarYDespachar(lista, eventoOrigen) {
      if (!lista || !lista.length) return;

      var validos = [];
      var rechazados = [];

      for (var i = 0; i < lista.length; i++) {
        var f = lista[i];
        var pasaAccept = archivoCoincideAccept(f, accept);
        var pasaExtra = !validarExtra || validarExtra(f);

        if (pasaAccept && pasaExtra) {
          validos.push(f);
        } else {
          rechazados.push(f);
        }
      }

      if (rechazados.length > 0 && typeof opciones.onError === "function") {
        opciones.onError("Formato de archivo no soportado", rechazados);
      }

      if (!multiple && validos.length > 1) {
        validos = [validos[0]];
      }

      if (validos.length > 0) {
        reproducirSonido("accion");
        if (onArchivos) {
          onArchivos(validos, eventoOrigen);
        }
      }
    }

    // Interacciones de Clic y Teclado
    elDrop.addEventListener("click", function (e) {
      if (e.target !== elInput) {
        reproducirSonido("click");
        elInput.click();
      }
    });

    elDrop.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        reproducirSonido("click");
        elInput.click();
      }
    });

    // Eventos Drag & Drop con contador para transiciones suaves
    var dragContador = 0;

    elDrop.addEventListener("dragenter", function (e) {
      e.preventDefault();
      dragContador++;
      elDrop.classList.add("over");
    });

    elDrop.addEventListener("dragover", function (e) {
      e.preventDefault();
      if (!elDrop.classList.contains("over")) {
        elDrop.classList.add("over");
      }
    });

    elDrop.addEventListener("dragleave", function (e) {
      e.preventDefault();
      dragContador--;
      if (dragContador <= 0) {
        dragContador = 0;
        elDrop.classList.remove("over");
      }
    });

    elDrop.addEventListener("drop", function (e) {
      e.preventDefault();
      dragContador = 0;
      elDrop.classList.remove("over");

      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        filtrarYDespachar(e.dataTransfer.files, e);
      }
    });

    // Evento de selección vía selector nativo
    elInput.addEventListener("change", function (e) {
      if (this.files && this.files.length) {
        filtrarYDespachar(this.files, e);
        this.value = "";
      }
    });

    // Pegado directo desde portapapeles si está habilitado
    var handlerPegado = null;
    if (soportaPegado) {
      handlerPegado = function (e) {
        var clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData || !clipboardData.items) return;

        var archivosPegados = [];
        for (var i = 0; i < clipboardData.items.length; i++) {
          var item = clipboardData.items[i];
          if (item.kind === "file") {
            var f = item.getAsFile();
            if (f) {
              var tipo = f.type || "image/png";
              var ext = tipo.split("/")[1] || "png";
              var nombreCaptura = "captura_" + Date.now() + "." + ext;
              archivosPegados.push(new File([f], nombreCaptura, { type: tipo }));
            }
          }
        }

        if (archivosPegados.length > 0) {
          e.preventDefault();
          filtrarYDespachar(archivosPegados, e);
        }
      };
      window.addEventListener("paste", handlerPegado);
    }

    // Refrescar icono SVG al cambiar tema
    var observerTema = new MutationObserver(function () {
      if (idIcono && typeof idIcono === "string" && idIcono.indexOf("<svg") === -1) {
        var contIcono = elDrop.querySelector(".dutils-dropzone-icono");
        if (contIcono) {
          contIcono.innerHTML = obtenerIconoSVG(idIcono) || ICONO_FALLBACK;
        }
      }
    });
    observerTema.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return {
      elemento: elDrop,
      input: elInput,
      abrirSelector: function () {
        elInput.click();
      },
      actualizarTextos: function (nuevoTexto, nuevaPista) {
        if (nuevoTexto !== undefined) {
          var elT = elDrop.querySelector(".dutils-dropzone-texto");
          if (elT) elT.innerHTML = nuevoTexto;
        }
        if (nuevaPista !== undefined) {
          var elP = elDrop.querySelector(".dutils-dropzone-pista");
          if (elP) elP.innerHTML = nuevaPista;
        }
      },
      destruir: function () {
        if (handlerPegado) {
          window.removeEventListener("paste", handlerPegado);
        }
        observerTema.disconnect();
      }
    };
  }

  // API Global D-Utils
  window.DUtilsDropzone = {
    crear: crear
  };
  window.DUtilsZonaCarga = window.DUtilsDropzone;
})();
