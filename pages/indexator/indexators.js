/* =========================================================
   D-Utils · Indexator para notas de Obsidian
   Portado fielmente de Python a JavaScript para ejecución 100% estática.
   Funciones principales: Indexator, Quasi-Indexator, Re-Indexator y De-Indexator.
   ========================================================= */
(function () {
  "use strict";

  /* =========================================================
     1. FUNCIONES PRINCIPALES Y ALGORITMOS DE INDEXACIÓN
     ========================================================= */

  /**
   * Normaliza los saltos de línea procedentes del navegador (\r\n o \r) a \n estándar.
   */
  function normalizeNewlines(text) {
    return (text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  /**
   * Devuelve la línea de índice (con tabulaciones de profundidad) para un encabezado dado.
   * Soporta tanto enlaces estándar Markdown como wikilinks anidados de Obsidian.
   */
  function buildIndexLink(depth, headingText, headingStack, useWikilinks) {
    var tabs = "\t".repeat(Math.max(0, depth));
    if (useWikilinks) {
      var headingPath = headingStack.join("#");
      return tabs + "- [[#" + headingPath + "|" + headingText + "]]";
    } else {
      var formatTitle = headingText.replace(/ /g, "%20").replace(/:/g, "");
      return tabs + "- [" + headingText + "](#" + formatTitle + ")";
    }
  }

  /**
   * Borra el índice existente de contenidos delimitado entre líneas "---".
   * Replica el comportamiento de Python: detecta '# Índice de contenidos' en los
   * primeros caracteres y descarta el bloque hasta la segunda línea '---'.
   */
  function delIndex(text) {
    var norm = normalizeNewlines(text);
    var indicePos = norm.indexOf("# Índice de contenidos");

    // Si no hay índice al inicio del documento, se devuelve intacto
    if (indicePos === -1 || indicePos > 500) {
      return norm;
    }

    var lines = norm.split("\n");
    var tresLineas = 0;
    var resultLines = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // Cuando encontramos la primera ---, iniciamos el bloque de índice
      if (line === "---") {
        tresLineas += 1;
      }

      // Mientras estemos dentro del índice (tresLineas == 1), no escribimos
      // Al llegar a la segunda --- (tresLineas == 2) y en adelante, sí escribimos
      if (tresLineas !== 1) {
        resultLines.push(line);
      }
    }

    return resultLines.join("\n");
  }

  /**
   * Inserta las líneas del índice tras la primera línea "---" del texto procesado.
   * Aplica el filtrado de IGNORE_HEADERS contando las tabulaciones iniciales.
   */
  function addIndex(outfileLines, indexLines, ignoreHeaders) {
    var filteredIndex = [];
    var ignoreH = Number(ignoreHeaders) || 0;

    if (ignoreH > 0) {
      for (var k = 0; k < indexLines.length; k++) {
        var idxLine = indexLines[k];
        // Cuenta tabuladores en los primeros 4 caracteres; en JS medimos el prefijo de tabs
        var tabCount = 0;
        var limit = Math.min(4, idxLine.length);
        for (var t = 0; t < limit; t++) {
          if (idxLine[t] === "\t") tabCount++;
        }

        if (tabCount < ignoreH - 2) {
          filteredIndex.push(idxLine);
        }
      }
    } else {
      filteredIndex = indexLines.slice();
    }

    var indiceCopiado = false;
    var resultLines = [];

    for (var i = 0; i < outfileLines.length; i++) {
      var line = outfileLines[i];
      // Tras la primera línea "---", insertamos el índice
      if (!indiceCopiado && line === "---") {
        resultLines.push(line);
        if (filteredIndex.length > 0) {
          for (var j = 0; j < filteredIndex.length; j++) {
            resultLines.push(filteredIndex[j]);
          }
        }
        indiceCopiado = true;
      } else {
        resultLines.push(line);
      }
    }

    return resultLines.join("\n");
  }

  /**
   * Función 'Indexator':
   * Numera jerárquicamente encabezados h2-h6 a partir de títulos en bruto
   * y construye el índice de contenidos correspondiente.
   */
  function indexator(text, options) {
    var opts = options || {};
    var useWikilinks = !!(opts.useWikilinks || opts.use_wikilinks);
    var subdivision = !!(opts.subdivision);
    var index = opts.index !== undefined ? Number(opts.index) : 1;
    var ignoreHeaders = opts.ignoreHeaders !== undefined ? Number(opts.ignoreHeaders) : (opts.ignore_headers !== undefined ? Number(opts.ignore_headers) : 0);
    var noIndexHeaders = opts.noIndexHeaders !== undefined ? Number(opts.noIndexHeaders) : (opts.no_index_headers !== undefined ? Number(opts.no_index_headers) : 0);

    var rawLines = normalizeNewlines(text).split("\n");
    var subindexes = [0, 0, 0, 0, 0, 0];
    var hashtagsAnt = 2;
    var insideBackticks = false;
    var headingStack = [];

    var indexLines = ["# Índice de contenidos"];
    var outfileLines = [];

    for (var idx = 0; idx < rawLines.length; idx++) {
      var line = rawLines[idx];

      // line.startswith("```") and not line.count("`") % 2 == 0
      var backticksCount = (line.match(/`/g) || []).length;
      if (line.startsWith("```") && !(backticksCount % 2 === 0)) {
        insideBackticks = !insideBackticks;
      }

      if (line.startsWith("##") && !insideBackticks) {
        var matchHashes = line.match(/^#+/);
        var hashtags = matchHashes ? matchHashes[0].length : 0;
        var depth = hashtags - 2;

        if (hashtags > hashtagsAnt) {
          for (var s = depth; s < subindexes.length; s++) {
            subindexes[s] = 0;
          }
        }

        subindexes[depth] = (subindexes[depth] || 0) + 1;

        var subindex = "";
        for (var i = 0; i <= depth; i++) {
          subindex += "." + subindexes[i];
        }

        var rawTitle = line.length > hashtags + 1 ? line.slice(hashtags + 1) : "";
        var title = rawTitle.replace(/\s+$/, "");

        var headingText = "";
        if (noIndexHeaders > 0 && noIndexHeaders <= hashtags) {
          headingText = title;
        } else if (subdivision) {
          headingText = index + subindex + " " + title;
        } else {
          if (depth === 0) {
            subindex = subindex.slice(1) + ".";
          } else {
            subindex = subindex.slice(1);
          }
          headingText = subindex + " " + title;
        }

        headingStack = headingStack.slice(0, depth);
        headingStack.push(headingText);

        indexLines.push(buildIndexLink(depth, headingText, headingStack, useWikilinks));
        outfileLines.push("#".repeat(hashtags) + " " + headingText);

        hashtagsAnt = hashtags;
      } else {
        outfileLines.push(line);
      }
    }

    indexLines.push("---");

    return addIndex(outfileLines, indexLines, ignoreHeaders);
  }

  /**
   * Función 'Quasi-Indexator':
   * Genera el índice a partir de los encabezados existentes sin modificarlos ni añadir números.
   */
  function quasiIndexator(text, options) {
    var opts = options || {};
    var ignoreHeaders = opts.ignoreHeaders !== undefined ? Number(opts.ignoreHeaders) : (opts.ignore_headers !== undefined ? Number(opts.ignore_headers) : 0);
    var rawLines = normalizeNewlines(text).split("\n");

    var indexLines = ["# Índice de contenidos"];
    var outfileLines = [];

    for (var idx = 0; idx < rawLines.length; idx++) {
      var line = rawLines[idx];
      if (line.startsWith("##")) {
        var matchHashes = line.match(/^#+/);
        var hashtags = matchHashes ? matchHashes[0].length : 0;
        var depth = hashtags - 2;

        var rawTitle = line.length > hashtags + 1 ? line.slice(hashtags + 1) : "";
        var title = rawTitle.replace(/\s+$/, "");
        var formatTitle = title.replace(/ /g, "%20");

        var tabs = "\t".repeat(Math.max(0, depth));
        indexLines.push(tabs + "- [" + title + "](#" + formatTitle + ")");
      }
      outfileLines.push(line);
    }

    indexLines.push("---");
    return addIndex(outfileLines, indexLines, ignoreHeaders);
  }

  /**
   * Función 'Re-Indexator':
   * Borra el índice previo (si existe), retira la numeración anterior de los
   * encabezados y vuelve a generar el índice y los apartados desde cero.
   */
  function reIndexator(text, options) {
    var sinIndice = delIndex(text);
    var lines = sinIndice.split("\n");
    var cleanedLines = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // Formato 1: ## 1. |### 1.1 |#### 1.1.1 | ...
      // Formato 2: ## |### |#### | ...
      var match1 = line.match(/^#{2,6} (?:\d+\.)+\d* /);
      var match2 = line.match(/^#{2,6} /);

      if (match1 || match2) {
        var matched = match1 ? match1[0] : match2[0];
        var longitud = matched.length;
        var hashMatch = line.match(/^#+/);
        var hashtags = hashMatch ? hashMatch[0].length : 2;
        var title = line.slice(longitud - 1);
        cleanedLines.push("#".repeat(hashtags) + title);
      } else {
        cleanedLines.push(line);
      }
    }

    return indexator(cleanedLines.join("\n"), options);
  }

  /**
   * Función 'De-Indexator':
   * Elimina el índice de contenidos y cualquier numeración de los encabezados,
   * restaurando la nota a su estado completamente limpio.
   */
  function deIndexator(text, options) {
    var opts = Object.assign({}, options, {
      ignoreHeaders: 2,
      noIndexHeaders: 2
    });
    return reIndexator(text, opts);
  }

  /* =========================================================
     2. PRESETS POR DEFECTO
     ========================================================= */

  var PRESETS_DEFECTO = [
    {
      id: "software",
      nombre: "Software",
      valores: { useWikilinks: false, subdivision: false, index: 1, ignoreHeaders: 0, noIndexHeaders: 0 }
    },
    {
      id: "subdivision_1",
      nombre: "Subdivision 1",
      valores: { useWikilinks: false, subdivision: true, index: 1, ignoreHeaders: 0, noIndexHeaders: 0 }
    },
    {
      id: "subdivision_2",
      nombre: "Subdivision 2",
      valores: { useWikilinks: false, subdivision: true, index: 2, ignoreHeaders: 0, noIndexHeaders: 0 }
    },
    {
      id: "subdivision_3",
      nombre: "Subdivision 3",
      valores: { useWikilinks: false, subdivision: true, index: 3, ignoreHeaders: 0, noIndexHeaders: 0 }
    },
    {
      id: "subdivision_4",
      nombre: "Subdivision 4",
      valores: { useWikilinks: false, subdivision: true, index: 4, ignoreHeaders: 0, noIndexHeaders: 0 }
    },
    {
      id: "subdivision_5",
      nombre: "Subdivision 5",
      valores: { useWikilinks: false, subdivision: true, index: 5, ignoreHeaders: 0, noIndexHeaders: 0 }
    }
  ];

  /* =========================================================
     3. EJEMPLO DE PRUEBA
     ========================================================= */

  var NOTA_EJEMPLO =
    "# Notas de arquitectura\n" +
    "Etiquetas: #desarrollo #arquitectura\n" +
    "---\n" +
    "## Fundamentos de diseño de sistemas\n" +
    "Conceptos clave de desacoplamiento, patrones tácticos y mantenibilidad a largo plazo.\n" +
    "\n" +
    "### Principio de responsabilidad única\n" +
    "Cada componente debe responder ante un único actor o caso de uso.\n" +
    "\n" +
    "### Acoplamiento y cohesión\n" +
    "Minimizar dependencias cruzadas entre dominios y favorecer interfaces explícitas.\n" +
    "\n" +
    "#### Inversión de dependencias\n" +
    "Los módulos de alto nivel no deben depender de detalles de bajo nivel.\n" +
    "\n" +
    "## Estrategias de persistencia y caché\n" +
    "Uso de almacenamiento local sin dependencias externas y bases de datos integradas.\n" +
    "\n" +
    "### Manejo de transacciones en lote\n" +
    "Consolidación de escrituras para evitar cuellos de botella en operaciones masivas.\n" +
    "\n" +
    "## Métricas de rendimiento y optimización\n" +
    "Análisis de tiempos de respuesta y profiling de procesos críticos.\n";

  /* =========================================================
     4. CONTROLADOR DE INTERFAZ DE USUARIO (UI)
     ========================================================= */

  function inicializarUI() {
    if (typeof document === "undefined" || typeof document.getElementById !== "function") {
      return;
    }
    var hostEntrada = document.getElementById("host-bloque-entrada");
    var hostSalida = document.getElementById("host-bloque-salida");

    if (!hostEntrada || !hostSalida || !window.DUtilsBloqueTexto) {
      setTimeout(inicializarUI, 60);
      return;
    }

    var estado = {
      funcionActiva: "re_indexator",
      useWikilinks: false,
      subdivision: false,
      index: 1,
      ignoreHeaders: 0,
      noIndexHeaders: 0
    };

    // Referencias a controles DOM
    var selectPreset = document.getElementById("select-preset");
    var checkWikilinks = document.getElementById("check-wikilinks");
    var checkSubdivision = document.getElementById("check-subdivision");
    var inputIndex = document.getElementById("input-index");
    var selectIgnoreHeaders = document.getElementById("select-ignore-headers");
    var selectNoIndexHeaders = document.getElementById("select-no-index-headers");
    var btnReset = document.getElementById("btn-reset-vars");
    var avisoSeparador = document.getElementById("aviso-separador");
    var contenedorIndex = document.getElementById("contenedor-index");

    // Función para poblar iconos estáticos que no estén dentro de bloque-texto
    function actualizarIconosEstaticos() {
      if (!window.DUtilsIconos) return;
      var tema = document.documentElement.getAttribute("data-theme") || "tactico";
      var slots = document.querySelectorAll("[data-icono]");
      for (var i = 0; i < slots.length; i++) {
        var idIcono = slots[i].getAttribute("data-icono");
        var svg = window.DUtilsIconos.obtener ? window.DUtilsIconos.obtener(idIcono, tema) : (window.DUtilsIconos[idIcono] || "");
        if (svg) {
          slots[i].innerHTML = svg;
        }
      }
    }

    actualizarIconosEstaticos();

    // Observador para cambios de tema visual en el documento
    if (window.MutationObserver) {
      var observerTema = new MutationObserver(function (mutations) {
        for (var m = 0; m < mutations.length; m++) {
          if (mutations[m].attributeName === "data-theme") {
            actualizarIconosEstaticos();
          }
        }
      });
      observerTema.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }

    // Poblamos el selector de presets
    if (selectPreset) {
      selectPreset.innerHTML = "";
      for (var p = 0; p < PRESETS_DEFECTO.length; p++) {
        var opt = document.createElement("option");
        opt.value = PRESETS_DEFECTO[p].id;
        opt.textContent = PRESETS_DEFECTO[p].nombre;
        selectPreset.appendChild(opt);
      }
      var optPersonalizado = document.createElement("option");
      optPersonalizado.value = "personalizado";
      optPersonalizado.textContent = "— Personalizado (configuración manual) —";
      selectPreset.appendChild(optPersonalizado);
    }

    // Instancia de bloque de ENTRADA (Bruto)
    var bloqueEntrada = window.DUtilsBloqueTexto.crear({
      contenedor: hostEntrada,
      id: "editor-entrada",
      titulo: "Nota original (bruto)",
      placeholder:
        "Escribe o pega aquí tu nota de Obsidian en bruto...\n\n" +
        "CONVENCIÓN IMPORTANTE: Coloca una línea con '---' exactamente donde quieras que se inserte el índice de contenidos.\n\n" +
        "Ejemplo:\n" +
        "---\n" +
        "## Primer apartado\n" +
        "### Subapartado\n" +
        "## Segundo apartado",
      soloLectura: false,
      acciones: ["pegar", "subir", "copiar", "borrar"],
      pista: "Usa una línea con '---' para marcar la posición del índice",
      autofocus: true,
      onChange: function () {
        procesarIndexacion();
      }
    });

    // Instancia de bloque de SALIDA (Indexado)
    var bloqueSalida = window.DUtilsBloqueTexto.crear({
      contenedor: hostSalida,
      id: "editor-salida",
      titulo: "Nota indexada (resultado)",
      placeholder: "Aquí aparecerá tu nota indexada junto con el índice de contenidos generado...",
      soloLectura: true,
      acciones: ["copiar"],
      pista: "Listo para transferir y pegar directamente en Obsidian"
    });

    /**
     * Comprueba si la nota de entrada contiene la marca "---" necesaria.
     */
    function verificarSeparador(texto) {
      if (!avisoSeparador) return;
      var tieneSeparador = false;
      if (texto) {
        var lines = normalizeNewlines(texto).split("\n");
        for (var i = 0; i < lines.length; i++) {
          if (lines[i] === "---") {
            tieneSeparador = true;
            break;
          }
        }
      }

      if (texto && !tieneSeparador && estado.funcionActiva !== "de_indexator") {
        avisoSeparador.classList.remove("oculto");
      } else {
        avisoSeparador.classList.add("oculto");
      }
    }

    /**
     * Ejecuta la indexación según la función activa y la configuración actual.
     */
    function procesarIndexacion() {
      var textoEntrada = bloqueEntrada.obtenerTexto();
      verificarSeparador(textoEntrada);

      if (!textoEntrada || !textoEntrada.trim()) {
        bloqueSalida.establecerTexto("", false);
        return;
      }

      var opciones = {
        useWikilinks: estado.useWikilinks,
        subdivision: estado.subdivision,
        index: estado.index,
        ignoreHeaders: estado.ignoreHeaders,
        noIndexHeaders: estado.noIndexHeaders
      };

      var resultado = "";

      switch (estado.funcionActiva) {
        case "indexator":
          resultado = indexator(textoEntrada, opciones);
          break;
        case "quasi_indexator":
          resultado = quasiIndexator(textoEntrada, opciones);
          break;
        case "de_indexator":
          resultado = deIndexator(textoEntrada, opciones);
          break;
        case "re_indexator":
        default:
          resultado = reIndexator(textoEntrada, opciones);
          break;
      }

      bloqueSalida.establecerTexto(resultado, false);
    }

    /**
     * Actualiza la UI visual de los controles con los valores del estado.
     */
    function sincronizarControles() {
      if (checkWikilinks) checkWikilinks.checked = estado.useWikilinks;
      if (checkSubdivision) {
        checkSubdivision.checked = estado.subdivision;
        if (contenedorIndex) {
          contenedorIndex.style.opacity = estado.subdivision ? "1" : "0.55";
        }
      }
      if (inputIndex) inputIndex.value = estado.index;
      if (selectIgnoreHeaders) selectIgnoreHeaders.value = String(estado.ignoreHeaders);
      if (selectNoIndexHeaders) selectNoIndexHeaders.value = String(estado.noIndexHeaders);

      // Comprobar si coincide con algún preset existente
      var coincidencia = "personalizado";
      for (var p = 0; p < PRESETS_DEFECTO.length; p++) {
        var v = PRESETS_DEFECTO[p].valores;
        if (
          v.useWikilinks === estado.useWikilinks &&
          v.subdivision === estado.subdivision &&
          v.index === estado.index &&
          v.ignoreHeaders === estado.ignoreHeaders &&
          v.noIndexHeaders === estado.noIndexHeaders
        ) {
          coincidencia = PRESETS_DEFECTO[p].id;
          break;
        }
      }
      if (selectPreset) selectPreset.value = coincidencia;
    }

    /**
     * Aplica un preset por su identificador.
     */
    function aplicarPreset(idPreset) {
      if (idPreset === "personalizado") return;
      for (var i = 0; i < PRESETS_DEFECTO.length; i++) {
        if (PRESETS_DEFECTO[i].id === idPreset) {
          var vals = PRESETS_DEFECTO[i].valores;
          estado.useWikilinks = vals.useWikilinks;
          estado.subdivision = vals.subdivision;
          estado.index = vals.index;
          estado.ignoreHeaders = vals.ignoreHeaders;
          estado.noIndexHeaders = vals.noIndexHeaders;
          sincronizarControles();
          procesarIndexacion();
          break;
        }
      }
    }

    // Eventos de selección de funciones (fila de botones tipo radio)
    var botonesFuncion = document.querySelectorAll(".btn-funcion");
    for (var b = 0; b < botonesFuncion.length; b++) {
      botonesFuncion[b].addEventListener("click", function () {
        var fn = this.getAttribute("data-funcion");
        if (!fn) return;

        estado.funcionActiva = fn;
        for (var j = 0; j < botonesFuncion.length; j++) {
          var esActivo = botonesFuncion[j] === this;
          botonesFuncion[j].classList.toggle("activo", esActivo);
          botonesFuncion[j].setAttribute("aria-checked", esActivo ? "true" : "false");
        }

        if (window.DUtils && window.DUtils.audio && window.DUtils.audio.click) {
          window.DUtils.audio.click();
        }

        procesarIndexacion();
      });
    }

    // Evento selector de Presets
    if (selectPreset) {
      selectPreset.addEventListener("change", function () {
        aplicarPreset(this.value);
      });
    }

    // Eventos de variables individuales
    if (checkWikilinks) {
      checkWikilinks.addEventListener("change", function () {
        estado.useWikilinks = this.checked;
        sincronizarControles();
        procesarIndexacion();
      });
    }

    if (checkSubdivision) {
      checkSubdivision.addEventListener("change", function () {
        estado.subdivision = this.checked;
        sincronizarControles();
        procesarIndexacion();
      });
    }

    if (inputIndex) {
      inputIndex.addEventListener("input", function () {
        var val = parseInt(this.value, 10);
        estado.index = isNaN(val) || val < 0 ? 0 : val;
        sincronizarControles();
        procesarIndexacion();
      });
    }

    if (selectIgnoreHeaders) {
      selectIgnoreHeaders.addEventListener("change", function () {
        estado.ignoreHeaders = parseInt(this.value, 10) || 0;
        sincronizarControles();
        procesarIndexacion();
      });
    }

    if (selectNoIndexHeaders) {
      selectNoIndexHeaders.addEventListener("change", function () {
        estado.noIndexHeaders = parseInt(this.value, 10) || 0;
        sincronizarControles();
        procesarIndexacion();
      });
    }

    // Botón restablecer valores predeterminados
    if (btnReset) {
      btnReset.addEventListener("click", function () {
        aplicarPreset("software");
        bloqueEntrada.mostrarToast("Variables restablecidas", true);
        if (window.DUtils && window.DUtils.audio && window.DUtils.audio.switch) {
          window.DUtils.audio.switch();
        }
      });
    }

    // Inicializar sincronización
    sincronizarControles();

    // Si ya había texto (por ejemplo navegación), procesar
    if (bloqueEntrada.obtenerTexto()) {
      procesarIndexacion();
    }
  }

  // Ejecución al cargar DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarUI);
  } else {
    inicializarUI();
  }

  // Exposición pública del módulo
  window.DUtilsIndexator = {
    normalizeNewlines: normalizeNewlines,
    buildIndexLink: buildIndexLink,
    indexator: indexator,
    quasiIndexator: quasiIndexator,
    reIndexator: reIndexator,
    deIndexator: deIndexator,
    delIndex: delIndex,
    addIndex: addIndex,
    PRESETS_DEFECTO: PRESETS_DEFECTO,
    NOTA_EJEMPLO: NOTA_EJEMPLO
  };
})();
