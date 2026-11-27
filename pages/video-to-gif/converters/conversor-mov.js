/* =========================================================
   D-Utils · Conversor MOV a GIF (con soporte de alfa HEVC/ProRes si el navegador lo decodifica)
   ========================================================= */
(function (global) {
  "use strict";

  var ns = (global.DUtilsVideoGif = global.DUtilsVideoGif || {});
  var Base = ns.ConversorBase;

  function ConversorMOV() {
    Base.call(this, {
      id: "mov",
      nombre: "MOV",
      extensiones: [".mov"],
      mimes: ["video/quicktime"],
      soportaAlfa: true
    });
  }

  ConversorMOV.prototype = Object.create(Base.prototype);
  ConversorMOV.prototype.constructor = ConversorMOV;

  ConversorMOV.prototype.mensajeErrorFormato = function () {
    return "Este archivo MOV utiliza un códec (como ProRes o HEVC) que tu navegador no puede decodificar de forma nativa.";
  };

  ns.ConversorMOV = ConversorMOV;
})(window);
