/* =========================================================
   D-Utils · Conversor WebM a GIF (con soporte de canal alfa)
   ========================================================= */
(function (global) {
  "use strict";

  var ns = (global.DUtilsVideoGif = global.DUtilsVideoGif || {});
  var Base = ns.ConversorBase;

  function ConversorWebM() {
    Base.call(this, {
      id: "webm",
      nombre: "WebM",
      extensiones: [".webm"],
      mimes: ["video/webm"],
      soportaAlfa: true
    });
  }

  ConversorWebM.prototype = Object.create(Base.prototype);
  ConversorWebM.prototype.constructor = ConversorWebM;

  ns.ConversorWebM = ConversorWebM;
})(window);
