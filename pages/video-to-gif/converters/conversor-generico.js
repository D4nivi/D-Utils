/* =========================================================
   D-Utils · Conversor Genérico y Registro de Conversores
   Maneja WMV, MKV, OGV, 3GP y selecciona el conversor óptimo
   ========================================================= */
(function (global) {
  "use strict";

  var ns = (global.DUtilsVideoGif = global.DUtilsVideoGif || {});
  var Base = ns.ConversorBase;

  function ConversorGenerico() {
    Base.call(this, {
      id: "generico",
      nombre: "Vídeo multimedia",
      extensiones: [".wmv", ".ogv", ".ogg", ".mkv", ".3gp", ".mpeg", ".mpg"],
      mimes: ["video/"],
      soportaAlfa: false
    });
  }

  ConversorGenerico.prototype = Object.create(Base.prototype);
  ConversorGenerico.prototype.constructor = ConversorGenerico;

  var listaConversores = [
    new ns.ConversorWebM(),
    new ns.ConversorMP4(),
    new ns.ConversorMOV(),
    new ns.ConversorAVI(),
    new ns.ConversorFLV(),
    new ConversorGenerico()
  ];

  ns.ConversorGenerico = ConversorGenerico;

  ns.RegistroConversores = {
    obtenerPara: function (nombreOUrl, mime) {
      for (var i = 0; i < listaConversores.length; i++) {
        if (listaConversores[i].puedeManejar(nombreOUrl, mime)) {
          return listaConversores[i];
        }
      }
      return listaConversores[listaConversores.length - 1];
    },
    listar: function () {
      return listaConversores.slice();
    }
  };
})(window);
