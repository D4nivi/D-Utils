/* =========================================================
   D-Utils · OCR (Extracción de texto) · Lógica de aplicación
   Motor OCR 100% en cliente con Tesseract.js (WebAssembly)
   Compatible con modelos fast y best para español e inglés
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
        // Ignorar fallos si el contexto de audio está bloqueado
      }
    }
  }

  /**
   * Obtiene un icono SVG centralizado desde el diccionario global.
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
   * Formatea el tamaño en bytes a KB o MB legibles.
   */
  function formatearTamano(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    var k = 1024;
    var dm = 1;
    var sizes = ["B", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  // Estado reactivo de la herramienta
  var estado = {
    imagenes: [], // { id, file, name, size, width, height, dataUrl, imgElement }
    idioma: "spa", // "spa", "eng", "spa+eng"
    calidad: "fast", // "fast", "best"
    psm: "6", // Page segmentation mode ("6", "3", "7", etc.)
    preprocesar: true,
    ampliar: true,
    umbral: 160,
    margen: 20,
    procesando: false,
    cancelarSolicitado: false,
    workerActivo: null,
    workerLang: null,
    workerQuality: null,
    temporizadorId: null,
    tiempoInicio: 0
  };

  var bloqueSalida = null;

  /**
   * Preprocesamiento de la imagen sobre un canvas HTML5.
   * Implementa fielmente la función preprocesar() del script de Python:
   * 1. Aplanado de canal alfa sobre fondo blanco puro.
   * 2. Escalado 2x si la altura es < 1000 px.
   * 3. Escala de grises + Autocontraste + Binarización fija (umbral 160).
   * 4. Margen perimetral blanco (20 px) para que el texto no toque bordes.
   */
  function preprocesarImagen(imgElement, opciones) {
    var opts = opciones || {};
    var aplicarPrepro = opts.preprocesar !== false;
    var aplicarAmpliar = opts.ampliar !== false;
    var margen = typeof opts.margen === "number" ? opts.margen : 20;
    var umbral = typeof opts.umbral === "number" ? opts.umbral : 160;

    var factor = (aplicarAmpliar && imgElement.naturalHeight < 1000) ? 2 : 1;
    var wEscalada = imgElement.naturalWidth * factor;
    var hEscalada = imgElement.naturalHeight * factor;

    var finalW = wEscalada + margen * 2;
    var finalH = hEscalada + margen * 2;

    var canvas = document.createElement("canvas");
    canvas.width = finalW;
    canvas.height = finalH;
    var ctx = canvas.getContext("2d", { willReadFrequently: true });

    // 1. Fondo blanco puro (aplana transparencias de PNG/WebP)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, finalW, finalH);

    // 2. Dibujar imagen escalada
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(imgElement, margen, margen, wEscalada, hEscalada);

    // 3. Autocontraste y binarización
    if (aplicarPrepro) {
      var imgData = ctx.getImageData(0, 0, finalW, finalH);
      var data = imgData.data;
      var len = data.length;

      var minLum = 255;
      var maxLum = 0;
      for (var i = 0; i < len; i += 4) {
        var lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (lum < minLum) minLum = lum;
        if (lum > maxLum) maxLum = lum;
      }

      var rango = maxLum - minLum;
      if (rango < 1) rango = 1;

      for (var j = 0; j < len; j += 4) {
        var l = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
        var norm = ((l - minLum) / rango) * 255;
        var val = norm > umbral ? 255 : 0;
        data[j] = val;
        data[j + 1] = val;
        data[j + 2] = val;
        data[j + 3] = 255;
      }

      ctx.putImageData(imgData, 0, 0);
    }

    return canvas;
  }

  /**
   * Inicialización de la interfaz de usuario.
   */
  function inicializarUI() {
    var elDrop = document.getElementById("drop");
    var elFichero = document.getElementById("fichero");
    var elCola = document.getElementById("cola-imagenes");
    var elGaleria = document.getElementById("galeria-imagenes");
    var elContadorCola = document.getElementById("contador-cola");
    var btnLimpiarCola = document.getElementById("btn-limpiar-cola");
    var btnProcesar = document.getElementById("btn-procesar");
    var btnCancelar = document.getElementById("btn-cancelar");
    var elProgresoPanel = document.getElementById("progreso-panel");
    var elProgresoEstado = document.getElementById("progreso-estado");
    var elProgresoTiempo = document.getElementById("progreso-tiempo");
    var elBarraFill = document.getElementById("barra-progreso-fill");
    var elAvisoProtocolo = document.getElementById("aviso-protocolo");
    var hostSalida = document.getElementById("host-bloque-salida") || document.getElementById("contenedor-salida");

    // Verificar si se está abriendo desde file://
    if (window.location.protocol === "file:" && elAvisoProtocolo) {
      elAvisoProtocolo.classList.remove("oculto");
    }

    // Instanciar bloque de salida reutilizable con botón copiar
    if (window.DUtilsBloqueTexto && hostSalida) {
      bloqueSalida = window.DUtilsBloqueTexto.crear({
        contenedor: hostSalida,
        id: "editor-salida",
        titulo: "Texto reconocido",
        placeholder: "El texto extraído de tus imágenes aparecerá aquí tras pulsar 'Procesar texto (OCR)'...",
        soloLectura: true,
        acciones: ["copiar"],
        pista: "Texto extraído en cliente mediante Tesseract WebAssembly"
      });
    }

    // Inyectar iconos en botones tácticos
    var elementosIcono = document.querySelectorAll(".btn-icono[data-icono]");
    elementosIcono.forEach(function (el) {
      var idIcono = el.getAttribute("data-icono");
      if (idIcono) {
        el.innerHTML = obtenerIconoSVG(idIcono);
      }
    });

    /**
     * Sincroniza la galería visual de imágenes en cola.
     */
    function actualizarGaleria() {
      if (estado.imagenes.length === 0) {
        if (elCola) elCola.style.display = "none";
        if (btnProcesar) btnProcesar.disabled = true;
        return;
      }

      if (elCola) elCola.style.display = "block";
      if (elContadorCola) {
        var n = estado.imagenes.length;
        elContadorCola.textContent = n + (n === 1 ? " imagen en cola" : " imágenes en cola");
      }
      if (btnProcesar && !estado.procesando) {
        btnProcesar.disabled = false;
      }

      if (!elGaleria) return;
      elGaleria.innerHTML = "";

      estado.imagenes.forEach(function (item, index) {
        var card = document.createElement("div");
        card.className = "ocr-tarjeta-img";

        var btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.className = "ocr-tarjeta-eliminar";
        btnEliminar.setAttribute("title", "Eliminar imagen");
        btnEliminar.innerHTML = "&times;";
        btnEliminar.addEventListener("click", function (e) {
          e.stopPropagation();
          eliminarImagen(index);
        });

        var thumb = document.createElement("div");
        thumb.className = "ocr-tarjeta-thumb";
        var img = document.createElement("img");
        img.src = item.dataUrl;
        img.alt = item.name;
        thumb.appendChild(img);

        var info = document.createElement("div");
        info.className = "ocr-tarjeta-info";

        var nombre = document.createElement("span");
        nombre.className = "ocr-tarjeta-nombre";
        nombre.textContent = item.name;
        nombre.setAttribute("title", item.name);

        var meta = document.createElement("span");
        meta.className = "ocr-tarjeta-meta";
        meta.innerHTML = '<span>' + item.width + '&times;' + item.height + '</span><span>' + formatearTamano(item.size) + '</span>';

        info.appendChild(nombre);
        info.appendChild(meta);

        card.appendChild(btnEliminar);
        card.appendChild(thumb);
        card.appendChild(info);

        elGaleria.appendChild(card);
      });
    }

    /**
     * Elimina una imagen de la cola por índice.
     */
    function eliminarImagen(index) {
      if (estado.procesando) return;
      estado.imagenes.splice(index, 1);
      reproducirSonido("click");
      actualizarGaleria();
    }

    /**
     * Agrega archivos a la cola leyendo sus dimensiones y miniaturas.
     */
    function agregarArchivos(archivos) {
      if (!archivos || archivos.length === 0) return;

      var lista = Array.from(archivos).filter(function (f) {
        return f.type.startsWith("image/");
      });

      if (lista.length === 0) {
        if (bloqueSalida) {
          bloqueSalida.mostrarToast("El archivo seleccionado no es una imagen válida", true);
        }
        return;
      }

      var procesados = 0;
      lista.forEach(function (f) {
        var reader = new FileReader();
        reader.onload = function (e) {
          var dataUrl = e.target.result;
          var img = new Image();
          img.onload = function () {
            estado.imagenes.push({
              id: "img_" + Math.random().toString(36).substring(2, 9),
              file: f,
              name: f.name,
              size: f.size,
              width: img.naturalWidth,
              height: img.naturalHeight,
              dataUrl: dataUrl,
              imgElement: img
            });
            procesados++;
            if (procesados === lista.length) {
              reproducirSonido("switch");
              actualizarGaleria();
            }
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(f);
      });
    }

    // Inicialización del componente común Dropzone
    window.DUtilsDropzone.crear({
      contenedor: elDrop,
      id: "drop",
      idInput: "fichero",
      accept: "image/jpeg,image/png,image/webp",
      multiple: true,
      texto: "Arrastra imágenes aquí o <strong>haz clic para elegirlas</strong>",
      pista: "JPG, PNG y WebP · Soporta múltiples imágenes y pegado directo con <kbd>Ctrl+V</kbd>",
      icono: "subir",
      soportaPegado: true,
      onArchivos: function (ficheros) {
        agregarArchivos(ficheros);
      }
    });

    // Botón Limpiar Cola
    if (btnLimpiarCola) {
      btnLimpiarCola.addEventListener("click", function () {
        if (estado.procesando) return;
        estado.imagenes = [];
        reproducirSonido("click");
        actualizarGaleria();
        if (bloqueSalida) {
          bloqueSalida.establecerTexto("", false);
        }
      });
    }

    // Selector de Idioma (botones tipo radio)
    var botonesIdioma = document.querySelectorAll(".btn-idioma");
    botonesIdioma.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (estado.procesando) return;
        var lang = this.getAttribute("data-idioma");
        if (!lang) return;
        estado.idioma = lang;
        botonesIdioma.forEach(function (b) {
          var activo = b === btn;
          b.classList.toggle("activo", activo);
          b.setAttribute("aria-checked", activo ? "true" : "false");
        });
        reproducirSonido("click");
      });
    });

    // Selector de Calidad (botones tipo radio)
    var botonesCalidad = document.querySelectorAll(".btn-calidad");
    botonesCalidad.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (estado.procesando) return;
        var cal = this.getAttribute("data-calidad");
        if (!cal) return;
        estado.calidad = cal;
        botonesCalidad.forEach(function (b) {
          var activo = b === btn;
          b.classList.toggle("activo", activo);
          b.setAttribute("aria-checked", activo ? "true" : "false");
        });
        reproducirSonido("click");
      });
    });

    // Selector de PSM
    var selectPsm = document.getElementById("select-psm");
    if (selectPsm) {
      selectPsm.addEventListener("change", function () {
        estado.psm = this.value;
      });
    }

    // Switches de preprocesamiento
    var checkPreprocesar = document.getElementById("check-preprocesar");
    var checkAmpliar = document.getElementById("check-ampliar");
    var inputUmbral = document.getElementById("input-umbral");
    var inputMargen = document.getElementById("input-margen");

    if (checkPreprocesar) {
      checkPreprocesar.addEventListener("change", function () {
        estado.preprocesar = this.checked;
        if (checkAmpliar) checkAmpliar.disabled = !this.checked;
        if (inputUmbral) inputUmbral.disabled = !this.checked;
        if (inputMargen) inputMargen.disabled = !this.checked;
      });
    }

    if (checkAmpliar) {
      checkAmpliar.addEventListener("change", function () {
        estado.ampliar = this.checked;
      });
    }

    if (inputUmbral) {
      inputUmbral.addEventListener("change", function () {
        var v = parseInt(this.value, 10);
        estado.umbral = isNaN(v) ? 160 : Math.max(0, Math.min(254, v));
        this.value = estado.umbral;
      });
    }

    if (inputMargen) {
      inputMargen.addEventListener("change", function () {
        var v = parseInt(this.value, 10);
        estado.margen = isNaN(v) ? 20 : Math.max(0, v);
        this.value = estado.margen;
      });
    }

    /**
     * Actualiza el HUD de progreso durante el procesamiento.
     */
    function actualizarProgreso(texto, porcentaje) {
      if (elProgresoEstado) {
        elProgresoEstado.innerHTML = '<span class="pulse-dot"></span>' + texto;
      }
      if (elBarraFill && typeof porcentaje === "number") {
        var pct = Math.max(0, Math.min(100, Math.round(porcentaje)));
        elBarraFill.style.width = pct + "%";
      }
    }

    /**
     * Inicia el temporizador de tiempo transcurrido.
     */
    function iniciarTemporizador() {
      estado.tiempoInicio = performance.now();
      if (estado.temporizadorId) clearInterval(estado.temporizadorId);
      estado.temporizadorId = setInterval(function () {
        var transcurrido = ((performance.now() - estado.tiempoInicio) / 1000).toFixed(1);
        if (elProgresoTiempo) {
          elProgresoTiempo.textContent = "Tiempo: " + transcurrido + "s";
        }
      }, 100);
    }

    /**
     * Detiene el temporizador.
     */
    function detenerTemporizador() {
      if (estado.temporizadorId) {
        clearInterval(estado.temporizadorId);
        estado.temporizadorId = null;
      }
    }

    /**
     * Cancela la ejecución actual y destruye el worker.
     */
    async function cancelarProcesamiento() {
      estado.cancelarSolicitado = true;
      actualizarProgreso("Cancelando proceso...", 0);
      if (estado.workerActivo) {
        try {
          await estado.workerActivo.terminate();
        } catch (e) {
          // Ignorar
        }
        estado.workerActivo = null;
        estado.workerLang = null;
        estado.workerQuality = null;
      }
      detenerTemporizador();
      estado.procesando = false;
      if (elProgresoPanel) elProgresoPanel.classList.add("oculto");
      if (btnProcesar) btnProcesar.disabled = false;
      if (btnCancelar) btnCancelar.style.display = "none";
      if (bloqueSalida) {
        bloqueSalida.mostrarToast("Proceso cancelado", true);
      }
    }

    if (btnCancelar) {
      btnCancelar.addEventListener("click", cancelarProcesamiento);
    }

    /**
     * Orquesta el proceso completo de reconocimiento OCR.
     */
    async function procesarOCR() {
      if (estado.imagenes.length === 0 || estado.procesando) return;

      if (typeof Tesseract === "undefined" || !Tesseract.createWorker) {
        if (bloqueSalida) {
          bloqueSalida.mostrarToast("Error: No se pudo cargar Tesseract.js", true);
        }
        return;
      }

      estado.procesando = true;
      estado.cancelarSolicitado = false;
      if (btnProcesar) btnProcesar.disabled = true;
      if (btnCancelar) btnCancelar.style.display = "inline-flex";
      if (elProgresoPanel) elProgresoPanel.classList.remove("oculto");

      iniciarTemporizador();
      reproducirSonido("click");

      var totalImgs = estado.imagenes.length;
      var resultados = [];

      try {
        // Verificar si necesitamos crear un nuevo Worker o si podemos reutilizar el existente
        var langActual = estado.idioma;
        var calidadActual = estado.calidad;
        var worker = estado.workerActivo;

        if (!worker || estado.workerLang !== langActual || estado.workerQuality !== calidadActual) {
          if (worker) {
            try {
              await worker.terminate();
            } catch (e) {
              // Ignorar
            }
          }

          actualizarProgreso("Inicializando motor WebAssembly...", 10);

          worker = await Tesseract.createWorker(langActual, 1, {
            workerPath: "./assets/worker.min.js",
            corePath: "./assets/core",
            langPath: "./assets/tessdata/" + calidadActual,
            cachePath: calidadActual,
            gzip: true,
            logger: function (m) {
              if (estado.cancelarSolicitado) return;
              if (m.status === "loading tesseract core") {
                actualizarProgreso("Cargando núcleo WASM (" + Math.round((m.progress || 0) * 100) + "%)...", (m.progress || 0) * 20);
              } else if (m.status === "loading language traineddata") {
                actualizarProgreso("Cargando modelo " + langActual + " (" + calidadActual + ")...", 20 + (m.progress || 0) * 25);
              } else if (m.status === "initializing api") {
                actualizarProgreso("Configurando parámetros del motor...", 48);
              } else if (m.status === "recognizing text") {
                // Progreso asignado dinámicamente en el bucle de imágenes
              }
            }
          });

          estado.workerActivo = worker;
          estado.workerLang = langActual;
          estado.workerQuality = calidadActual;
        }

        // Configurar modo de segmentación de página (PSM)
        await worker.setParameters({
          tessedit_pageseg_mode: String(estado.psm)
        });

        // Procesar cada imagen en la cola
        for (var i = 0; i < totalImgs; i++) {
          if (estado.cancelarSolicitado) break;

          var item = estado.imagenes[i];
          var numImg = i + 1;
          actualizarProgreso("Preprocesando imagen " + numImg + " de " + totalImgs + "...", 50 + (i / totalImgs) * 50);

          // Preprocesar con Canvas
          var canvasProcesado = preprocesarImagen(item.imgElement, {
            preprocesar: estado.preprocesar,
            ampliar: estado.ampliar,
            umbral: estado.umbral,
            margen: estado.margen
          });

          // Ejecutar reconocimiento óptico
          actualizarProgreso("Reconociendo texto en imagen " + numImg + " de " + totalImgs + "...", 50 + (i / totalImgs) * 50);

          var ret = await worker.recognize(canvasProcesado);
          var textoLimpio = (ret && ret.data && ret.data.text ? ret.data.text : "").trim();

          if (totalImgs > 1) {
            resultados.push("=== " + item.name + " ===\n" + textoLimpio + "\n");
          } else {
            resultados.push(textoLimpio);
          }
        }

        if (!estado.cancelarSolicitado) {
          actualizarProgreso("Proceso completado", 100);
          var salidaFinal = resultados.join("\n");

          if (bloqueSalida) {
            bloqueSalida.establecerTexto(salidaFinal, false);
            bloqueSalida.mostrarToast("Texto extraído con éxito", false);
          }

          reproducirSonido("success");
        }
      } catch (err) {
        console.error("Error en OCR:", err);
        if (bloqueSalida) {
          bloqueSalida.mostrarToast("Error en reconocimiento: " + (err.message || err), true);
        }
        reproducirSonido("error");
      } finally {
        detenerTemporizador();
        estado.procesando = false;
        if (btnProcesar) btnProcesar.disabled = false;
        if (btnCancelar) btnCancelar.style.display = "none";
        setTimeout(function () {
          if (!estado.procesando && elProgresoPanel) {
            elProgresoPanel.classList.add("oculto");
          }
        }, 1200);
      }
    }

    if (btnProcesar) {
      btnProcesar.addEventListener("click", procesarOCR);
    }
  }

  // Inicialización al cargar el DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarUI);
  } else {
    inicializarUI();
  }

  // Exposición pública del módulo
  window.DUtilsOCR = {
    estado: estado,
    preprocesarImagen: preprocesarImagen
  };
})();
