/* =========================================================
   D-Utils · Conversor AVI a GIF
   Intenta decodificación nativa y, si falla, incluye un demuxer
   RIFF/MJPEG en JavaScript puro para archivos AVI-MJPEG.
   ========================================================= */
(function (global) {
  "use strict";

  var ns = (global.DUtilsVideoGif = global.DUtilsVideoGif || {});
  var Base = ns.ConversorBase;

  function ConversorAVI() {
    Base.call(this, {
      id: "avi",
      nombre: "AVI",
      extensiones: [".avi"],
      mimes: ["video/x-msvideo", "video/avi", "video/msvideo"],
      soportaAlfa: false
    });
  }

  ConversorAVI.prototype = Object.create(Base.prototype);
  ConversorAVI.prototype.constructor = ConversorAVI;

  function leerFourCC(vista, offset) {
    return String.fromCharCode(
      vista.getUint8(offset),
      vista.getUint8(offset + 1),
      vista.getUint8(offset + 2),
      vista.getUint8(offset + 3)
    );
  }

  /**
   * Extrae fotogramas JPEG de un contenedor AVI (MJPEG) mediante análisis RIFF.
   */
  ConversorAVI.prototype.extraerMJPEGDesdeRIFF = async function (urlFuente, opciones, onProgreso) {
    var resp = await fetch(urlFuente);
    if (!resp.ok) throw new Error("No se pudo leer el archivo AVI.");
    var buffer = await resp.arrayBuffer();
    var vista = new DataView(buffer);

    if (buffer.byteLength < 12 || leerFourCC(vista, 0) !== "RIFF" || leerFourCC(vista, 8) !== "AVI ") {
      throw new Error("El archivo no tiene una cabecera RIFF/AVI válida.");
    }

    var fpsOrig = 24;
    var chunksVideo = [];
    var pos = 12;

    function recorrerLista(inicio, fin) {
      var p = inicio;
      while (p + 8 <= fin) {
        var id = leerFourCC(vista, p);
        var tam = vista.getUint32(p + 4, true);
        var datosInicio = p + 8;
        var datosFin = Math.min(fin, datosInicio + tam);

        if (id === "avih" && tam >= 4) {
          var microSeg = vista.getUint32(datosInicio, true);
          if (microSeg > 0) fpsOrig = Math.max(1, Math.round(1000000 / microSeg));
        } else if (id === "LIST" && tam >= 4) {
          recorrerLista(datosInicio + 4, datosFin);
        } else if (id.slice(2) === "dc" || id.slice(2) === "db") {
          // Comprobar firma JPEG (0xFF 0xD8)
          if (tam > 4 && vista.getUint8(datosInicio) === 0xff && vista.getUint8(datosInicio + 1) === 0xd8) {
            chunksVideo.push(new Uint8Array(buffer, datosInicio, tam));
          }
        }

        p = datosInicio + tam + (tam & 1);
      }
    }

    recorrerLista(12, buffer.byteLength);

    if (chunksVideo.length === 0) {
      throw new Error("Este archivo AVI no usa códec MJPEG y tu navegador no puede decodificar su códec de vídeo de forma nativa.");
    }

    var duracion = chunksVideo.length / fpsOrig;
    var rango = this.calcularRango(duracion, opciones);
    var fps = Math.min(25, Math.max(1, Math.round(Number(opciones.fps) || 10)));
    var retardoMs = Math.round(1000 / fps);
    var duracionClip = Math.max(0.1, rango.fin - rango.inicio);
    var totalSalida = Math.max(1, Math.round(duracionClip * fps));

    var primerBlob = new Blob([chunksVideo[0]], { type: "image/jpeg" });
    var primerBmp = await createImageBitmap(primerBlob);
    var dims = this.calcularDimensiones(primerBmp.width, primerBmp.height, opciones);
    primerBmp.close();

    var canvas = document.createElement("canvas");
    canvas.width = dims.ancho;
    canvas.height = dims.alto;
    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    var fotogramas = [];
    for (var i = 0; i < totalSalida; i++) {
      if (opciones.senalCancelacion && opciones.senalCancelacion.cancelado) {
        throw new Error("Conversión cancelada por el usuario.");
      }
      var t = rango.inicio + i / fps;
      var idxOrig = Math.min(chunksVideo.length - 1, Math.floor(t * fpsOrig));
      var bmp = await createImageBitmap(new Blob([chunksVideo[idxOrig]], { type: "image/jpeg" }));
      ctx.drawImage(bmp, 0, 0, dims.ancho, dims.alto);
      bmp.close();

      fotogramas.push({
        rgba: ctx.getImageData(0, 0, dims.ancho, dims.alto).data,
        retardoMs: retardoMs
      });

      if (onProgreso) {
        onProgreso("extrayendo", (i + 1) / totalSalida, i + 1, totalSalida);
      }
    }

    return {
      fotogramas: fotogramas,
      ancho: dims.ancho,
      alto: dims.alto,
      duracionClip: duracionClip,
      transparencia: false
    };
  };

  ConversorAVI.prototype.convertir = async function (urlFuente, opciones, onProgreso) {
    opciones = opciones || {};
    try {
      return await Base.prototype.convertir.call(this, urlFuente, opciones, onProgreso);
    } catch (errNativo) {
      // Fallback: intentar demuxer MJPEG RIFF en JS puro
      var extraccion = await this.extraerMJPEGDesdeRIFF(urlFuente, opciones, onProgreso);
      var blob = await ns.CodificadorGIF.codificar({
        ancho: extraccion.ancho,
        alto: extraccion.alto,
        fotogramas: extraccion.fotogramas,
        repeticiones: opciones.repeticiones,
        transparencia: false,
        onProgreso: function (frac) {
          if (onProgreso) onProgreso("codificando", frac);
        }
      });
      return {
        blob: blob,
        ancho: extraccion.ancho,
        alto: extraccion.alto,
        totalFotogramas: extraccion.fotogramas.length,
        duracionClip: extraccion.duracionClip,
        transparencia: false
      };
    }
  };

  ns.ConversorAVI = ConversorAVI;
})(window);
