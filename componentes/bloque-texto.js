/* =========================================================
   D-Utils · Componente de Bloque de Texto / Editor
   Bloque interactivo reutilizable con barra de acciones
   (pegar, subir archivo, copiar, borrar), área textarea,
   drag & drop y pie informativo con conteo de métricas básicas.

   Usado en:
   - contador-palabras/ (referencia arquitectónica)
   - indexator/ (bloque de entrada [bruto] y bloque de salida [indexado])
   ========================================================= */
(function () {
  "use strict";

  /**
   * Helper para reproducir efectos de sonido tácticos si la radio/audio está disponible.
   */
  function reproducirSonido(tipo) {
    if (window.DUtils && window.DUtils.audio && typeof window.DUtils.audio[tipo] === "function") {
      try {
        window.DUtils.audio[tipo]();
      } catch (e) {
        // Ignorar fallos de audio si el contexto no está desbloqueado
      }
    }
  }

  /**
   * Obtiene un icono SVG centralizado según el tema visual actual.
   */
  function obtenerIconoSVG(idIcono) {
    if (!window.DUtilsIconos) return "";
    var tema = document.documentElement.getAttribute("data-theme") || "tactico";
    if (typeof window.DUtilsIconos.obtener === "function") {
      return window.DUtilsIconos.obtener(idIcono, tema);
    }
    return window.DUtilsIconos[idIcono] || "";
  }

  /**
   * Crea una instancia del componente Bloque de Texto.
   *
   * @param {Object} opciones
   * @param {HTMLElement|string} opciones.contenedor - Elemento DOM o selector del host.
   * @param {string} [opciones.id] - ID único para el textarea.
   * @param {string} [opciones.titulo] - Título superior del bloque.
   * @param {string} [opciones.badge] - Texto para badge HUD (ej. "ENTRADA", "SALIDA").
   * @param {string} [opciones.placeholder] - Texto placeholder del textarea.
   * @param {boolean} [opciones.soloLectura=false] - Si el área es de solo lectura.
   * @param {string[]} [opciones.acciones] - Botones a incluir ('pegar', 'subir', 'copiar', 'borrar').
   * @param {string} [opciones.pista] - Mensaje explicativo en el pie del editor.
   * @param {string} [opciones.valorInicial=""] - Contenido inicial.
   * @param {boolean} [opciones.autofocus=false] - Foco automático.
   * @param {Function} [opciones.onChange] - Callback invocado al cambiar el contenido.
   * @returns {Object} API del componente.
   */
  function crear(opciones) {
    opciones = opciones || {};

    var host = typeof opciones.contenedor === "string"
      ? document.querySelector(opciones.contenedor)
      : opciones.contenedor;

    if (!host) {
      throw new Error("DUtilsBloqueTexto: Se requiere un contenedor válido.");
    }

    var idUnico = opciones.id || "editor-" + Math.random().toString(36).substring(2, 9);
    var soloLectura = !!opciones.soloLectura;
    var acciones = opciones.acciones || (soloLectura ? ["copiar"] : ["pegar", "subir", "copiar", "borrar"]);
    var pistaTexto = opciones.pista || (soloLectura ? "Listo para copiar" : "Entrada de texto directa");
    var placeholderTexto = opciones.placeholder || "Escribe o pega aquí el contenido...";

    // Estructura DOM principal
    var raiz = document.createElement("div");
    raiz.className = "col-escritura bloque-texto-instancia";

    // Cabecera opcional (Título)
    if (opciones.titulo) {
      var cabecera = document.createElement("div");
      cabecera.className = "bloque-texto-cabecera";

      var elTitulo = document.createElement("h3");
      elTitulo.className = "bloque-texto-titulo";
      elTitulo.textContent = opciones.titulo;
      cabecera.appendChild(elTitulo);

      raiz.appendChild(cabecera);
    }

    // Barra de acciones
    var barraAcciones = document.createElement("div");
    barraAcciones.className = "barra-acciones";
    barraAcciones.setAttribute("role", "toolbar");
    barraAcciones.setAttribute("aria-label", "Acciones de texto");

    var grupoAcciones = document.createElement("div");
    grupoAcciones.className = "acciones-grupo";

    // Botón Pegar
    var btnPegar = null;
    if (acciones.indexOf("pegar") !== -1 && !soloLectura) {
      btnPegar = document.createElement("button");
      btnPegar.type = "button";
      btnPegar.className = "btn-tactico";
      btnPegar.title = "Pegar texto desde el portapapeles";
      btnPegar.innerHTML =
        '<span class="btn-icono" data-icono="pegar">' + obtenerIconoSVG("pegar") + '</span>' +
        '<span>Pegar</span>';
      grupoAcciones.appendChild(btnPegar);
    }

    // Botón Subir archivo
    var inputArchivo = null;
    if (acciones.indexOf("subir") !== -1 && !soloLectura) {
      var labelSubir = document.createElement("label");
      labelSubir.className = "btn-tactico";
      labelSubir.title = "Cargar archivo de texto (.txt o .md)";
      labelSubir.innerHTML =
        '<span class="btn-icono" data-icono="subir">' + obtenerIconoSVG("subir") + '</span>' +
        '<span>Subir .txt/.md</span>';

      inputArchivo = document.createElement("input");
      inputArchivo.type = "file";
      inputArchivo.accept = ".txt,.md,text/plain,text/markdown";
      inputArchivo.hidden = true;
      labelSubir.appendChild(inputArchivo);
      grupoAcciones.appendChild(labelSubir);
    }

    // Botón Copiar
    var btnCopiar = null;
    var labelCopiarSpan = null;
    if (acciones.indexOf("copiar") !== -1) {
      btnCopiar = document.createElement("button");
      btnCopiar.type = "button";
      btnCopiar.className = "btn-tactico";
      btnCopiar.title = "Copiar texto al portapapeles";
      btnCopiar.innerHTML =
        '<span class="btn-icono" data-icono="copiar">' + obtenerIconoSVG("copiar") + '</span>' +
        '<span class="label-copiar">Copiar</span>';
      labelCopiarSpan = btnCopiar.querySelector(".label-copiar");
      grupoAcciones.appendChild(btnCopiar);
    }

    // Botón Borrar / Limpiar
    var btnBorrar = null;
    if (acciones.indexOf("borrar") !== -1 && !soloLectura) {
      btnBorrar = document.createElement("button");
      btnBorrar.type = "button";
      btnBorrar.className = "btn-tactico btn-tactico-peligro";
      btnBorrar.title = "Borrar todo el texto";
      btnBorrar.innerHTML =
        '<span class="btn-icono" data-icono="borrar">' + obtenerIconoSVG("borrar") + '</span>' +
        '<span>Borrar</span>';
      grupoAcciones.appendChild(btnBorrar);
    }

    barraAcciones.appendChild(grupoAcciones);

    // Toast feedback inline
    var toast = document.createElement("div");
    toast.className = "toast-feedback";
    toast.setAttribute("aria-live", "polite");
    barraAcciones.appendChild(toast);

    raiz.appendChild(barraAcciones);

    // Contenedor del editor con Drop Zone
    var dropZone = document.createElement("div");
    dropZone.className = "editor-contenedor";

    var textarea = document.createElement("textarea");
    textarea.id = idUnico;
    textarea.placeholder = placeholderTexto;
    textarea.spellcheck = false;
    textarea.setAttribute("aria-label", opciones.titulo || "Área de texto");
    if (soloLectura) {
      textarea.readOnly = true;
      textarea.classList.add("editor-solo-lectura");
    }
    if (opciones.autofocus) {
      textarea.autofocus = true;
    }
    if (opciones.valorInicial) {
      textarea.value = opciones.valorInicial;
    }

    dropZone.appendChild(textarea);

    // Pie del editor (solo conteo de caracteres)
    var editorPie = document.createElement("div");
    editorPie.className = "editor-pie";

    var elConteo = document.createElement("span");
    elConteo.className = "editor-cuenta-pie";
    elConteo.textContent = "0 caracteres";

    editorPie.appendChild(elConteo);
    dropZone.appendChild(editorPie);

    raiz.appendChild(dropZone);
    host.appendChild(raiz);

    var toastTimer = null;

    /**
     * Muestra mensaje flotante en la barra de acciones.
     */
    function mostrarToast(mensaje, conExito) {
      if (toastTimer) clearTimeout(toastTimer);
      toast.textContent = mensaje;
      toast.style.color = conExito === false ? "var(--error)" : "var(--accent-ok)";
      toast.classList.add("visible");
      toastTimer = setTimeout(function () {
        toast.classList.remove("visible");
      }, 2200);
    }

    /**
     * Recalcula y actualiza el contador de líneas y caracteres en el pie.
     */
    function actualizarConteo() {
      var txt = textarea.value;
      var len = txt.length;
      var lineas = txt ? txt.split("\n").length : 0;

      if (len === 0) {
        elConteo.textContent = "0 caracteres";
      } else {
        var strLineas = lineas === 1 ? "1 línea" : lineas.toLocaleString("es-ES") + " líneas";
        var strChars = len === 1 ? "1 carácter" : len.toLocaleString("es-ES") + " caracteres";
        elConteo.textContent = strLineas + " · " + strChars;
      }
    }

    /**
     * Copia el contenido del textarea al portapapeles.
     */
    function copiar() {
      var txt = textarea.value;
      if (!txt) {
        mostrarToast("No hay texto para copiar", false);
        reproducirSonido("error");
        return;
      }

      function exito() {
        mostrarToast("¡Copiado al portapapeles!", true);
        reproducirSonido("copiar");
        if (labelCopiarSpan) {
          var orig = labelCopiarSpan.textContent;
          labelCopiarSpan.textContent = "¡Copiado!";
          setTimeout(function () {
            labelCopiarSpan.textContent = orig;
          }, 1500);
        }
      }

      function fallo() {
        mostrarToast("Error al copiar portapapeles", false);
        reproducirSonido("error");
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(exito).catch(function () {
          fallbackCopiar();
        });
      } else {
        fallbackCopiar();
      }

      function fallbackCopiar() {
        try {
          textarea.select();
          var ok = document.execCommand("copy");
          if (ok) exito(); else fallo();
        } catch (err) {
          fallo();
        }
      }
    }

    /**
     * Pega texto desde el portapapeles al textarea.
     */
    function pegar() {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        mostrarToast("Usa Ctrl+V para pegar en este navegador", false);
        textarea.focus();
        return;
      }

      navigator.clipboard.readText()
        .then(function (clipText) {
          if (!clipText) {
            mostrarToast("El portapapeles está vacío", false);
            return;
          }
          establecerTexto(clipText, true);
          mostrarToast("Texto pegado correctamente", true);
          reproducirSonido("pegar");
        })
        .catch(function () {
          mostrarToast("Permiso denegado. Usa Ctrl+V para pegar", false);
          textarea.focus();
        });
    }

    /**
     * Borra el contenido.
     */
    function limpiar() {
      if (!textarea.value) return;
      establecerTexto("", true);
      mostrarToast("Texto borrado", true);
      reproducirSonido("borrar");
      textarea.focus();
    }

    /**
     * Establece el texto del textarea y actualiza métricas.
     */
    function establecerTexto(nuevoTexto, dispararEvento) {
      textarea.value = nuevoTexto == null ? "" : String(nuevoTexto);
      actualizarConteo();
      if (dispararEvento && typeof opciones.onChange === "function") {
        opciones.onChange(textarea.value);
      }
    }

    /**
     * Obtiene el texto actual.
     */
    function obtenerTexto() {
      return textarea.value;
    }

    // Eventos del Textarea
    textarea.addEventListener("input", function () {
      actualizarConteo();
      if (typeof opciones.onChange === "function") {
        opciones.onChange(textarea.value);
      }
    });

    // Eventos de botones
    if (btnPegar) {
      btnPegar.addEventListener("click", pegar);
    }
    if (btnCopiar) {
      btnCopiar.addEventListener("click", copiar);
    }
    if (btnBorrar) {
      btnBorrar.addEventListener("click", limpiar);
    }

    // Subida de archivos
    if (inputArchivo) {
      inputArchivo.addEventListener("change", function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function (evt) {
          establecerTexto(evt.target.result, true);
          mostrarToast("Archivo cargado: " + file.name, true);
          reproducirSonido("pegar");
          inputArchivo.value = "";
        };
        reader.onerror = function () {
          mostrarToast("Error al leer el archivo", false);
          reproducirSonido("error");
          inputArchivo.value = "";
        };
        reader.readAsText(file, "UTF-8");
      });
    }

    // Drag and drop de archivos sobre la caja
    if (!soloLectura) {
      ["dragenter", "dragover"].forEach(function (nombreEvento) {
        dropZone.addEventListener(nombreEvento, function (e) {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.add("drag-over");
        });
      });

      ["dragleave", "drop"].forEach(function (nombreEvento) {
        dropZone.addEventListener(nombreEvento, function (e) {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove("drag-over");
        });
      });

      dropZone.addEventListener("drop", function (e) {
        var files = e.dataTransfer && e.dataTransfer.files;
        if (!files || files.length === 0) return;

        var file = files[0];
        var reader = new FileReader();
        reader.onload = function (evt) {
          establecerTexto(evt.target.result, true);
          mostrarToast("Archivo arrastrado: " + file.name, true);
          reproducirSonido("pegar");
        };
        reader.onerror = function () {
          mostrarToast("Error al leer el archivo arrastrado", false);
          reproducirSonido("error");
        };
        reader.readAsText(file, "UTF-8");
      });
    }

    // Actualización de SVGs cuando cambia el tema
    function refrescarIconos() {
      var slots = raiz.querySelectorAll("[data-icono]");
      for (var i = 0; i < slots.length; i++) {
        var k = slots[i].getAttribute("data-icono");
        var svg = obtenerIconoSVG(k);
        if (svg) slots[i].innerHTML = svg;
      }
    }

    // Observer de tema visual
    if (window.MutationObserver) {
      var observer = new MutationObserver(function (mutations) {
        for (var m = 0; m < mutations.length; m++) {
          if (mutations[m].attributeName === "data-theme") {
            refrescarIconos();
          }
        }
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }

    // Inicializar conteo
    actualizarConteo();

    return {
      elemento: raiz,
      dropZone: dropZone,
      textarea: textarea,
      obtenerTexto: obtenerTexto,
      establecerTexto: establecerTexto,
      copiar: copiar,
      pegar: pegar,
      limpiar: limpiar,
      mostrarToast: mostrarToast,
      actualizarConteo: actualizarConteo,
      refrescarIconos: refrescarIconos
    };
  }

  window.DUtilsBloqueTexto = {
    crear: crear
  };
})();
