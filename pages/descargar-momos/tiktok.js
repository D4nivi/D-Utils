/* =========================================================
   D-Utils · Descargar momos · Módulo TikTok (tiktok.js)
   Validación de URLs, extracción vía TikWM API (HD/SD/Audio)
   ========================================================= */
(function () {
  "use strict";

  window.DUtilsTikTok = {
    id: "tiktok",
    nombre: "TikTok",
    iconoBoton: "red-tiktok",
    placeholder: "Pega el enlace de TikTok (ej. https://www.tiktok.com/@usuario/video/...)",

    /**
     * Valida si una URL corresponde a un video o publicación de TikTok
     * @param {string} url - URL ingresada
     * @returns {{ valido: boolean, urlNormalizada: string, error?: string }}
     */
    validarUrl: function (url) {
      if (!url || typeof url !== "string") {
        return { valido: false, urlNormalizada: "", error: "Introduce un enlace de TikTok." };
      }
      var limpia = (window.DUtilsDescargaComun && window.DUtilsDescargaComun.limpiarUrl)
        ? window.DUtilsDescargaComun.limpiarUrl(url)
        : url.trim();

      // Formatos soportados:
      // https://www.tiktok.com/@usuario/video/1234567890
      // https://vt.tiktok.com/ABC123xyz/
      // https://vm.tiktok.com/ABC123xyz/
      // https://m.tiktok.com/v/1234567890.html
      var regex = /https?:\/\/(?:(?:www\.|vt\.|vm\.|m\.)?tiktok\.com)\/(?:@[a-zA-Z0-9_.-]+\/video\/\d+|[a-zA-Z0-9_-]+(?:\/)?|v\/\d+\.html)/i;
      var match = limpia.match(regex);

      if (!match) {
        return {
          valido: false,
          urlNormalizada: limpia,
          error: "El formato de URL no es un enlace válido de TikTok. Ejemplo: https://www.tiktok.com/@usuario/video/1234567890"
        };
      }

      return {
        valido: true,
        urlNormalizada: limpia
      };
    },

    /**
     * Obtiene los medios multimedia del TikTok vía TikWM API
     * @param {string} url - URL del video
     * @returns {Promise<Object>} Datos del video, carátula y opciones de calidad
     */
    obtenerMedios: function (url) {
      var self = this;
      var validacion = this.validarUrl(url);
      if (!validacion.valido) {
        return Promise.reject(new Error(validacion.error));
      }

      var urlNormal = validacion.urlNormalizada;
      var apiUrl = "https://www.tikwm.com/api/?url=" + encodeURIComponent(urlNormal) + "&hd=1";

      return fetch(apiUrl, { mode: "cors" })
        .then(function (res) {
          if (!res.ok) {
            throw new Error("No se pudo conectar con el servidor de TikTok (HTTP " + res.status + ").");
          }
          return res.json();
        })
        .then(function (resData) {
          if (!resData || resData.code !== 0 || !resData.data) {
            var msg = (resData && resData.msg) ? resData.msg : "Error al procesar el enlace de TikTok.";
            throw new Error(msg);
          }

          var d = resData.data;
          var videoId = d.id || ("tiktok_" + Date.now());
          var titulo = d.title || "Momo de TikTok";

          var autor = {
            nombre: (d.author && d.author.nickname) || "Usuario de TikTok",
            handle: (d.author && d.author.unique_id) ? "@" + d.author.unique_id : "@tiktok",
            avatar: (d.author && d.author.avatar) || ""
          };

          var caratula = d.cover || d.origin_cover || "";
          var duracionSegs = d.duration || 0;
          var duracionTexto = (window.DUtilsDescargaComun && window.DUtilsDescargaComun.formatearDuracion)
            ? window.DUtilsDescargaComun.formatearDuracion(duracionSegs)
            : (duracionSegs + "s");

          var opciones = [];

          // Caso fotos / carrusel (slides)
          if (Array.isArray(d.images) && d.images.length > 0) {
            d.images.forEach(function (imgUrl, idx) {
              opciones.push({
                id: "foto_" + (idx + 1),
                etiqueta: "Descargar Imagen #" + (idx + 1),
                formato: "JPG",
                resolucion: "HD Original",
                url: imgUrl,
                nombreSugerido: "tiktok_" + videoId + "_slide" + (idx + 1) + ".jpg",
                esPrimario: idx === 0,
                icono: "imagen"
              });
            });
          } else {
            // Caso Vídeo
            // 1. HD sin marca de agua
            if (d.hdplay) {
              opciones.push({
                id: "hd",
                etiqueta: "Vídeo HD sin marca de agua",
                formato: "MP4",
                resolucion: "1080p / 720p (HD)",
                url: d.hdplay,
                nombreSugerido: "tiktok_" + videoId + "_hd.mp4",
                esPrimario: true,
                icono: "descarga"
              });
            }

            // 2. Calidad estándar sin marca de agua
            if (d.play) {
              opciones.push({
                id: "sd",
                etiqueta: d.hdplay ? "Vídeo Estándar sin marca" : "Vídeo sin marca de agua",
                formato: "MP4",
                resolucion: "Original",
                url: d.play,
                nombreSugerido: "tiktok_" + videoId + "_sd.mp4",
                esPrimario: !d.hdplay,
                icono: "descarga"
              });
            }

            // 3. Con marca de agua (si el usuario la requiere)
            if (d.wmplay) {
              opciones.push({
                id: "wm",
                etiqueta: "Vídeo con marca de agua",
                formato: "MP4",
                resolucion: "TikTok Stamp",
                url: d.wmplay,
                nombreSugerido: "tiktok_" + videoId + "_watermark.mp4",
                esPrimario: false,
                icono: "descarga"
              });
            }
          }

          // 4. Audio original (MP3)
          if (d.music) {
            opciones.push({
              id: "audio",
              etiqueta: "Pista de Audio (MP3)",
              formato: "MP3",
              resolucion: (d.music_info && d.music_info.title) || "Audio Original",
              url: d.music,
              nombreSugerido: "tiktok_" + videoId + "_audio.mp3",
              esPrimario: false,
              icono: "musica"
            });
          }

          // 5. Carátula
          if (caratula) {
            opciones.push({
              id: "caratula",
              etiqueta: "Carátula del Vídeo",
              formato: "JPG",
              resolucion: "Miniatura HD",
              url: caratula,
              nombreSugerido: "tiktok_" + videoId + "_cover.jpg",
              esPrimario: false,
              icono: "imagen"
            });
          }

          return {
            red: "tiktok",
            id: videoId,
            titulo: titulo,
            tipo: (d.images && d.images.length) ? "imagen" : "video",
            duracion: duracionTexto,
            autor: autor,
            fecha: "Disponible",
            caratula: caratula,
            previewUrl: d.play || d.hdplay || caratula,
            opciones: opciones,
            urlOriginal: urlNormal
          };
        })
        .catch(function (err) {
          // Fallback a extractor alternativo si la API está caída
          return self.fallbackTikTok(urlNormal, err.message);
        });
    },

    /**
     * Fallback cuando la API primaria no responde
     */
    fallbackTikTok: function (urlOriginal, errorPrevio) {
      var ssstikUrl = "https://ssstik.io/es?url=" + encodeURIComponent(urlOriginal);
      var snaptikUrl = "https://snaptik.app/es?url=" + encodeURIComponent(urlOriginal);

      return {
        red: "tiktok",
        id: "tiktok_fallback",
        titulo: "Publicación de TikTok",
        tipo: "video",
        autor: {
          nombre: "TikTok Creator",
          handle: "@tiktok",
          avatar: ""
        },
        fecha: "Reciente",
        caratula: "",
        previewUrl: "",
        aviso: "Servidor de extracción directa ocupado. Se generaron accesos directos de respaldo:",
        opciones: [
          {
            id: "fallback_ssstik",
            etiqueta: "Abrir en Extractor SSSTik",
            formato: "MP4 / HD",
            resolucion: "Sin marca de agua",
            url: ssstikUrl,
            nombreSugerido: "tiktok_momo.mp4",
            esPrimario: true,
            icono: "descarga",
            esEnlaceExterno: true
          },
          {
            id: "fallback_snaptik",
            etiqueta: "Abrir en Extractor SnapTik",
            formato: "MP4 / HD",
            resolucion: "HD Original",
            url: snaptikUrl,
            nombreSugerido: "tiktok_momo.mp4",
            esPrimario: false,
            icono: "enlace",
            esEnlaceExterno: true
          }
        ],
        urlOriginal: urlOriginal
      };
    }
  };
})();
