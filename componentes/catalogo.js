/* =========================================================
   D-Utils · Catálogo central de datos de utilidades
   ========================================================= */
(function () {
  "use strict";

  window.DUtilsCatalogo = [
    {
      id: "recortar",
      titulo: "Recortar imágenes",
      url: "pages/recortar/",
      estado: "disponibles",
      badgeClase: "hud-badge-ok",
      badgeTexto: "DISPONIBLE",
      categoria: "cat-imagen",
      categoriaTexto: "IMAGEN // MOD_01",
      descripcion: "Quita el fondo blanco sobrante y deja un margen fijo exacto en lotes de imágenes. Soporte para arrastrar archivos o URLs con CORS.",
      tags: ["100% LOCAL", "ZIP BATCH", "JPG/PNG"],
      accionTexto: "ABRIR MÓDULO →",
      icono: "recortar",
      keywords: "imagen foto recortar recorte fondo blanco margen lote batch jpg png transparente autocrop"
    },
    {
      id: "simbolos",
      titulo: "Símbolos para copiar/pegar",
      url: "pages/simbolos/",
      estado: "disponibles",
      badgeClase: "hud-badge-ok",
      badgeTexto: "DISPONIBLE",
      categoria: "cat-texto",
      categoriaTexto: "TEXTO // MOD_02",
      descripcion: "Colección de símbolos técnicos, glifos estéticos y caracteres frecuentes listos para transferir al portapapeles con un solo toque.",
      tags: ["PORTAPAPELES", "UNICODE", "GLIFOS"],
      accionTexto: "ABRIR MÓDULO →",
      icono: "simbolos",
      keywords: "simbolos caracteres texto glifos copiar pegar unicode flechas matematicas latex kaomoji emoticonos iconos portapapeles clipboard alt codigos oem"
    },
    {
      id: "ruleta",
      titulo: "Ruleta para sorteos",
      url: "pages/ruleta/",
      estado: "disponibles",
      badgeClase: "hud-badge-ok",
      badgeTexto: "DISPONIBLE",
      categoria: "cat-utilidad",
      categoriaTexto: "UTILIDAD // MOD_03",
      descripcion: "Ruleta visual interactiva estilo arcade para sorteos justos, rifas y toma de decisiones aleatorias en vivo sin registros.",
      tags: ["RNG ENGINE", "ANIMACIÓN", "PROBABILIDAD"],
      accionTexto: "ABRIR MÓDULO →",
      icono: "ruleta",
      keywords: "ruleta sorteos sorteo azar aleatorio nombres decisiones ganador premios arcade wheel spinner probabilidad"
    },
    {
      id: "contador-palabras",
      titulo: "Contador de palabras",
      url: "pages/contador-palabras/",
      estado: "disponibles",
      badgeClase: "hud-badge-ok",
      badgeTexto: "DISPONIBLE",
      categoria: "cat-texto",
      categoriaTexto: "TEXTO // MOD_04",
      descripcion: "Métricas avanzadas de redacción en tiempo real: palabras, caracteres, tiempos estimados, lectura/habla y densidad léxica.",
      tags: ["KPI HERO", "LECTURA/HABLA", "DENSIDAD"],
      accionTexto: "ABRIR MÓDULO →",
      icono: "contador-palabras",
      keywords: "contador palabras caracteres texto longitud parrafos tiempo lectura frecuencia densidad analisis estadisticas wpm bigramas stopwords oraciones lineas paginas habla"
    },
    {
      id: "comparador-textos",
      titulo: "Comparador de textos",
      url: "pages/comparador-textos/",
      estado: "disponibles",
      badgeClase: "hud-badge-ok",
      badgeTexto: "DISPONIBLE",
      categoria: "cat-texto",
      categoriaTexto: "TEXTO // MOD_05",
      descripcion: "Inspección lado a lado con diff en dos niveles (líneas y caracteres) para identificar inserciones, supresiones y modificaciones.",
      tags: ["DIFF 2 NIVELES", "SIN NUBE", "UNICODE"],
      accionTexto: "ABRIR MÓDULO →",
      icono: "comparador-textos",
      keywords: "comparador textos diferencias diff comparar codigo version texto cambios cambios resaltar lineas cotejo myers lcs"
    },
    {
      id: "ocr",
      titulo: "OCR (Extracción de texto)",
      url: "pages/ocr/",
      estado: "disponibles",
      badgeClase: "hud-badge-ok",
      badgeTexto: "DISPONIBLE",
      categoria: "cat-imagen",
      categoriaTexto: "IMAGEN // MOD_06",
      descripcion: "Convierte imágenes, fotos y capturas en texto editable con Tesseract WebAssembly 100% en local. Modelos fast y best para español e inglés.",
      tags: ["TESSERACT WASM", "100% LOCAL", "SPA / ENG"],
      accionTexto: "ABRIR MÓDULO →",
      icono: "ocr",
      keywords: "ocr reconocimiento texto imagen capturas escanear extraer letras optical character recognition fotos tesseract wasm"
    },
    {
      id: "indexator",
      titulo: "Indexator",
      url: "pages/indexator/",
      estado: "disponibles",
      badgeClase: "hud-badge-ok",
      badgeTexto: "DISPONIBLE",
      categoria: "cat-texto",
      categoriaTexto: "TEXTO // MOD_07",
      descripcion: "Indexador jerárquico de notas Markdown para Obsidian. Genera índices navegables automáticos, numera apartados y soporta wikilinks.",
      tags: ["OBSIDIAN", "MARKDOWN", "ÍNDICES"],
      accionTexto: "ABRIR MÓDULO →",
      icono: "indexator",
      keywords: "indexator indexar obsidian markdown indice contenidos encabezados titulos wikilinks notas reindexar jerarquia subdivision"
    },
    {
      id: "superscript",
      titulo: "Superscript",
      url: "pages/superscript/",
      estado: "disponibles",
      badgeClase: "hud-badge-ok",
      badgeTexto: "DISPONIBLE",
      categoria: "cat-texto",
      categoriaTexto: "TEXTO // MOD_08",
      descripcion: "Transforma texto normal al instante en caracteres superíndice Unicode (Superscript) listos para copiar en cualquier chat o red social.",
      tags: ["SUPERÍNDICE", "UNICODE", "INSTANTÁNEO"],
      accionTexto: "ABRIR MÓDULO →",
      icono: "superscript",
      keywords: "superscript superindice texto letras pequeñas elevar exponente unicode caracteres copiar pegar transformador conversor"
    },
    {
      id: "descargar-momos",
      titulo: "Descargar momos",
      url: "pages/descargar-momos/",
      estado: "disponibles",
      badgeClase: "hud-badge-ok",
      badgeTexto: "DISPONIBLE",
      categoria: "cat-utilidad",
      categoriaTexto: "UTILIDAD // MOD_09",
      descripcion: "Extractor y descargador táctico de vídeos, imágenes y GIFs de Twitter / X, Instagram y TikTok con selección de calidades.",
      tags: ["REDES SOCIALES", "VÍDEOS/GIFS", "CALIDADES"],
      accionTexto: "ABRIR MÓDULO →",
      icono: "descargar-momos",
      keywords: "descargar momos memes videos fotos imagenes gifs twitter x instagram tiktok reels shorts tikwm vxtwitter extractor multimedia calidad"
    }
  ];

  // Renderiza el HTML de cada tarjeta en el contenedor indicado
  window.DUtilsRenderizarCatalogo = function (contenedorId) {
    var contenedor = document.getElementById(contenedorId || "lista");
    if (!contenedor) return;

    var temaActual = (window.DUtilsTemas && window.DUtilsTemas.temaActual)
      ? window.DUtilsTemas.temaActual()
      : (document.documentElement.getAttribute("data-theme") || "tactico");

    var html = window.DUtilsCatalogo.map(function (item) {
      var svgIcono = (window.DUtilsIconos && window.DUtilsIconos.obtener)
        ? window.DUtilsIconos.obtener(item.icono, temaActual)
        : ((window.DUtilsIconos && window.DUtilsIconos[item.icono]) || "");
      var esConstruccion = item.estado === "construccion" ? " en-construccion" : "";
      var tagsHtml = item.tags.map(function (t) {
        return '<span class="tool-tag-mini">' + t + '</span>';
      }).join("");

      var urlDestino = item.url;
      if (typeof location !== "undefined" && location.protocol === "file:") {
        urlDestino = item.url.replace(/\/?$/, "/index.html");
      }

      return (
        '<li class="tool-item"' +
            ' data-estado="' + item.estado + '"' +
            ' data-categoria="' + item.categoria + '"' +
            ' data-keywords="' + item.keywords + '">' +
          '<a class="tool-card' + esConstruccion + '" href="' + urlDestino + '">' +
            '<div class="tool-preview">' +
              '<div class="preview-hud"></div>' +
              svgIcono +
            '</div>' +
            '<div class="tool-content">' +
              '<div class="tool-header">' +
                '<span class="hud-badge ' + item.badgeClase + '"><span class="pulse-dot"></span>' + item.badgeTexto + '</span>' +
                '<span class="tool-cat">' + item.categoriaTexto + '</span>' +
              '</div>' +
              '<div>' +
                '<h2 class="tool-title">' + item.titulo + '</h2>' +
                '<p class="tool-desc">' + item.descripcion + '</p>' +
              '</div>' +
              '<div class="tool-footer">' +
                '<div class="tool-tags">' + tagsHtml + '</div>' +
                '<span class="tool-action">' + item.accionTexto + '</span>' +
              '</div>' +
            '</div>' +
          '</a>' +
        '</li>'
      );
    }).join("");

    contenedor.innerHTML = html;
  };

  // Re-renderizado reactivo automático cuando cambia el tema visual
  if (typeof window !== "undefined") {
    window.addEventListener("dutils:tema-cambiado", function () {
      if (document.getElementById("lista")) {
        window.DUtilsRenderizarCatalogo("lista");
        if (window.DUtilsInicializarBuscador) {
          window.DUtilsInicializarBuscador();
        }
      }
    });
  }
})();
