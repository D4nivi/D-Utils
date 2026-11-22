/* =========================================================
   D-Utils · Analizador de texto y métricas léxicas
   Ejecución 100% en cliente sin librerías externas
   ========================================================= */
(function () {
  "use strict";

  // Diccionario exhaustivo de palabras vacías (Stopwords) en español
  var STOPWORDS_ES = new Set([
    "a", "aca", "acá", "adelante", "ademas", "además", "adrede", "ahi", "ahí", "ahora", "al",
    "algo", "alguien", "algun", "algún", "alguna", "algunas", "alguno", "algunos", "alla", "allá",
    "alli", "allí", "alrededor", "ambos", "ante", "antes", "aquel", "aquella", "aquellas",
    "aquello", "aquellos", "aqui", "aquí", "arriba", "asi", "así", "atras", "atrás", "aun", "aún",
    "aunque", "bajo", "bastante", "bien", "cabe", "cada", "casi", "cerca", "claro", "como", "cómo",
    "con", "conmigo", "consigo", "contigo", "contra", "cual", "cuál", "cuales", "cuáles",
    "cualquier", "cualquiera", "cualquieras", "cuan", "cuán", "cuando", "cuándo", "cuanta", "cuánta",
    "cuantas", "cuántas", "cuanto", "cuánto", "cuantos", "cuántos", "de", "debajo", "del", "delante",
    "demas", "demás", "demasiado", "dentro", "desde", "despues", "después", "detras", "detrás",
    "dia", "día", "dias", "días", "donde", "dónde", "dos", "dr", "dra", "durante", "e", "el", "él", "ella",
    "ellas", "ello", "ellos", "embargo", "en", "encima", "enfrente", "enseguida", "entonces", "entre",
    "era", "erais", "eramos", "éramos", "eran", "eras", "eres", "es", "esa", "esas", "ese", "eso",
    "esos", "esta", "está", "estaba", "estabais", "estábamos", "estaban", "estabas", "estad",
    "estado", "estados", "estamos", "estan", "están", "estar", "estara", "estará", "estaran",
    "estarán", "estaras", "estarás", "estare", "estaré", "estareis", "estaréis", "estaremos",
    "estaria", "estaría", "estariais", "estaríais", "estariamos", "estaríamos", "estarian",
    "estarían", "estarias", "estarías", "estas", "estás", "este", "esté", "esteis", "estéis",
    "estemos", "esten", "estén", "estes", "estés", "esto", "estos", "estoy", "estuve", "estuviera",
    "estuvieran", "estuvieron", "estuviese", "estuvo", "fue", "fuera", "fuerais", "fuéramos",
    "fueran", "fueras", "fuere", "fueron", "fuese", "fui", "fuimos", "fuiste", "fuisteis", "ha",
    "habeis", "habéis", "habia", "había", "habiais", "habíais", "habiamos", "habíamos", "habian",
    "habían", "habias", "habías", "habida", "habidas", "habido", "habidos", "habiendo", "habra",
    "habrá", "habran", "habrán", "habras", "habrás", "habre", "habré", "habreis", "habréis",
    "habremos", "habria", "habría", "habriais", "habríais", "habriamos", "habríamos", "habrian",
    "habrían", "habrias", "habrías", "hace", "haceis", "hacéis", "hacemos", "hacen", "hacer",
    "haces", "hacia", "hacía", "hago", "han", "has", "hasta", "hay", "haya", "hayais", "hayáis",
    "hayamos", "hayan", "hayas", "he", "hemos", "hube", "hubiera", "hubieran", "hubiese",
    "hubiesen", "hubo", "incluso", "jamas", "jamás", "junto", "juntos", "la", "las", "le", "les",
    "lo", "los", "mas", "más", "me", "mediante", "medio", "menos", "mi", "mí", "mia", "mía",
    "mias", "mías", "mientras", "mio", "mío", "mios", "míos", "mis", "misma", "mismas", "mismo",
    "mismos", "modo", "mucha", "muchas", "mucho", "muchos", "muy", "nada", "nadie", "ni",
    "ningun", "ningún", "ninguna", "ningunas", "ninguno", "ningunos", "no", "nos", "nosotras",
    "nosotros", "nuestra", "nuestras", "nuestro", "nuestros", "nunca", "o", "os", "otra", "otras",
    "otro", "otros", "para", "parecer", "parte", "pero", "poco", "poca", "pocas", "pocos",
    "podeis", "podéis", "podemos", "poder", "podra", "podrá", "podran", "podrán", "podras",
    "podrás", "podre", "podré", "podreis", "podréis", "podremos", "podria", "podría", "podriais",
    "podríais", "podriamos", "podríamos", "podrian", "podrían", "podrias", "podrías", "por",
    "porque", "por que", "primero", "pronto", "propia", "propias", "propio", "propios", "pues",
    "que", "qué", "quien", "quién", "quienes", "quiénes", "quienquiera", "quiza", "quizá",
    "quizas", "quizás", "sabe", "sabeis", "sabéis", "sabemos", "saben", "saber", "sabes",
    "se", "sea", "seais", "seáis", "seamos", "sean", "seas", "segun", "según", "ser", "sera",
    "será", "seran", "serán", "seras", "serás", "sere", "seré", "sereis", "seréis", "seremos",
    "seria", "sería", "seriais", "seríais", "seriamos", "seríamos", "serian", "serían", "serias",
    "serías", "si", "sí", "sido", "siempre", "siendo", "sin", "sino", "sobre", "sois", "solamente",
    "solo", "sólo", "somos", "son", "soy", "sr", "sra", "su", "sus", "suya", "suyas", "suyo",
    "suyos", "tal", "tambien", "también", "tampoco", "tan", "tanta", "tantas", "tanto", "tantos",
    "te", "teneis", "tenéis", "tenemos", "tener", "tenga", "tengais", "tengáis", "tengamos",
    "tengan", "tengas", "tengo", "tenia", "tenía", "teniais", "teníais", "teniamos", "teníamos",
    "tenian", "tenían", "tenias", "tenías", "tenida", "tenidas", "tenido", "tenidos", "teniendo",
    "ti", "tiempo", "tiene", "tienen", "tienes", "toda", "todas", "todavia", "todavía", "todo",
    "todos", "tras", "tu", "tú", "tus", "tuya", "tuyas", "tuyo", "tuyos", "u", "un", "una",
    "unas", "uno", "unos", "usa", "usadas", "usados", "usar", "usas", "uso", "usted", "ustedes",
    "va", "vais", "vamos", "van", "varias", "varios", "vaya", "vayas", "vez", "veces",
    "vosotros", "vosotras", "voy", "vuestra", "vuestras", "vuestro", "vuestros", "y", "ya"
  ]);

  // Diccionario de palabras vacías (Stopwords) en inglés
  var STOPWORDS_EN = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
    "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does",
    "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had",
    "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
    "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd",
    "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
    "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off",
    "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over",
    "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
    "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've",
    "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't",
    "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when",
    "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's",
    "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've",
    "your", "yours", "yourself", "yourselves"
  ]);

  /**
   * Determina si un término es una palabra vacía en español o inglés.
   */
  function esStopword(palabra) {
    if (!palabra) return false;
    var norm = palabra.toLowerCase().trim();
    return STOPWORDS_ES.has(norm) || STOPWORDS_EN.has(norm);
  }

  /**
   * Conteo exacto de oraciones considerando abreviaturas, decimales y signos de cierre.
   */
  function contarOraciones(texto, numPalabras) {
    if (!texto || numPalabras === 0) return 0;

    var t = texto.trim();

    // 1. Proteger abreviaturas frecuentes para evitar falsos cortes
    var abreviaturas = [
      /\b(?:ej|pág|págs|etc|sr|sra|srta|dr|dra|prof|atte|ing|lic|num|núm|cap|vol|vs|art)\./gi,
      /\b(?:mr|mrs|ms|dr|prof|etc|vs|inc|corp|ltd|co|e\.g|i\.e|u\.s|u\.k)\./gi,
      /\b[a-záéíóúñ]\.(?:\s*[a-záéíóúñ]\.)+/gi
    ];
    abreviaturas.forEach(function (rgx) {
      t = t.replace(rgx, function (coincidencia) {
        return coincidencia.replace(/\./g, "@@PUNTO@@");
      });
    });

    // 2. Proteger números decimales (ej. 3.14 o 1.500)
    t = t.replace(/\b\d+\.\d+\b/g, function (coincidencia) {
      return coincidencia.replace(/\./g, "@@PUNTO@@");
    });

    // 3. Proteger enlaces web y correos electrónicos
    t = t.replace(/https?:\/\/[^\s]+/gi, function (coincidencia) {
      return coincidencia.replace(/\./g, "@@PUNTO@@");
    });
    t = t.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/gi, function (coincidencia) {
      return coincidencia.replace(/\./g, "@@PUNTO@@");
    });

    // 4. Dividir por terminadores (. ! ? … o secuencias) o saltos de párrafo
    var partes = t.split(/(?:[\.!\?…]+(?=[\s"»'”’\)]|$)|[\r\n]{2,})/g);

    var oracionesValidas = partes.filter(function (p) {
      var limpio = p.replace(/@@PUNTO@@/g, ".").trim();
      return /[\p{L}\p{N}]/u.test(limpio);
    });

    return Math.max(oracionesValidas.length, numPalabras > 0 ? 1 : 0);
  }

  /**
   * Formatea un tiempo en minutos y segundos a partir de palabras y palabras por minuto (PPM).
   */
  function formatearTiempo(palabras, ppm) {
    if (!palabras || palabras <= 0) {
      return "0 min 0 s";
    }
    var segsTotales = Math.round((palabras / ppm) * 60);
    var mins = Math.floor(segsTotales / 60);
    var segs = segsTotales % 60;
    return mins + " min " + segs + " s";
  }

  /**
   * Analiza el texto completo y genera todas las métricas en tiempo real.
   */
  function analizar(texto, opciones) {
    var opts = opciones || {};
    var modoClaves = opts.modoClaves || "unigrama"; // "unigrama" | "bigrama"
    var filtrar = opts.filtrarStopwords !== false; // por defecto true

    var txt = typeof texto === "string" ? texto : "";

    // 1. Caracteres y espacios
    var caracteres = Array.from(txt).length;
    var sinEspaciosArr = Array.from(txt.replace(/\s/gu, ""));
    var caracteresSinEspacios = sinEspaciosArr.length;
    var espacios = caracteres - caracteresSinEspacios;

    // 2. Palabras (maneja palabras compuestas con guion/apóstrofe y números decimales)
    var regexPalabras = /[\p{L}\p{N}]+(?:['’_-][\p{L}\p{N}]+|\.\d+|,\d+)*/gu;
    var tokens = txt.match(regexPalabras) || [];
    var palabras = tokens.length;

    // 3. Líneas y líneas no vacías
    var lineas = 0;
    var lineasNoVacias = 0;
    if (txt.length > 0) {
      var lineasArr = txt.split(/\r\n|\r|\n/);
      lineas = lineasArr.length;
      lineasNoVacias = lineasArr.filter(function (linea) {
        return linea.trim().length > 0;
      }).length;
    }

    // 4. Oraciones
    var oraciones = contarOraciones(txt, palabras);

    // 5. Páginas estimadas (~275 palabras por página)
    var paginas = palabras === 0 ? "0.0" : (palabras / 275).toFixed(1);

    // 6. Tiempos estimados
    var tiempoLectura = formatearTiempo(palabras, 200); // ~200 WPM
    var tiempoHabla = formatearTiempo(palabras, 135);   // ~135 WPM

    // 7. Análisis de palabras clave (frecuencia y porcentaje de densidad)
    var palabrasClave = [];

    if (palabras > 0) {
      var frecuencias = new Map();

      if (modoClaves === "unigrama") {
        for (var i = 0; i < tokens.length; i++) {
          var termino = tokens[i].toLowerCase();
          if (!/[\p{L}]/u.test(termino)) {
            continue; // Ignora tokens exclusivamente numéricos como palabras clave
          }
          if (filtrar && (esStopword(termino) || termino.length < 2)) {
            continue;
          }
          frecuencias.set(termino, (frecuencias.get(termino) || 0) + 1);
        }

        var ordenadas = Array.from(frecuencias.entries())
          .sort(function (a, b) {
            return b[1] - a[1] || a[0].localeCompare(b[0]);
          })
          .slice(0, 10);

        var maxFrecU = ordenadas.length > 0 ? ordenadas[0][1] : 1;

        palabrasClave = ordenadas.map(function (item) {
          var t = item[0];
          var frec = item[1];
          var pct = ((frec / palabras) * 100).toFixed(1);
          return {
            termino: t,
            frecuencia: frec,
            porcentaje: pct + "%",
            proporcionVisual: Math.max(12, Math.round((frec / maxFrecU) * 100))
          };
        });

      } else {
        // Bigramas respetando límites de cláusula / puntuación
        var clausulas = txt.split(/(?:[\.!\?…]+|[\r\n]+|[;:]+)/g);
        var baseTotalBigramas = Math.max(1, palabras - 1);

        for (var c = 0; c < clausulas.length; c++) {
          var tokensClausula = clausulas[c].match(regexPalabras);
          if (!tokensClausula || tokensClausula.length < 2) continue;

          for (var j = 0; j < tokensClausula.length - 1; j++) {
            var p1 = tokensClausula[j].toLowerCase();
            var p2 = tokensClausula[j + 1].toLowerCase();

            if (!/[\p{L}]/u.test(p1) || !/[\p{L}]/u.test(p2)) {
              continue; // Excluye combinaciones con números puros
            }

            if (filtrar) {
              if (esStopword(p1) || esStopword(p2) || p1.length < 2 || p2.length < 2) {
                continue;
              }
            }

            var bigrama = p1 + " " + p2;
            frecuencias.set(bigrama, (frecuencias.get(bigrama) || 0) + 1);
          }
        }

        var ordenadasB = Array.from(frecuencias.entries())
          .sort(function (a, b) {
            return b[1] - a[1] || a[0].localeCompare(b[0]);
          })
          .slice(0, 10);

        var maxFrecB = ordenadasB.length > 0 ? ordenadasB[0][1] : 1;

        palabrasClave = ordenadasB.map(function (item) {
          var tB = item[0];
          var frecB = item[1];
          var pctB = ((frecB / baseTotalBigramas) * 100).toFixed(1);
          return {
            termino: tB,
            frecuencia: frecB,
            porcentaje: pctB + "%",
            proporcionVisual: Math.max(12, Math.round((frecB / maxFrecB) * 100))
          };
        });
      }
    }

    return {
      palabras: palabras,
      caracteres: caracteres,
      caracteresSinEspacios: caracteresSinEspacios,
      espacios: espacios,
      oraciones: oraciones,
      lineas: lineas,
      lineasNoVacias: lineasNoVacias,
      paginas: paginas,
      tiempoLectura: tiempoLectura,
      tiempoHabla: tiempoHabla,
      palabrasClave: palabrasClave
    };
  }

  // Exposición pública del módulo
  window.DUtilsContador = {
    analizar: analizar,
    contarOraciones: contarOraciones,
    formatearTiempo: formatearTiempo,
    esStopword: esStopword,
    STOPWORDS_ES: STOPWORDS_ES,
    STOPWORDS_EN: STOPWORDS_EN
  };
})();
