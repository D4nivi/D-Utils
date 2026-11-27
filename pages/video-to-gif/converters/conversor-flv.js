/* =========================================================
   D-Utils · Conversor FLV a GIF
   ========================================================= */
(function (global) {
  "use strict";

  var ns = (global.DUtilsVideoGif = global.DUtilsVideoGif || {});
  var Base = ns.ConversorBase;

  function ConversorFLV() {
    Base.call(this, {
      id: "flv",
      nombre: "FLV",
      extensiones: [".flv"],
      mimes: ["video/x-flv", "video/flv"],
      soportaAlfa: false
    });
  }

  ConversorFLV.prototype = Object.create(Base.prototype);
  ConversorFLV.prototype.constructor = ConversorFLV;

  ConversorFLV.prototype.mensajeErrorFormato = function () {
    return "El contenedor Flash Video (FLV) no es decodificable nativamente por este navegador. Convierte primero a MP4 o WebM si el navegador lo rechaza.";
  };

  ns.ConversorFLV = ConversorFLV;
})(window);
