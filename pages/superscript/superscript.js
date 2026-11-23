/* =========================================================
   D-Utils · Superscript · Lógica de transformación
   Transforma texto normal al formato Superíndice Unicode
   ========================================================= */
(function () {
  "use strict";

  // Mapeo completo de caracteres a superíndice Unicode
  var MAPA_SUPERSCRIPT = {
    // Minúsculas latinas
    "a": "ᵃ", "b": "ᵇ", "c": "ᶜ", "d": "ᵈ", "e": "ᵉ", "f": "ᶠ", "g": "ᵍ",
    "h": "ʰ", "i": "ⁱ", "j": "ʲ", "k": "ᵏ", "l": "ˡ", "m": "ᵐ", "n": "ⁿ",
    "o": "ᵒ", "p": "ᵖ", "q": "ᑫ", "r": "ʳ", "s": "ˢ", "t": "ᵗ", "u": "ᵘ",
    "v": "ᵛ", "w": "ʷ", "x": "ˣ", "y": "ʸ", "z": "ᶻ",

    // Mayúsculas latinas
    "A": "ᴬ", "B": "ᴮ", "C": "ᶜ", "D": "ᴰ", "E": "ᴱ", "F": "ᶠ", "G": "ᴳ",
    "H": "ᴴ", "I": "ᴵ", "J": "ᴶ", "K": "ᴷ", "L": "ᴸ", "M": "ᴹ", "N": "ᴺ",
    "O": "ᴼ", "P": "ᴾ", "Q": "ᑫ", "R": "ᴿ", "S": "ˢ", "T": "ᵀ", "U": "ᵁ",
    "V": "ⱽ", "W": "ᵂ", "X": "ˣ", "Y": "ʸ", "Z": "ᶻ",

    // Dígitos numéricos
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",

    // Signos matemáticos y de agrupación
    "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",

    // Letras acentuadas en español (mapeadas a su versión superíndice)
    "á": "ᵃ", "é": "ᵉ", "í": "ⁱ", "ó": "ᵒ", "ú": "ᵘ", "ü": "ᵘ", "ñ": "ⁿ",
    "Á": "ᴬ", "É": "ᴱ", "Í": "ᴵ", "Ó": "ᴼ", "Ú": "ᵁ", "Ü": "ᵁ", "Ñ": "ᴺ"
  };

  var TEXTO_PREVIEW_IN = "hola\nesto es un texto de ejemplo\nxd";
  var PLACEHOLDER_ESTATICO_IN = "Escribe o pega aquí el texto normal que deseas convertir...";
  var PLACEHOLDER_ESTATICO_OUT = "Aquí aparecerá el texto convertido a superíndice...";

  /**
   * Transforma una cadena normal a su versión Superscript en Unicode.
   */
  function transformarASuperscript(texto) {
    if (!texto) return "";
    var resultado = [];
    var caracteres = Array.from(texto);

    for (var i = 0; i < caracteres.length; i++) {
      var c = caracteres[i];
      resultado.push(MAPA_SUPERSCRIPT[c] !== undefined ? MAPA_SUPERSCRIPT[c] : c);
    }

    return resultado.join("");
  }

  var TEXTO_PREVIEW_OUT = transformarASuperscript(TEXTO_PREVIEW_IN);

  function inicializarModulo() {
    var hostEntrada = document.getElementById("host-bloque-entrada");
    var hostSalida = document.getElementById("host-bloque-salida");

    if (!hostEntrada || !hostSalida || !window.DUtilsBloqueTexto) {
      setTimeout(inicializarModulo, 60);
      return;
    }

    var contenedorLayout = document.querySelector(".superscript-layout");

    // Instancia del bloque de ENTRADA (Texto normal) - Se inicia vacío sin texto por defecto
    var bloqueEntrada = window.DUtilsBloqueTexto.crear({
      contenedor: hostEntrada,
      id: "editor-entrada",
      titulo: "Texto normal",
      placeholder: "",
      soloLectura: false,
      acciones: ["pegar", "subir", "copiar", "borrar"],
      autofocus: false,
      valorInicial: "",
      onChange: function (texto) {
        procesarConversion(texto);
      }
    });

    // Instancia del bloque de SALIDA (Superscript)
    var bloqueSalida = window.DUtilsBloqueTexto.crear({
      contenedor: hostSalida,
      id: "editor-salida",
      titulo: "Texto en superíndice",
      placeholder: "",
      soloLectura: true,
      acciones: ["copiar"],
      valorInicial: ""
    });

    var taEntrada = bloqueEntrada.textarea;
    var taSalida = bloqueSalida.textarea;

    /**
     * Procesa y sincroniza la conversión del texto.
     */
    function procesarConversion(texto) {
      var superTexto = transformarASuperscript(texto);
      bloqueSalida.establecerTexto(superTexto, false);

      if (texto && texto.length > 0) {
        detenerAnimacionPlaceholder(false);
      } else if (!enFoco) {
        iniciarAnimacionPlaceholder();
      }
    }

    /* ---------- Animación de escritura en vivo para los placeholders ---------- */
    var animTimer = null;
    var indiceChar = 0;
    var enPausa = false;
    var enFoco = false;
    var animActiva = false;

    function pasoAnimacion() {
      if (!animActiva) return;

      if (enPausa) {
        return;
      }

      if (indiceChar <= TEXTO_PREVIEW_IN.length) {
        taEntrada.placeholder = TEXTO_PREVIEW_IN.substring(0, indiceChar);
        taSalida.placeholder = TEXTO_PREVIEW_OUT.substring(0, indiceChar);
        indiceChar++;

        if (indiceChar > TEXTO_PREVIEW_IN.length) {
          // Pausa al terminar de escribir la preview completa
          enPausa = true;
          animTimer = setTimeout(function () {
            if (!animActiva) return;
            enPausa = false;
            indiceChar = 0;
            taEntrada.placeholder = "";
            taSalida.placeholder = "";
            animTimer = setTimeout(pasoAnimacion, 400);
          }, 2400);
          return;
        }

        animTimer = setTimeout(pasoAnimacion, 75);
      }
    }

    function iniciarAnimacionPlaceholder() {
      if (animActiva) return;
      if (taEntrada.value && taEntrada.value.length > 0) return;
      if (enFoco) return;

      animActiva = true;
      enPausa = false;
      indiceChar = 0;
      if (contenedorLayout) {
        contenedorLayout.classList.add("animando-preview");
      }
      pasoAnimacion();
    }

    function detenerAnimacionPlaceholder(restaurarEstaticos) {
      animActiva = false;
      if (animTimer) {
        clearTimeout(animTimer);
        animTimer = null;
      }
      if (contenedorLayout) {
        contenedorLayout.classList.remove("animando-preview");
      }
      if (restaurarEstaticos) {
        taEntrada.placeholder = PLACEHOLDER_ESTATICO_IN;
        taSalida.placeholder = PLACEHOLDER_ESTATICO_OUT;
      }
    }

    // Al hacer focus en el textarea de entrada: detener inmediatamente la animación
    taEntrada.addEventListener("focus", function () {
      enFoco = true;
      detenerAnimacionPlaceholder(true);
    });

    // Al perder el foco: si el campo quedó vacío, reanudar la animación de preview
    taEntrada.addEventListener("blur", function () {
      enFoco = false;
      if (!taEntrada.value || taEntrada.value.length === 0) {
        iniciarAnimacionPlaceholder();
      }
    });

    // Iniciar el efecto de placeholder al cargar la página
    iniciarAnimacionPlaceholder();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarModulo);
  } else {
    inicializarModulo();
  }
})();
