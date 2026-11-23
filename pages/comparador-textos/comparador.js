/* =========================================================
   D-Utils · Comparador de Textos · Lógica de Interfaz
   - Instanciación de componentes BloqueTexto
   - Coordinación de diff en 2 niveles (síncrono o Web Worker inline)
   - Scroll sincronizado bidireccional sin bucles de eventos
   - Renderizado 100% seguro con escape HTML estricto
   - Cálculo y renderizado de estadísticas en tiempo real
   ========================================================= */

(function () {
  "use strict";

  // Referencias a elementos de la interfaz
  var editorOriginal = null;
  var editorModificado = null;
  var resultadoOriginalEl = null;
  var resultadoModificadoEl = null;
  var bannerIdenticosEl = null;
  var indicadorCalculandoEl = null;
  var seccionResultadosDiffEl = null;

  var chkMayusculasEl = null;
  var chkEspaciosFinalesEl = null;
  var btnIntercambiarEl = null;
  var btnLimpiarAmbosEl = null;

  // KPIs de diferencias
  var kpiLineasModEl = null;
  var kpiLineasDelEl = null;
  var kpiLineasInsEl = null;
  var kpiCharsDelEl = null;
  var kpiCharsInsEl = null;
  var kpiCharsModEl = null;
  var kpiSimilitudEl = null;

  // Cuerpo de tabla de composición
  var tablaComposicionBodyEl = null;

  // Control de concurrencia y debounce
  var temporizadorDebounce = null;
  var workerActivo = null;
  var idComparacionActual = 0;
  var sincronizandoScroll = false;

  /**
   * Helper para reproducir sonidos tácticos si están disponibles.
   */
  function reproducirSonido(tipo) {
    if (window.DUtils && window.DUtils.audio && typeof window.DUtils.audio[tipo] === "function") {
      try {
        window.DUtils.audio[tipo]();
      } catch (e) {}
    }
  }

  /**
   * Escapado estricto contra inyecciones HTML.
   */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Renderiza el texto de un chunk haciendo visibles los espacios al final de línea o saltos.
   */
  function formatearTextoChunk(texto) {
    var escapado = escapeHtml(texto);
    // Destacar visualmente espacios puros para que no se pierdan
    return escapado.replace(/ /g, '<span class="diff-espacio-visible"> </span>');
  }

  /**
   * Inicializa o recupera el Web Worker inline mediante Blob.
   */
  function obtenerWorker() {
    if (workerActivo) return workerActivo;
    if (typeof Worker === "undefined" || typeof Blob === "undefined") return null;

    try {
      // Serializamos el código de DUtilsDiffCore en el script del Worker
      var codigoWorker = [
        "var DUtilsDiffCore = {};",
        "self.onmessage = function(e) {",
        "  var datos = e.data;",
        "  var resultado = DUtilsDiffCore.compararTextos(datos.textoA, datos.textoB, datos.opciones);",
        "  var compA = DUtilsDiffCore.analizarComposicion(datos.textoA);",
        "  var compB = DUtilsDiffCore.analizarComposicion(datos.textoB);",
        "  self.postMessage({ id: datos.id, resultado: resultado, compA: compA, compB: compB, textoA: datos.textoA, textoB: datos.textoB });",
        "};",
        // Inyectar el código fuente real de DUtilsDiffCore
        "(" + DUtilsDiffCore.tokenizarLineas.toString() + ");",
        "DUtilsDiffCore.tokenizarLineas = " + DUtilsDiffCore.tokenizarLineas.toString() + ";",
        "DUtilsDiffCore.tokenizarCaracteres = " + DUtilsDiffCore.tokenizarCaracteres.toString() + ";",
        "DUtilsDiffCore.myersDiff = " + DUtilsDiffCore.myersDiff.toString() + ";",
        "DUtilsDiffCore.diffCaracteresLinea = " + DUtilsDiffCore.diffCaracteresLinea.toString() + ";",
        "DUtilsDiffCore.compararTextos = " + DUtilsDiffCore.compararTextos.toString() + ";",
        "DUtilsDiffCore.analizarComposicion = " + DUtilsDiffCore.analizarComposicion.toString() + ";"
      ].join("\n");

      var blob = new Blob([codigoWorker], { type: "application/javascript" });
      workerActivo = new Worker(URL.createObjectURL(blob));

      workerActivo.onmessage = function (e) {
        var resp = e.data;
        if (resp.id === idComparacionActual) {
          ocultarIndicadorCalculando();
          aplicarResultadoComparacion(resp.resultado, resp.compA, resp.compB, resp.textoA, resp.textoB);
        }
      };

      workerActivo.onerror = function () {
        workerActivo = null;
      };

      return workerActivo;
    } catch (err) {
      workerActivo = null;
      return null;
    }
  }

  function mostrarIndicadorCalculando() {
    if (indicadorCalculandoEl) {
      indicadorCalculandoEl.classList.add("visible");
    }
  }

  function ocultarIndicadorCalculando() {
    if (indicadorCalculandoEl) {
      indicadorCalculandoEl.classList.remove("visible");
    }
  }

  /**
   * Renderiza el HTML seguro de las líneas para un panel de resultado.
   * @param {Array} filas
   * @param {'ladoA'|'ladoB'} lado
   */
  function renderizarLineasPanel(filas, lado) {
    if (!filas || filas.length === 0) {
      return '<div class="diff-line diff-line-igual"><span class="diff-gutter"><span class="diff-gutter-symbol">&nbsp;</span></span><span class="diff-content" style="color:var(--muted); font-style:italic;">(Vacío)</span></div>';
    }

    var html = [];

    for (var i = 0; i < filas.length; i++) {
      var f = filas[i];
      var datos = f[lado];

      if (!datos) {
        // Línea vacía de relleno para mantener alineación vertical 1:1
        html.push(
          '<div class="diff-line diff-line-pad">' +
            '<span class="diff-gutter"><span class="diff-gutter-symbol">&nbsp;</span></span>' +
            '<span class="diff-content">&nbsp;</span>' +
          '</div>'
        );
        continue;
      }

      var numStr = String(datos.num || "");
      var claseLinea = "diff-line-igual";
      var simbolo = "&nbsp;";

      if (f.tipo === "eliminado") {
        claseLinea = "diff-line-del";
        simbolo = "-";
      } else if (f.tipo === "anadido") {
        claseLinea = "diff-line-ins";
        simbolo = "+";
      } else if (f.tipo === "modificado") {
        claseLinea = lado === "ladoA" ? "diff-line-mod-izq" : "diff-line-mod-der";
        simbolo = "~";
      }

      // Renderizar chunks de caracteres
      var chunksHtml = [];
      var chunks = datos.chunks || [];

      for (var c = 0; c < chunks.length; c++) {
        var ch = chunks[c];
        var txtFormateado = formatearTextoChunk(ch.texto);

        if (ch.tipo === "igual") {
          chunksHtml.push(txtFormateado);
        } else if (ch.tipo === "eliminado") {
          chunksHtml.push('<span class="diff-char-del">' + txtFormateado + '</span>');
        } else if (ch.tipo === "anadido") {
          chunksHtml.push('<span class="diff-char-ins">' + txtFormateado + '</span>');
        } else if (ch.tipo === "modificado") {
          if (lado === "ladoA") {
            chunksHtml.push('<span class="diff-char-mod-del">' + txtFormateado + '</span>');
          } else {
            chunksHtml.push('<span class="diff-char-mod-ins">' + txtFormateado + '</span>');
          }
        }
      }

      // Si la línea está vacía, mostrar espacio no colapsable
      var contenidoLinea = chunksHtml.join("");
      if (contenidoLinea === "") {
        contenidoLinea = "&nbsp;";
      }

      var badgeDegradado = datos.degradado
        ? '<span class="diff-badge-degradado" title="Diff carácter a carácter omitido por longitud extrema">[línea compleja]</span>'
        : "";

      html.push(
        '<div class="diff-line ' + claseLinea + '">' +
          '<span class="diff-gutter">' +
            '<span>' + numStr + '</span>' +
            '<span class="diff-gutter-symbol">' + simbolo + '</span>' +
          '</span>' +
          '<span class="diff-content">' + contenidoLinea + badgeDegradado + '</span>' +
        '</div>'
      );
    }

    return html.join("");
  }

  /**
   * Aplica los resultados del diff a la interfaz, paneles y estadísticas.
   */
  function aplicarResultadoComparacion(resultado, compA, compB, textoA, textoB) {
    if (!resultado) return;

    var txtA = typeof textoA === "string" ? textoA : (editorOriginal ? editorOriginal.obtenerTexto() : "");
    var txtB = typeof textoB === "string" ? textoB : (editorModificado ? editorModificado.obtenerTexto() : "");

    var estanVacios = txtA.trim() === "" && txtB.trim() === "";
    var sonIguales = resultado.sonIdenticos && !estanVacios;
    var hayDiferencias = !resultado.sonIdenticos && !estanVacios;

    // 1. Banner de idénticos: solo visible si los textos son iguales y no vacíos
    if (bannerIdenticosEl) {
      bannerIdenticosEl.classList.toggle("visible", sonIguales);
    }

    // 2. Control de visibilidad de todo el bloque inferior (paneles diff, leyenda y resumen)
    if (seccionResultadosDiffEl) {
      seccionResultadosDiffEl.style.display = hayDiferencias ? "block" : "none";
    }

    if (!hayDiferencias) {
      return;
    }

    // 3. Renderizar paneles con diferencias
    if (resultadoOriginalEl) {
      resultadoOriginalEl.innerHTML = renderizarLineasPanel(resultado.filas, "ladoA");
    }
    if (resultadoModificadoEl) {
      resultadoModificadoEl.innerHTML = renderizarLineasPanel(resultado.filas, "ladoB");
    }

    // 3. Resumen A: KPIs de diferencias
    var res = resultado.resumenDiff;
    if (kpiLineasModEl) kpiLineasModEl.textContent = res.lineasModificadas;
    if (kpiLineasDelEl) kpiLineasDelEl.textContent = res.lineasEliminadas;
    if (kpiLineasInsEl) kpiLineasInsEl.textContent = res.lineasAnadidas;

    if (kpiCharsDelEl) kpiCharsDelEl.textContent = res.charsEliminados;
    if (kpiCharsInsEl) kpiCharsInsEl.textContent = res.charsAnadidos;
    if (kpiCharsModEl) kpiCharsModEl.textContent = res.charsModificadosTotal;
    if (kpiSimilitudEl) kpiSimilitudEl.textContent = res.similitudPorcentaje + "%";

    // 4. Resumen B: Tabla de composición
    if (tablaComposicionBodyEl && compA && compB) {
      renderizarTablaComposicion(compA, compB);
    }
  }

  /**
   * Renderiza las filas de la tabla de composición comparativa.
   */
  function renderizarTablaComposicion(cA, cB) {
    var metricas = [
      { key: "totalChars", label: "Total de caracteres (con espacios)" },
      { key: "totalSinEspacios", label: "Caracteres (sin espacios)" },
      { key: "palabras", label: "Palabras" },
      { key: "lineas", label: "Líneas" },
      { key: "letras", label: "Letras (alfabéticas Unicode)" },
      { key: "mayusculas", label: "— Letras mayúsculas" },
      { key: "minusculas", label: "— Letras minúsculas" },
      { key: "digitos", label: "Dígitos numéricos" },
      { key: "espacios", label: "Espacios en blanco" },
      { key: "tabuladores", label: "Tabuladores (\\t)" },
      { key: "saltosLinea", label: "Saltos de línea (\\n)" },
      { key: "puntuacion", label: "Signos de puntuación" },
      { key: "otrosYSymbols", label: "Otros / Símbolos y emojis" }
    ];

    var html = [];

    for (var m = 0; m < metricas.length; m++) {
      var item = metricas[m];
      var vA = cA[item.key] || 0;
      var vB = cB[item.key] || 0;
      var diff = vB - vA;

      var claseDelta = "delta-cero";
      var signoDelta = "";
      if (diff > 0) {
        claseDelta = "delta-positivo";
        signoDelta = "+";
      } else if (diff < 0) {
        claseDelta = "delta-negativo";
        signoDelta = "";
      }

      var diffStr = diff === 0 ? "0" : signoDelta + diff;

      html.push(
        '<tr>' +
          '<td>' + item.label + '</td>' +
          '<td class="col-num">' + vA.toLocaleString("es-ES") + '</td>' +
          '<td class="col-num">' + vB.toLocaleString("es-ES") + '</td>' +
          '<td class="col-num ' + claseDelta + '">' + diffStr + '</td>' +
        '</tr>'
      );
    }

    tablaComposicionBodyEl.innerHTML = html.join("");
  }

  /**
   * Ejecuta la comparación completa teniendo en cuenta opciones y tamaño de texto.
   */
  function ejecutarComparacion() {
    if (!editorOriginal || !editorModificado) return;

    var textoA = editorOriginal.obtenerTexto();
    var textoB = editorModificado.obtenerTexto();

    var opciones = {
      ignorarMayusculas: chkMayusculasEl ? chkMayusculasEl.checked : false,
      ignorarEspaciosFinales: chkEspaciosFinalesEl ? chkEspaciosFinalesEl.checked : false
    };

    var tamTotal = (textoA ? textoA.length : 0) + (textoB ? textoB.length : 0);
    idComparacionActual++;
    var idActual = idComparacionActual;

    // Si los textos son grandes (> 50.000 caracteres), usar Web Worker inline
    if (tamTotal > 50000) {
      var worker = obtenerWorker();
      if (worker) {
        mostrarIndicadorCalculando();
        worker.postMessage({
          id: idActual,
          textoA: textoA,
          textoB: textoB,
          opciones: opciones
        });
        return;
      }
    }

    // Modo síncrono para textos ligeros o si los workers están deshabilitados
    ocultarIndicadorCalculando();
    var resultado = DUtilsDiffCore.compararTextos(textoA, textoB, opciones);
    var compA = DUtilsDiffCore.analizarComposicion(textoA);
    var compB = DUtilsDiffCore.analizarComposicion(textoB);

    aplicarResultadoComparacion(resultado, compA, compB, textoA, textoB);
  }

  /**
   * Programa la ejecución del diff con debounce de 150 ms para no bloquear al teclear.
   */
  function programarComparacion() {
    clearTimeout(temporizadorDebounce);
    temporizadorDebounce = setTimeout(function () {
      ejecutarComparacion();
    }, 150);
  }

  /**
   * Intercambia el contenido de ambos paneles.
   */
  function intercambiarTextos() {
    if (!editorOriginal || !editorModificado) return;
    var tA = editorOriginal.obtenerTexto();
    var tB = editorModificado.obtenerTexto();

    editorOriginal.establecerTexto(tB, true);
    editorModificado.establecerTexto(tA, true);

    reproducirSonido("accion");
    ejecutarComparacion();
  }

  /**
   * Sincroniza el scroll vertical y horizontal entre los paneles de resultados.
   */
  function vincularScrollSincronizado() {
    if (!resultadoOriginalEl || !resultadoModificadoEl) return;

    function sincronizar(origen, destino) {
      if (sincronizandoScroll) return;
      sincronizandoScroll = true;
      destino.scrollTop = origen.scrollTop;
      destino.scrollLeft = origen.scrollLeft;

      requestAnimationFrame(function () {
        sincronizandoScroll = false;
      });
    }

    resultadoOriginalEl.addEventListener("scroll", function () {
      sincronizar(resultadoOriginalEl, resultadoModificadoEl);
    });

    resultadoModificadoEl.addEventListener("scroll", function () {
      sincronizar(resultadoModificadoEl, resultadoOriginalEl);
    });
  }

  /**
   * Inicializa la herramienta al cargar el DOM.
   */
  function iniciar() {
    // 1. Obtener referencias
    resultadoOriginalEl = document.getElementById("resultado-original");
    resultadoModificadoEl = document.getElementById("resultado-modificado");
    bannerIdenticosEl = document.getElementById("banner-identicos");
    indicadorCalculandoEl = document.getElementById("indicador-calculando");
    seccionResultadosDiffEl = document.getElementById("seccion-resultados-diff");

    chkMayusculasEl = document.getElementById("chk-mayusculas");
    chkEspaciosFinalesEl = document.getElementById("chk-espacios-finales");
    btnIntercambiarEl = document.getElementById("btn-intercambiar");
    btnLimpiarAmbosEl = document.getElementById("btn-limpiar-ambos");

    kpiLineasModEl = document.getElementById("kpi-lineas-mod");
    kpiLineasDelEl = document.getElementById("kpi-lineas-del");
    kpiLineasInsEl = document.getElementById("kpi-lineas-ins");
    kpiCharsDelEl = document.getElementById("kpi-chars-del");
    kpiCharsInsEl = document.getElementById("kpi-chars-ins");
    kpiCharsModEl = document.getElementById("kpi-chars-mod");
    kpiSimilitudEl = document.getElementById("kpi-similitud");

    tablaComposicionBodyEl = document.getElementById("tabla-composicion-body");

    // 2. Instanciar los dos bloques de texto editables en la fila superior
    var hostOrig = document.getElementById("editor-original-host");
    var hostMod = document.getElementById("editor-modificado-host");

    if (hostOrig && window.DUtilsBloqueTexto) {
      editorOriginal = window.DUtilsBloqueTexto.crear({
        contenedor: hostOrig,
        id: "textarea-original",
        titulo: "Texto original",
        badge: "",
        placeholder: "Escribe o pega aquí el texto original...",
        acciones: ["pegar", "subir", "copiar", "borrar"],
        pista: "",
        valorInicial: "",
        onChange: function () {
          programarComparacion();
        }
      });
    }

    if (hostMod && window.DUtilsBloqueTexto) {
      editorModificado = window.DUtilsBloqueTexto.crear({
        contenedor: hostMod,
        id: "textarea-modificado",
        titulo: "Texto modificado",
        badge: "",
        placeholder: "Escribe o pega aquí el texto modificado...",
        acciones: ["pegar", "subir", "copiar", "borrar"],
        pista: "",
        valorInicial: "",
        onChange: function () {
          programarComparacion();
        }
      });
    }

    // 3. Eventos de controles
    if (btnLimpiarAmbosEl) {
      btnLimpiarAmbosEl.addEventListener("click", function () {
        if (editorOriginal) editorOriginal.establecerTexto("", true);
        if (editorModificado) editorModificado.establecerTexto("", true);
        reproducirSonido("borrar");
        ejecutarComparacion();
      });
    }
    if (chkMayusculasEl) {
      chkMayusculasEl.addEventListener("change", function () {
        reproducirSonido("tecleo");
        ejecutarComparacion();
      });
    }

    if (chkEspaciosFinalesEl) {
      chkEspaciosFinalesEl.addEventListener("change", function () {
        reproducirSonido("tecleo");
        ejecutarComparacion();
      });
    }

    if (btnIntercambiarEl) {
      btnIntercambiarEl.addEventListener("click", intercambiarTextos);
    }

    // 4. Vincular scroll sincronizado y sincronización de altura de paneles
    vincularScrollSincronizado();

    if (window.ResizeObserver && resultadoOriginalEl && resultadoModificadoEl) {
      var sincronizandoResize = false;
      var ro = new ResizeObserver(function (entries) {
        if (sincronizandoResize) return;
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          var nuevaAltura = entry.target.offsetHeight;
          if (nuevaAltura > 0) {
            sincronizandoResize = true;
            if (entry.target === resultadoOriginalEl) {
              resultadoModificadoEl.style.height = nuevaAltura + "px";
            } else if (entry.target === resultadoModificadoEl) {
              resultadoOriginalEl.style.height = nuevaAltura + "px";
            }
            requestAnimationFrame(function () {
              sincronizandoResize = false;
            });
          }
        }
      });
      ro.observe(resultadoOriginalEl);
      ro.observe(resultadoModificadoEl);
    }

    // 5. Primera ejecución con los datos iniciales
    ejecutarComparacion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
