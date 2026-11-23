/* =========================================================
   D-Utils · Descargar momos · Módulo común (comun.js)
   Utilidades transversales de red, proxies, portapapeles y descargas
   ========================================================= */
(function () {
  "use strict";

  window.DUtilsDescargaComun = {
    /**
     * Limpia y normaliza una URL ingresada, eliminando parámetros de rastreo
     * @param {string} url - URL sin procesar
     * @returns {string} URL limpia
     */
    limpiarUrl: function (url) {
      if (!url || typeof url !== "string") return "";
      var u = url.trim();
      // Eliminar espacios y posibles saltos de línea
      u = u.replace(/\s+/g, "");
      // Si no tiene protocolo, agregar https://
      if (!/^https?:\/\//i.test(u)) {
        u = "https://" + u;
      }
      try {
        var objUrl = new URL(u);
        // Lista de parámetros de tracking comunes que se pueden descartar con seguridad
        var paramsABorrar = [
          "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
          "igsh", "igshid", "s", "t", "ref_src", "fbclid", "si", "feature"
        ];
        paramsABorrar.forEach(function (p) {
          objUrl.searchParams.delete(p);
        });
        return objUrl.toString();
      } catch (e) {
        return u;
      }
    },

    /**
     * Detecta automáticamente a qué red social pertenece una URL
     * @param {string} url - URL a analizar
     * @returns {"twitter"|"instagram"|"tiktok"|null}
     */
    extraerTipoRed: function (url) {
      if (!url || typeof url !== "string") return null;
      var u = url.toLowerCase();
      if (/twitter\.com|x\.com|fixupx\.com|vxtwitter\.com|fxtwitter\.com/.test(u)) {
        return "twitter";
      }
      if (/instagram\.com|instagr\.am|ddinstagram\.com/.test(u)) {
        return "instagram";
      }
      if (/tiktok\.com/.test(u)) {
        return "tiktok";
      }
      return null;
    },

    /**
     * Copia texto al portapapeles con fallback robusto
     * @param {string} texto - Texto a copiar
     * @returns {Promise<boolean>}
     */
    copiarPortapapeles: function (texto) {
      if (!texto) return Promise.resolve(false);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(texto).then(
          function () { return true; },
          function () { return false; }
        );
      }
      return new Promise(function (resolve) {
        try {
          var ta = document.createElement("textarea");
          ta.value = texto;
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          ta.style.top = "-9999px";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          var ok = document.execCommand("copy");
          document.body.removeChild(ta);
          resolve(ok);
        } catch (e) {
          resolve(false);
        }
      });
    },

    /**
     * Lee texto del portapapeles del usuario
     * @returns {Promise<string>}
     */
    pegarPortapapeles: function () {
      if (navigator.clipboard && navigator.clipboard.readText) {
        return navigator.clipboard.readText().then(
          function (txt) { return txt ? txt.trim() : ""; },
          function (err) {
            console.warn("Permiso de lectura del portapapeles denegado o error:", err);
            return "";
          }
        );
      }
      return Promise.resolve("");
    },

    /**
     * Dispara la descarga de un recurso (video, imagen, audio).
     * Si fetch permite Blob sin CORS, descarga directo con nombre sugerido.
     * Si el servidor rechaza CORS, abre la descarga en pestaña segura sin bloquear.
     * @param {string} url - URL del archivo a descargar
     * @param {string} nombreArchivo - Nombre sugerido del archivo guardado
     * @param {Function} [cbProgreso] - Callback de estado ("iniciando"|"descargando"|"completado"|"fallback")
     */
    descargarArchivo: function (url, nombreArchivo, cbProgreso) {
      if (!url) return;
      if (cbProgreso) cbProgreso("iniciando");

      var nombre = nombreArchivo || ("momo_" + Date.now() + ".mp4");

      // Intento 1: Fetch como Blob para descarga forzada con nombre
      fetch(url, { mode: "cors" })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP error " + res.status);
          if (cbProgreso) cbProgreso("descargando");
          return res.blob();
        })
        .then(function (blob) {
          var objUrl = URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = objUrl;
          a.download = nombre;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function () {
            URL.revokeObjectURL(objUrl);
          }, 4000);
          if (cbProgreso) cbProgreso("completado");
        })
        .catch(function (err) {
          // Fallback seguro: Enlace directo con atributo download y target _blank
          if (cbProgreso) cbProgreso("fallback");
          var a = document.createElement("a");
          a.href = url;
          a.download = nombre;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
    },

    /**
     * Muestra una notificación flotante HUD táctica (toast)
     * @param {string} mensaje - Texto a mostrar
     * @param {"ok"|"warn"|"error"|"info"} [tipo] - Nivel de la alerta
     */
    notificar: function (mensaje, tipo) {
      var tipoFinal = tipo || "info";
      var idContenedor = "dutils-toast-container";
      var contenedor = document.getElementById(idContenedor);
      if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = idContenedor;
        contenedor.className = "dutils-toast-container";
        document.body.appendChild(contenedor);
      }

      var toast = document.createElement("div");
      toast.className = "hud-toast toast-" + tipoFinal;
      toast.setAttribute("role", "alert");
      toast.textContent = mensaje;

      contenedor.appendChild(toast);

      // Desvanecer y retirar tras 3.2 segundos
      setTimeout(function () {
        toast.classList.add("toast-salida");
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
      }, 3200);
    },

    /**
     * Formatea un número de segundos en MM:SS
     * @param {number} segs - Segundos
     * @returns {string} Formato MM:SS
     */
    formatearDuracion: function (segs) {
      if (!segs || isNaN(segs)) return "";
      var m = Math.floor(segs / 60);
      var s = Math.floor(segs % 60);
      return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    }
  };
})();
