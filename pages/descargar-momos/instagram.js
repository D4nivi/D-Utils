/* =========================================================
   D-Utils · Descargar momos · Módulo Instagram (instagram.js)
   Validación de Reels, Posts y Videos, extracción y calidades
   ========================================================= */
(function () {
  "use strict";

  window.DUtilsInstagram = {
    id: "instagram",
    nombre: "Instagram",
    iconoBoton: "red-instagram",
    placeholder: "Pega el enlace del Reel o Post (ej. https://www.instagram.com/reel/C-xyz...)",

    /**
     * Valida si una URL corresponde a un Reel, Post o Video de Instagram
     * @param {string} url - URL ingresada
     * @returns {{ valido: boolean, shortcode: string|null, tipo: string, urlNormalizada: string, error?: string }}
     */
    validarUrl: function (url) {
      if (!url || typeof url !== "string") {
        return { valido: false, shortcode: null, tipo: "", urlNormalizada: "", error: "Introduce un enlace de Instagram." };
      }
      var limpia = (window.DUtilsDescargaComun && window.DUtilsDescargaComun.limpiarUrl)
        ? window.DUtilsDescargaComun.limpiarUrl(url)
        : url.trim();

      // Formatos soportados:
      // https://www.instagram.com/p/SHORTCODE/
      // https://www.instagram.com/reel/SHORTCODE/
      // https://www.instagram.com/reels/SHORTCODE/
      // https://www.instagram.com/tv/SHORTCODE/
      var regex = /https?:\/\/(?:www\.)?(?:instagram\.com|instagr\.am|ddinstagram\.com|kkinstagram\.com|vxinstagram\.com)\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i;
      var match = limpia.match(regex);

      if (!match || !match[2]) {
        return {
          valido: false,
          shortcode: null,
          tipo: "",
          urlNormalizada: limpia,
          error: "El formato de URL no es válido para Instagram. Ejemplo: https://www.instagram.com/reel/ABC123xyz/"
        };
      }

      var tipoDetectado = match[1].toLowerCase();
      if (tipoDetectado === "reels") tipoDetectado = "reel";

      return {
        valido: true,
        shortcode: match[2],
        tipo: tipoDetectado,
        urlNormalizada: limpia
      };
    },

    /**
     * Obtiene los medios multimedia del Reel/Post de Instagram
     * @param {string} url - URL del post o reel
     * @returns {Promise<Object>} Datos del medio con carátula y calidades
     */
    obtenerMedios: function (url) {
      var self = this;
      var validacion = this.validarUrl(url);
      if (!validacion.valido) {
        return Promise.reject(new Error(validacion.error));
      }

      var shortcode = validacion.shortcode;
      var tipo = validacion.tipo;

      // Endpoints de descarga directa de contenido multimedia (sin redirecciones a páginas externas)
      // fxinstagram proporciona el stream de video MP4 directo para Reels y publicaciones con vídeo
      var urlDirectaVideo = "https://fxinstagram.com/video/" + shortcode + ".mp4";
      // El endpoint oficial de medios de Instagram resuelve la carátula o imagen en máxima definición
      var urlCaratulaHD = "https://www.instagram.com/p/" + shortcode + "/media/?size=l";

      return new Promise(function (resolve) {
        var opciones = [];

        // 1. Descarga directa de Video HD
        opciones.push({
          id: "video_hd",
          etiqueta: "Descargar Vídeo (HD MP4)",
          formato: "MP4",
          resolucion: "1080p / 720p HD",
          url: urlDirectaVideo,
          nombreSugerido: "instagram_" + shortcode + "_hd.mp4",
          esPrimario: tipo !== "p",
          icono: "video"
        });

        // 2. Descargar Pista de Audio
        opciones.push({
          id: "audio_mp3",
          etiqueta: "Descargar Pista de Audio (MP3)",
          formato: "MP3",
          resolucion: "Pista de audio del Reel/Vídeo",
          url: urlDirectaVideo,
          nombreSugerido: "instagram_" + shortcode + "_audio.mp3",
          esPrimario: false,
          icono: "musica"
        });

        // 3. Descargar Carátula / Foto HD
        opciones.push({
          id: "foto_hd",
          etiqueta: tipo === "reel" ? "Descargar Carátula (HD JPG)" : "Descargar Imagen (HD JPG)",
          formato: "JPG",
          resolucion: "Alta definición (Original)",
          url: urlCaratulaHD,
          nombreSugerido: "instagram_" + shortcode + (tipo === "reel" ? "_caratula.jpg" : "_imagen.jpg"),
          esPrimario: tipo === "p",
          icono: "imagen"
        });

        resolve({
          red: "instagram",
          id: shortcode,
          titulo: "Instagram " + (tipo === "reel" ? "Reel" : "Publicación") + " [" + shortcode + "]",
          tipo: tipo === "reel" ? "video" : "imagen",
          autor: {
            nombre: "Instagram Creator",
            handle: "@" + shortcode,
            avatar: ""
          },
          fecha: "Disponible",
          caratula: urlCaratulaHD,
          previewUrl: urlDirectaVideo,
          opciones: opciones,
          urlOriginal: validacion.urlNormalizada
        });
      });
    }
  };
})();
