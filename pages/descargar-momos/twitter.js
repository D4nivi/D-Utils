/* =========================================================
   D-Utils · Descargar momos · Módulo Twitter / X (twitter.js)
   Validación de URLs, extracción vía vxtwitter/fxtwitter y calidades
   ========================================================= */
(function () {
  "use strict";

  window.DUtilsTwitter = {
    id: "twitter",
    nombre: "Twitter / X",
    iconoBoton: "red-x",
    placeholder: "Pega el enlace del tweet / momo (ej. https://x.com/usuario/status/123456789...)",

    /**
     * Valida si una URL corresponde a un post/tweet de Twitter o X
     * @param {string} url - URL ingresada
     * @returns {{ valido: boolean, tweetId: string|null, urlNormalizada: string, error?: string }}
     */
    validarUrl: function (url) {
      if (!url || typeof url !== "string") {
        return { valido: false, tweetId: null, urlNormalizada: "", error: "Introduce un enlace de Twitter o X." };
      }
      var limpia = (window.DUtilsDescargaComun && window.DUtilsDescargaComun.limpiarUrl)
        ? window.DUtilsDescargaComun.limpiarUrl(url)
        : url.trim();

      // Expresión regular que captura status con o sin usuario, en dominios twitter.com, x.com, fixupx, etc.
      var regex = /https?:\/\/(?:(?:www\.|mobile\.)?(?:twitter\.com|x\.com|fixupx\.com|vxtwitter\.com|fxtwitter\.com))\/(?:(?:[a-zA-Z0-9_]+)\/)?status\/(\d+)/i;
      var match = limpia.match(regex);

      if (!match || !match[1]) {
        return {
          valido: false,
          tweetId: null,
          urlNormalizada: limpia,
          error: "El formato de URL no es un enlace válido de Twitter/X. Ejemplo: https://x.com/nombre/status/123456789"
        };
      }

      return {
        valido: true,
        tweetId: match[1],
        urlNormalizada: limpia
      };
    },

    /**
     * Obtiene los medios multimedia (video, fotos, gifs, audio, carátula) del tweet
     * @param {string} url - URL del tweet
     * @returns {Promise<Object>} Datos del medio con carátula y calidades
     */
    obtenerMedios: function (url) {
      var self = this;
      var validacion = this.validarUrl(url);
      if (!validacion.valido) {
        return Promise.reject(new Error(validacion.error));
      }

      var tweetId = validacion.tweetId;
      var apiUrlVx = "https://api.vxtwitter.com/Twitter/status/" + tweetId;

      return fetch(apiUrlVx, { mode: "cors" })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function (data) {
          if (!data || data.hasMedia === false) {
            throw new Error("No media");
          }
          return self.procesarDatosVx(data, tweetId, validacion.urlNormalizada);
        })
        .catch(function () {
          // Intento 2: Probar endpoint de FixTweet
          var apiUrlFx = "https://api.fxtwitter.com/i/status/" + tweetId;
          return fetch(apiUrlFx, { mode: "cors" })
            .then(function (res) {
              if (!res.ok) throw new Error("HTTP " + res.status);
              return res.json();
            })
            .then(function (dataFx) {
              if (dataFx && dataFx.code === 200 && dataFx.tweet) {
                return self.procesarDatosFx(dataFx.tweet, tweetId, validacion.urlNormalizada);
              }
              throw new Error("FixTweet no retornó medios");
            })
            .catch(function () {
              // Intento 3: Generar opciones directas de alta velocidad (sin páginas externas)
              return self.generarOpcionesDirectas(tweetId, validacion.urlNormalizada);
            });
        });
    },

    /**
     * Procesa la respuesta de vxTwitter
     */
    procesarDatosVx: function (data, tweetId, urlOriginal) {
      var autor = {
        nombre: data.user_name || "Usuario de X",
        handle: data.user_screen_name ? "@" + data.user_screen_name : "@usuario",
        avatar: data.user_profile_image_url || ""
      };
      var texto = data.text || "Momo de Twitter / X";
      var mediosExt = Array.isArray(data.media_extended) ? data.media_extended : [];
      var mediosUrls = Array.isArray(data.mediaURLs) ? data.mediaURLs : [];

      var videos = mediosExt.filter(function (m) {
        return m.type === "video" || m.type === "gif";
      });

      var opciones = [];
      var caratula = "";
      var tipoPrincipal = "video";

      if (videos.length > 0) {
        var v = videos[0];
        tipoPrincipal = v.type === "gif" ? "gif" : "video";
        caratula = v.thumbnail_url || (v.size && v.size.thumbnail_url) || ("https://d.fxtwitter.com/i/status/" + tweetId + ".jpg");

        // 1. Video HD
        opciones.push({
          id: "video_hd",
          etiqueta: tipoPrincipal === "gif" ? "Descargar GIF (MP4)" : "Descargar Vídeo (HD MP4)",
          formato: "MP4",
          resolucion: (v.size && v.size.width) ? (v.size.width + "x" + v.size.height) : "1080p / 720p HD",
          url: v.url,
          nombreSugerido: "twitter_" + tweetId + (tipoPrincipal === "gif" ? "_gif.mp4" : "_hd.mp4"),
          esPrimario: true,
          icono: "descarga"
        });

        // 2. Opción de audio
        if (tipoPrincipal !== "gif") {
          opciones.push({
            id: "audio_mp3",
            etiqueta: "Descargar Pista de Audio (MP3)",
            formato: "MP3",
            resolucion: "Audio Original",
            url: v.url,
            nombreSugerido: "twitter_" + tweetId + "_audio.mp3",
            esPrimario: false,
            icono: "musica"
          });
        }

        // 3. Carátula
        opciones.push({
          id: "caratula_jpg",
          etiqueta: "Descargar Carátula (HD JPG)",
          formato: "JPG",
          resolucion: "Miniatura Original",
          url: caratula,
          nombreSugerido: "twitter_" + tweetId + "_caratula.jpg",
          esPrimario: false,
          icono: "imagen"
        });
      } else {
        // Fotos / Imágenes
        var fotos = mediosExt.filter(function (m) { return m.type === "image"; });
        if (fotos.length === 0 && mediosUrls.length > 0) {
          mediosUrls.forEach(function (u) { fotos.push({ url: u }); });
        }

        tipoPrincipal = "imagen";
        caratula = (fotos[0] && fotos[0].url) || "";

        fotos.forEach(function (f, idx) {
          opciones.push({
            id: "foto_" + (idx + 1),
            etiqueta: fotos.length > 1 ? ("Descargar Imagen #" + (idx + 1) + " (HD)") : "Descargar Imagen (HD JPG)",
            formato: "JPG",
            resolucion: (f.size && f.size.width) ? (f.size.width + "x" + f.size.height) : "Alta Resolución",
            url: f.url,
            nombreSugerido: "twitter_" + tweetId + "_img" + (idx + 1) + ".jpg",
            esPrimario: idx === 0,
            icono: "imagen"
          });
        });
      }

      return {
        red: "twitter",
        id: tweetId,
        titulo: texto,
        tipo: tipoPrincipal,
        autor: autor,
        fecha: data.date || "Reciente",
        caratula: caratula,
        previewUrl: (opciones[0] && opciones[0].url) || "",
        opciones: opciones,
        urlOriginal: urlOriginal
      };
    },

    /**
     * Procesa la respuesta de FixTweet
     */
    procesarDatosFx: function (tweet, tweetId, urlOriginal) {
      var autor = {
        nombre: (tweet.author && tweet.author.name) || "Usuario de X",
        handle: (tweet.author && tweet.author.screen_name) ? "@" + tweet.author.screen_name : "@usuario",
        avatar: (tweet.author && tweet.author.avatar_url) || ""
      };
      var texto = tweet.text || "Momo de Twitter / X";
      var videos = (tweet.media && Array.isArray(tweet.media.videos)) ? tweet.media.videos : [];
      var photos = (tweet.media && Array.isArray(tweet.media.photos)) ? tweet.media.photos : [];

      var opciones = [];
      var caratula = "";
      var tipoPrincipal = "video";

      if (videos.length > 0) {
        var v = videos[0];
        tipoPrincipal = v.type === "gif" ? "gif" : "video";
        caratula = v.thumbnail_url || ("https://d.fxtwitter.com/i/status/" + tweetId + ".jpg");

        opciones.push({
          id: "video_hd",
          etiqueta: tipoPrincipal === "gif" ? "Descargar GIF (MP4)" : "Descargar Vídeo (HD MP4)",
          formato: "MP4",
          resolucion: (v.width ? (v.width + "x" + v.height) : "HD 1080p"),
          url: v.url,
          nombreSugerido: "twitter_" + tweetId + (tipoPrincipal === "gif" ? "_gif.mp4" : "_hd.mp4"),
          esPrimario: true,
          icono: "descarga"
        });

        if (tipoPrincipal !== "gif") {
          opciones.push({
            id: "audio_mp3",
            etiqueta: "Descargar Pista de Audio (MP3)",
            formato: "MP3",
            resolucion: "Audio Original",
            url: v.url,
            nombreSugerido: "twitter_" + tweetId + "_audio.mp3",
            esPrimario: false,
            icono: "musica"
          });
        }

        opciones.push({
          id: "caratula_jpg",
          etiqueta: "Descargar Carátula (HD JPG)",
          formato: "JPG",
          resolucion: "Miniatura Original",
          url: caratula,
          nombreSugerido: "twitter_" + tweetId + "_caratula.jpg",
          esPrimario: false,
          icono: "imagen"
        });
      } else if (photos.length > 0) {
        tipoPrincipal = "imagen";
        caratula = photos[0].url;

        photos.forEach(function (p, idx) {
          opciones.push({
            id: "foto_" + (idx + 1),
            etiqueta: photos.length > 1 ? ("Descargar Imagen #" + (idx + 1)) : "Descargar Imagen (HD JPG)",
            formato: "JPG",
            resolucion: (p.width ? (p.width + "x" + p.height) : "Alta Resolución"),
            url: p.url,
            nombreSugerido: "twitter_" + tweetId + "_img" + (idx + 1) + ".jpg",
            esPrimario: idx === 0,
            icono: "imagen"
          });
        });
      } else {
        return this.generarOpcionesDirectas(tweetId, urlOriginal);
      }

      return {
        red: "twitter",
        id: tweetId,
        titulo: texto,
        tipo: tipoPrincipal,
        autor: autor,
        fecha: tweet.created_at || "Reciente",
        caratula: caratula,
        previewUrl: (opciones[0] && opciones[0].url) || "",
        opciones: opciones,
        urlOriginal: urlOriginal
      };
    },

    /**
     * Generador de opciones directas con fallback a stream de FixTweet
     * (Garantiza descarga directa sin redirigir al usuario fuera de la web)
     */
    generarOpcionesDirectas: function (tweetId, urlOriginal) {
      var directVideoUrl = "https://d.fxtwitter.com/i/status/" + tweetId + ".mp4";
      var directCoverUrl = "https://d.fxtwitter.com/i/status/" + tweetId + ".jpg";

      return {
        red: "twitter",
        id: tweetId,
        titulo: "Publicación de Twitter / X #" + tweetId,
        tipo: "video",
        autor: {
          nombre: "Twitter / X Creator",
          handle: "@status_" + tweetId,
          avatar: ""
        },
        fecha: "Disponible",
        caratula: directCoverUrl,
        previewUrl: directVideoUrl,
        opciones: [
          {
            id: "video_hd",
            etiqueta: "Descargar Vídeo (HD MP4)",
            formato: "MP4",
            resolucion: "1080p / 720p HD",
            url: directVideoUrl,
            nombreSugerido: "twitter_" + tweetId + "_hd.mp4",
            esPrimario: true,
            icono: "descarga"
          },
          {
            id: "audio_mp3",
            etiqueta: "Descargar Pista de Audio (MP3)",
            formato: "MP3",
            resolucion: "Pista de audio",
            url: directVideoUrl,
            nombreSugerido: "twitter_" + tweetId + "_audio.mp3",
            esPrimario: false,
            icono: "musica"
          },
          {
            id: "caratula_hd",
            etiqueta: "Descargar Carátula (HD JPG)",
            formato: "JPG",
            resolucion: "Miniatura Original",
            url: directCoverUrl,
            nombreSugerido: "twitter_" + tweetId + "_caratula.jpg",
            esPrimario: false,
            icono: "imagen"
          }
        ],
        urlOriginal: urlOriginal
      };
    }
  };
})();
