/* =========================================================
   D-Utils · Controlador principal de Conversor de Vídeo a GIF
   ========================================================= */
(function () {
  "use strict";

  var ns = window.DUtilsVideoGif || {};

  var estado = {
    urlFuente: null,
    esObjectUrl: false,
    nombreArchivo: "animacion",
    mime: "",
    conversor: null,
    anchoOriginal: 0,
    altoOriginal: 0,
    duracionOriginal: 0,
    modoDimension: "original",
    urlResultado: null,
    senalCancelacion: null,
    aviSinPreviewNativo: false
  };

  function $(id) {
    return document.getElementById(id);
  }

  function reproducirSonido(tipo) {
    if (window.DUtils && window.DUtils.audio && typeof window.DUtils.audio[tipo] === "function") {
      try {
        window.DUtils.audio[tipo]();
      } catch (e) { /* audio silenciado */ }
    }
  }

  function mostrarError(mensaje) {
    var caja = $("aviso-error");
    var texto = $("aviso-error-texto");
    if (!caja || !texto) return;
    if (!mensaje) {
      caja.classList.add("oculto");
      texto.textContent = "";
      return;
    }
    texto.textContent = mensaje;
    caja.classList.remove("oculto");
    reproducirSonido("error");
  }

  function formatearTamano(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function nombreBaseSinExtension(nombre) {
    var limpio = (nombre || "animacion").split("?")[0].split("#")[0];
    var partes = limpio.split("/");
    var ultimo = partes[partes.length - 1] || "animacion";
    return ultimo.replace(/\.[^.]+$/, "") || "animacion";
  }

  function liberarUrlFuente() {
    if (estado.urlFuente && estado.esObjectUrl) {
      URL.revokeObjectURL(estado.urlFuente);
    }
    estado.urlFuente = null;
    estado.esObjectUrl = false;
  }

  function liberarUrlResultado() {
    if (estado.urlResultado) {
      URL.revokeObjectURL(estado.urlResultado);
      estado.urlResultado = null;
    }
  }

  function actualizarPistaDimensiones() {
    var pista = $("pista-dimensiones");
    var inputVal = $("input-valor-dim");
    if (!pista) return;

    if (!estado.anchoOriginal || !estado.altoOriginal) {
      pista.textContent = estado.aviSinPreviewNativo
        ? "Las dimensiones se ajustarán automáticamente sin ampliar el vídeo original."
        : "Resolución de salida: —";
      return;
    }

    var valor = inputVal ? Number(inputVal.value) : 0;
    var dims = estado.conversor.calcularDimensiones(estado.anchoOriginal, estado.altoOriginal, {
      modoDimension: estado.modoDimension,
      valorDimension: valor
    });

    var nota = "";
    if (estado.modoDimension === "ancho" && valor > estado.anchoOriginal) {
      nota = " (limitado al ancho original para no ampliar)";
    } else if (estado.modoDimension === "alto" && valor > estado.altoOriginal) {
      nota = " (limitado al alto original para no ampliar)";
    }

    pista.textContent = "Resolución de salida: " + dims.ancho + " × " + dims.alto + " px" + nota;
  }

  function actualizarControlesDimension(modo) {
    estado.modoDimension = modo;
    var botones = document.querySelectorAll("[data-modo-dim]");
    for (var i = 0; i < botones.length; i++) {
      var btn = botones[i];
      var activo = btn.getAttribute("data-modo-dim") === modo;
      btn.classList.toggle("activo", activo);
      btn.setAttribute("aria-checked", activo ? "true" : "false");
    }

    var cajaVal = $("caja-valor-dim");
    var labelVal = $("label-valor-dim");
    var inputVal = $("input-valor-dim");

    if (modo === "original") {
      cajaVal.classList.add("oculto");
    } else {
      cajaVal.classList.remove("oculto");
      if (modo === "ancho") {
        labelVal.textContent = "Ancho máximo (px)";
        if (estado.anchoOriginal > 0) {
          inputVal.max = estado.anchoOriginal;
          if (!inputVal.value || Number(inputVal.value) > estado.anchoOriginal) {
            inputVal.value = Math.min(480, estado.anchoOriginal);
          }
        }
      } else {
        labelVal.textContent = "Alto máximo (px)";
        if (estado.altoOriginal > 0) {
          inputVal.max = estado.altoOriginal;
          if (!inputVal.value || Number(inputVal.value) > estado.altoOriginal) {
            inputVal.value = Math.min(360, estado.altoOriginal);
          }
        }
      }
    }

    actualizarPistaDimensiones();
  }

  function actualizarControlesTransparencia() {
    var check = $("check-transparencia");
    var pista = $("pista-transparencia");
    if (!check || !pista || !estado.conversor) return;

    if (estado.conversor.soportaAlfa) {
      check.disabled = false;
      pista.textContent = "Este formato (" + estado.conversor.nombre + ") admite canal alfa. Actívalo si tu vídeo tiene fondo transparente.";
    } else {
      check.checked = false;
      check.disabled = true;
      pista.textContent = "El formato " + estado.conversor.nombre + " no suele incluir canal alfa; la salida será opaca.";
    }
  }

  function cargarFuenteVideo(url, nombre, mime, esObjectUrl) {
    mostrarError("");
    liberarUrlFuente();
    liberarUrlResultado();
    $("panel-resultado").classList.add("oculto");

    estado.urlFuente = url;
    estado.esObjectUrl = !!esObjectUrl;
    estado.nombreArchivo = nombreBaseSinExtension(nombre);
    estado.mime = mime || "";
    estado.conversor = ns.RegistroConversores.obtenerPara(nombre, mime);
    estado.aviSinPreviewNativo = false;

    var video = $("video-preview");
    var badge = $("badge-formato");
    var info = $("info-origen");

    badge.textContent = estado.conversor.nombre + (estado.conversor.soportaAlfa ? " · ALFA" : "");
    info.textContent = "Cargando metadatos...";

    // Reiniciar inputs de tiempo
    $("input-inicio").value = "";
    $("input-fin").value = "";
    actualizarControlesTransparencia();

    video.onloadedmetadata = function () {
      estado.anchoOriginal = video.videoWidth || 0;
      estado.altoOriginal = video.videoHeight || 0;
      estado.duracionOriginal = isFinite(video.duration) && video.duration > 0 ? video.duration : 5;

      info.textContent = estado.anchoOriginal + " × " + estado.altoOriginal + " px · " + estado.duracionOriginal.toFixed(1) + " s";
      $("input-inicio").max = estado.duracionOriginal.toFixed(1);
      $("input-fin").max = estado.duracionOriginal.toFixed(1);
      $("input-fin").placeholder = Math.min(5, estado.duracionOriginal).toFixed(1);

      actualizarControlesDimension(estado.modoDimension);
      $("panel-editor").classList.remove("oculto");
      reproducirSonido("accion");
    };

    video.onerror = function () {
      if (estado.conversor && estado.conversor.id === "avi") {
        // Permitir continuar para intentar el demuxer RIFF/MJPEG en JS puro
        estado.aviSinPreviewNativo = true;
        estado.anchoOriginal = 0;
        estado.altoOriginal = 0;
        estado.duracionOriginal = 0;
        info.textContent = "AVI (sin vista previa nativa; se intentará decodificar MJPEG)";
        actualizarControlesDimension(estado.modoDimension);
        $("panel-editor").classList.remove("oculto");
        return;
      }
      $("panel-editor").classList.add("oculto");
      mostrarError(estado.conversor ? estado.conversor.mensajeErrorFormato() : "No se pudo cargar el vídeo.");
    };

    video.src = url;
    video.load();
  }

  async function iniciarConversion() {
    if (!estado.urlFuente || !estado.conversor) return;
    mostrarError("");

    var btnConvertir = $("btn-convertir");
    var btnCancelar = $("btn-cancelar");
    var cajaProgreso = $("barra-progreso-caja");
    var relleno = $("progreso-relleno");
    var txtProgreso = $("progreso-texto");
    var txtPorcentaje = $("progreso-porcentaje");

    var senal = { cancelado: false };
    estado.senalCancelacion = senal;

    btnConvertir.disabled = true;
    btnCancelar.classList.remove("oculto");
    cajaProgreso.classList.remove("oculto");
    relleno.style.width = "0%";
    txtPorcentaje.textContent = "0%";
    txtProgreso.textContent = "Preparando extracción de fotogramas...";

    var opciones = {
      inicio: $("input-inicio").value,
      fin: $("input-fin").value,
      modoDimension: estado.modoDimension,
      valorDimension: $("input-valor-dim").value,
      fps: $("input-fps").value,
      repeticiones: $("input-repeticiones").value,
      transparencia: $("check-transparencia").checked,
      senalCancelacion: senal
    };

    try {
      var resultado = await estado.conversor.convertir(estado.urlFuente, opciones, function (fase, frac, actual, total) {
        var porcentajeGlobal = fase === "extrayendo"
          ? Math.round(frac * 50)
          : Math.round(50 + frac * 50);

        relleno.style.width = porcentajeGlobal + "%";
        txtPorcentaje.textContent = porcentajeGlobal + "%";

        if (fase === "extrayendo") {
          txtProgreso.textContent = "Extrayendo fotogramas (" + actual + "/" + total + ")...";
        } else {
          txtProgreso.textContent = "Codificando GIF89a...";
        }
      });

      liberarUrlResultado();
      estado.urlResultado = URL.createObjectURL(resultado.blob);

      $("img-resultado-gif").src = estado.urlResultado;
      $("res-dims").textContent = resultado.ancho + " × " + resultado.alto + " px";
      $("res-frames").textContent = resultado.totalFotogramas + " fotogramas";
      $("res-peso").textContent = formatearTamano(resultado.blob.size);

      var btnDescarga = $("btn-descargar-gif");
      btnDescarga.href = estado.urlResultado;
      btnDescarga.download = estado.nombreArchivo + ".gif";

      $("panel-resultado").classList.remove("oculto");
      $("panel-resultado").scrollIntoView({ behavior: "smooth", block: "nearest" });
      reproducirSonido("exito");
    } catch (err) {
      if (!senal.cancelado) {
        mostrarError(err && err.message ? err.message : "Error inesperado al convertir el vídeo.");
      }
    } finally {
      btnConvertir.disabled = false;
      btnCancelar.classList.add("oculto");
      cajaProgreso.classList.add("oculto");
      estado.senalCancelacion = null;
    }
  }

  function limpiarTodo() {
    if (estado.senalCancelacion) {
      estado.senalCancelacion.cancelado = true;
    }
    liberarUrlFuente();
    liberarUrlResultado();
    var video = $("video-preview");
    if (video) {
      video.removeAttribute("src");
      video.load();
    }
    $("panel-editor").classList.add("oculto");
    $("panel-resultado").classList.add("oculto");
    $("input-url-video").value = "";
    mostrarError("");
  }

  function inicializar() {
    if (window.DUtilsDropzone) {
      window.DUtilsDropzone.crear({
        contenedor: "#drop-video",
        id: "drop-video",
        idInput: "input-video-file",
        accept: ".mp4,.webm,.avi,.mov,.flv,.wmv,.mkv,.ogv,.m4v,video/*",
        multiple: false,
        icono: "subir",
        texto: "Arrastra un vídeo aquí o <strong>haz clic para elegirlo</strong>",
        pista: "MP4, WebM (con alfa), AVI, MOV, FLV, WMV · 100% en tu navegador",
        ariaLabel: "Seleccionar o soltar archivo de vídeo",
        onArchivos: function (archivos) {
          if (!archivos || !archivos.length) return;
          var archivo = archivos[0];
          var urlObj = URL.createObjectURL(archivo);
          cargarFuenteVideo(urlObj, archivo.name, archivo.type, true);
        },
        onError: function (msg) {
          mostrarError(msg);
        }
      });
    }

    // Cargar desde URL remota
    $("btn-cargar-url").addEventListener("click", function () {
      var url = ($("input-url-video").value || "").trim();
      if (!url) {
        mostrarError("Introduce una URL de vídeo válida.");
        return;
      }
      cargarFuenteVideo(url, url, "", false);
    });

    $("input-url-video").addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") {
        ev.preventDefault();
        $("btn-cargar-url").click();
      }
    });

    // Botones de tiempo rápido desde el reproductor
    $("btn-marcar-inicio").addEventListener("click", function () {
      var t = $("video-preview").currentTime || 0;
      $("input-inicio").value = t.toFixed(1);
    });

    $("btn-marcar-fin").addEventListener("click", function () {
      var t = $("video-preview").currentTime || 0;
      $("input-fin").value = t.toFixed(1);
    });

    $("btn-cambiar-video").addEventListener("click", function () {
      var inputFile = $("input-video-file");
      if (inputFile) inputFile.click();
    });

    // Selector de modo de dimensiones (ancho O alto, nunca ambos)
    var botonesDim = document.querySelectorAll("[data-modo-dim]");
    for (var i = 0; i < botonesDim.length; i++) {
      botonesDim[i].addEventListener("click", function () {
        actualizarControlesDimension(this.getAttribute("data-modo-dim"));
      });
    }

    $("input-valor-dim").addEventListener("input", function () {
      actualizarPistaDimensiones();
    });

    // Sincronizar FPS (1 - 25)
    $("rango-fps").addEventListener("input", function () {
      $("input-fps").value = this.value;
    });

    $("input-fps").addEventListener("input", function () {
      var v = Math.min(25, Math.max(1, Math.round(Number(this.value) || 10)));
      $("rango-fps").value = v;
    });

    $("input-fps").addEventListener("blur", function () {
      var v = Math.min(25, Math.max(1, Math.round(Number(this.value) || 10)));
      this.value = v;
      $("rango-fps").value = v;
    });

    // Conversión y cancelación
    $("btn-convertir").addEventListener("click", iniciarConversion);
    $("btn-cancelar").addEventListener("click", function () {
      if (estado.senalCancelacion) {
        estado.senalCancelacion.cancelado = true;
      }
    });

    $("btn-limpiar-todo").addEventListener("click", limpiarTodo);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializar);
  } else {
    inicializar();
  }
})();
