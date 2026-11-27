/* =========================================================
   D-Utils · Conversor Base Abstracto (Video -> GIF)
   Define el contrato y la lógica compartida para todos los
   conversores de formato en pages/video-to-gif/converters/
   ========================================================= */
(function (global) {
  "use strict";

  var ns = (global.DUtilsVideoGif = global.DUtilsVideoGif || {});

  /**
   * Clase base abstracta para conversores de vídeo a GIF.
   * @param {Object} config
   */
  function ConversorBase(config) {
    if (this.constructor === ConversorBase) {
      throw new Error("ConversorBase es una clase abstracta y no debe instanciarse directamente.");
    }
    config = config || {};
    this.id = config.id || "base";
    this.nombre = config.nombre || "Vídeo";
    this.extensiones = config.extensiones || [];
    this.mimes = config.mimes || [];
    this.soportaAlfa = !!config.soportaAlfa;
  }

  /**
   * Comprueba si este conversor puede manejar el archivo o URL indicado.
   */
  ConversorBase.prototype.puedeManejar = function (nombreOUrl, mime) {
    var m = (mime || "").toLowerCase();
    if (m && this.mimes.some(function (x) { return m.indexOf(x) !== -1; })) {
      return true;
    }
    var limpio = (nombreOUrl || "").split("?")[0].split("#")[0].toLowerCase();
    return this.extensiones.some(function (ext) {
      return limpio.slice(-ext.length) === ext;
    });
  };

  /**
   * Calcula las dimensiones finales respetando:
   * - Solo ancho O solo alto (nunca ambos a la vez)
   * - Nunca ampliar (solo reducir respecto al tamaño original)
   */
  ConversorBase.prototype.calcularDimensiones = function (origW, origH, opciones) {
    opciones = opciones || {};
    var modo = opciones.modoDimension || "original";
    var valor = Number(opciones.valorDimension);

    if (!origW || !origH) return { ancho: 320, alto: 240 };

    if (modo === "ancho" && isFinite(valor) && valor > 0) {
      var w = Math.min(origW, Math.max(16, Math.round(valor)));
      var h = Math.max(1, Math.round(origH * (w / origW)));
      return { ancho: w, alto: h };
    }

    if (modo === "alto" && isFinite(valor) && valor > 0) {
      var altoObj = Math.min(origH, Math.max(16, Math.round(valor)));
      var anchoObj = Math.max(1, Math.round(origW * (altoObj / origH)));
      return { ancho: anchoObj, alto: altoObj };
    }

    return { ancho: origW, alto: origH };
  };

  /**
   * Calcula el intervalo de tiempo [inicio, fin].
   * Si no se indica ninguno, toma los primeros 5 segundos (o la duración total si es menor).
   */
  ConversorBase.prototype.calcularRango = function (duracion, opciones) {
    opciones = opciones || {};
    var tieneInicio = opciones.inicio !== null && opciones.inicio !== undefined && opciones.inicio !== "";
    var tieneFin = opciones.fin !== null && opciones.fin !== undefined && opciones.fin !== "";

    var inicio = 0;
    var fin = Math.min(5, duracion);

    if (tieneInicio || tieneFin) {
      inicio = tieneInicio ? Math.max(0, Number(opciones.inicio) || 0) : 0;
      if (inicio >= duracion) inicio = Math.max(0, duracion - 0.5);

      if (tieneFin) {
        fin = Math.min(duracion, Number(opciones.fin) || duracion);
      } else {
        fin = Math.min(duracion, inicio + 5);
      }

      if (fin <= inicio) {
        fin = Math.min(duracion, inicio + 0.5);
      }
    }

    return { inicio: inicio, fin: fin };
  };

  /**
   * Carga el vídeo en un elemento <video> oculto y devuelve sus metadatos.
   */
  ConversorBase.prototype.cargarVideo = function (urlFuente) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";

      var terminado = false;
      var timer = setTimeout(function () {
        if (terminado) return;
        terminado = true;
        limpiar();
        reject(new Error("Tiempo de espera agotado al cargar el vídeo (" + self.nombre + ")."));
      }, 20000);

      function limpiar() {
        clearTimeout(timer);
        video.removeEventListener("loadeddata", onListo);
        video.removeEventListener("error", onError);
      }

      function onListo() {
        if (terminado) return;
        if (!video.videoWidth || !video.videoHeight) {
          terminado = true;
          limpiar();
          reject(new Error("El archivo " + self.nombre + " no contiene pistas de vídeo decodificables por el navegador."));
          return;
        }
        terminado = true;
        limpiar();
        resolve({
          video: video,
          ancho: video.videoWidth,
          alto: video.videoHeight,
          duracion: isFinite(video.duration) && video.duration > 0 ? video.duration : 5
        });
      }

      function onError() {
        if (terminado) return;
        terminado = true;
        limpiar();
        reject(new Error(self.mensajeErrorFormato()));
      }

      video.addEventListener("loadeddata", onListo);
      video.addEventListener("error", onError);
      video.src = urlFuente;
      video.load();
    });
  };

  ConversorBase.prototype.mensajeErrorFormato = function () {
    return "Tu navegador no pudo decodificar este vídeo " + this.nombre +
      " (códec no soportado o URL bloqueada por CORS).";
  };

  /**
   * Posiciona el vídeo en un instante exacto y espera al evento seeked.
   */
  ConversorBase.prototype.irAInstante = function (video, segundos) {
    return new Promise(function (resolve) {
      if (Math.abs(video.currentTime - segundos) < 0.005) {
        resolve();
        return;
      }
      var listo = false;
      var timeout = setTimeout(function () {
        if (listo) return;
        listo = true;
        video.removeEventListener("seeked", onSeeked);
        resolve();
      }, 1500);

      function onSeeked() {
        if (listo) return;
        listo = true;
        clearTimeout(timeout);
        video.removeEventListener("seeked", onSeeked);
        resolve();
      }

      video.addEventListener("seeked", onSeeked);
      video.currentTime = segundos;
    });
  };

  /**
   * Extrae los fotogramas del vídeo en el rango [inicio, fin] al FPS indicado.
   */
  ConversorBase.prototype.extraerFotogramas = async function (infoVideo, opciones, onProgreso) {
    var video = infoVideo.video;
    var dims = this.calcularDimensiones(infoVideo.ancho, infoVideo.alto, opciones);
    var rango = this.calcularRango(infoVideo.duracion, opciones);
    var fps = Math.min(25, Math.max(1, Math.round(Number(opciones.fps) || 10)));
    var transparencia = !!(opciones.transparencia && this.soportaAlfa);
    var senal = opciones.senalCancelacion || {};

    var duracionClip = Math.max(0.1, rango.fin - rango.inicio);
    var totalFotogramas = Math.max(1, Math.round(duracionClip * fps));
    var paso = 1 / fps;
    var retardoMs = Math.round(1000 / fps);

    var canvas = document.createElement("canvas");
    canvas.width = dims.ancho;
    canvas.height = dims.alto;
    var ctx = canvas.getContext("2d", {
      alpha: transparencia,
      willReadFrequently: true
    });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    var fotogramas = [];

    for (var i = 0; i < totalFotogramas; i++) {
      if (senal.cancelado) {
        throw new Error("Conversión cancelada por el usuario.");
      }

      var tiempo = Math.min(infoVideo.duracion - 0.001, rango.inicio + i * paso);
      await this.irAInstante(video, Math.max(0, tiempo));

      if (transparencia) {
        ctx.clearRect(0, 0, dims.ancho, dims.alto);
      } else {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, dims.ancho, dims.alto);
      }

      ctx.drawImage(video, 0, 0, dims.ancho, dims.alto);
      var imgData = ctx.getImageData(0, 0, dims.ancho, dims.alto);
      fotogramas.push({
        rgba: imgData.data,
        retardoMs: retardoMs
      });

      if (onProgreso) {
        onProgreso("extrayendo", (i + 1) / totalFotogramas, i + 1, totalFotogramas);
      }
    }

    return {
      fotogramas: fotogramas,
      ancho: dims.ancho,
      alto: dims.alto,
      duracionClip: duracionClip,
      transparencia: transparencia
    };
  };

  /**
   * Flujo completo de conversión Vídeo -> GIF.
   */
  ConversorBase.prototype.convertir = async function (urlFuente, opciones, onProgreso) {
    opciones = opciones || {};
    var infoVideo = await this.cargarVideo(urlFuente);
    var extraccion = await this.extraerFotogramas(infoVideo, opciones, onProgreso);

    if (opciones.senalCancelacion && opciones.senalCancelacion.cancelado) {
      throw new Error("Conversión cancelada por el usuario.");
    }

    var blob = await ns.CodificadorGIF.codificar({
      ancho: extraccion.ancho,
      alto: extraccion.alto,
      fotogramas: extraccion.fotogramas,
      repeticiones: opciones.repeticiones,
      transparencia: extraccion.transparencia,
      onProgreso: function (frac) {
        if (onProgreso) {
          onProgreso("codificando", frac);
        }
      }
    });

    return {
      blob: blob,
      ancho: extraccion.ancho,
      alto: extraccion.alto,
      totalFotogramas: extraccion.fotogramas.length,
      duracionClip: extraccion.duracionClip,
      transparencia: extraccion.transparencia
    };
  };

  ns.ConversorBase = ConversorBase;
})(window);
