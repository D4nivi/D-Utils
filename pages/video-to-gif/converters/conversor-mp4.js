/* =========================================================
   D-Utils · Conversor MP4 a GIF
   ========================================================= */
(function (global) {
  "use strict";

  var ns = (global.DUtilsVideoGif = global.DUtilsVideoGif || {});
  var Base = ns.ConversorBase;

  function ConversorMP4() {
    Base.call(this, {
      id: "mp4",
      nombre: "MP4",
      extensiones: [".mp4", ".m4v"],
      mimes: ["video/mp4", "video/x-m4v"],
      soportaAlfa: false
    });
  }

  ConversorMP4.prototype = Object.create(Base.prototype);
  ConversorMP4.prototype.constructor = ConversorMP4;

  ns.ConversorMP4 = ConversorMP4;
})(window);
