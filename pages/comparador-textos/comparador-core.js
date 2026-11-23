/* =========================================================
   D-Utils · Comparador de Textos · Motor de Diff y Estadísticas
   - Normalización y tokenización Unicode
   - Myers Diff O(ND) en dos niveles (Líneas y Caracteres)
   - Agrupación inteligente de modificaciones
   - Estadísticas de composición y similitud Unicode
   - Código puro sin dependencias del DOM (apto para Web Worker)
   ========================================================= */

(function (global) {
  "use strict";

  var DUtilsDiffCore = {};

  /**
   * Divide un texto en líneas preservando la información original y normalizando saltos.
   * @param {string} texto
   * @param {Object} opciones
   * @returns {Array<{ original: string, cmp: string }>}
   */
  DUtilsDiffCore.tokenizarLineas = function (texto, opciones) {
    opciones = opciones || {};
    var ignorarMayusculas = !!opciones.ignorarMayusculas;
    var ignorarEspaciosFinales = !!opciones.ignorarEspaciosFinales;

    if (!texto && texto !== "") return [];
    var normalizado = String(texto).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (normalizado === "") return [];

    var lineasRaw = normalizado.split("\n");
    var res = [];

    for (var i = 0; i < lineasRaw.length; i++) {
      var orig = lineasRaw[i];
      var cmp = orig;
      if (ignorarEspaciosFinales) {
        cmp = cmp.replace(/[\t ]+$/, "");
      }
      if (ignorarMayusculas) {
        cmp = cmp.toLocaleLowerCase("es");
      }
      res.push({
        original: orig,
        cmp: cmp,
        indice: i + 1
      });
    }

    return res;
  };

  /**
   * Divide una línea en code points Unicode (respetando emojis y pares sustitutos).
   * @param {string} linea
   * @param {Object} opciones
   * @returns {Array<{ original: string, cmp: string }>}
   */
  DUtilsDiffCore.tokenizarCaracteres = function (linea, opciones) {
    opciones = opciones || {};
    var ignorarMayusculas = !!opciones.ignorarMayusculas;

    if (!linea && linea !== "") return [];
    var codePoints = Array.from(String(linea));
    var res = [];

    for (var i = 0; i < codePoints.length; i++) {
      var cp = codePoints[i];
      var cmp = ignorarMayusculas ? cp.toLocaleLowerCase("es") : cp;
      res.push({
        original: cp,
        cmp: cmp
      });
    }

    return res;
  };

  /**
   * Algoritmo de Myers para encontrar la secuencia mínima de edición entre dos arrays de tokens.
   * Cada token debe tener la propiedad `.cmp`.
   * @param {Array} a
   * @param {Array} b
   * @param {number} [maxD] Límite de ediciones para no bloquear en casos masivos.
   * @returns {Array<{ op: "igual"|"eliminar"|"insertar", token: any, indexA?: number, indexB?: number }>}
   */
  DUtilsDiffCore.myersDiff = function (a, b, maxD) {
    var N = a.length;
    var M = b.length;

    // Caso 1: Ambos vacíos
    if (N === 0 && M === 0) return [];

    // Caso 2: A vacío -> todo inserciones
    if (N === 0) {
      return b.map(function (item, idx) {
        return { op: "insertar", token: item, indexB: idx };
      });
    }

    // Caso 3: B vacío -> todo eliminaciones
    if (M === 0) {
      return a.map(function (item, idx) {
        return { op: "eliminar", token: item, indexA: idx };
      });
    }

    // Optimización rápida: Recortar prefijo común
    var prefijoComun = 0;
    while (prefijoComun < N && prefijoComun < M && a[prefijoComun].cmp === b[prefijoComun].cmp) {
      prefijoComun++;
    }

    // Optimización rápida: Recortar sufijo común
    var sufijoComun = 0;
    while (
      sufijoComun < N - prefijoComun &&
      sufijoComun < M - prefijoComun &&
      a[N - 1 - sufijoComun].cmp === b[M - 1 - sufijoComun].cmp
    ) {
      sufijoComun++;
    }

    var aSub = a.slice(prefijoComun, N - sufijoComun);
    var bSub = b.slice(prefijoComun, M - sufijoComun);
    var subN = aSub.length;
    var subM = bSub.length;

    var diffIntermedio = [];

    if (subN === 0 && subM === 0) {
      // Todo era común
      diffIntermedio = [];
    } else if (subN === 0) {
      for (var bi = 0; bi < subM; bi++) {
        diffIntermedio.push({ op: "insertar", token: bSub[bi], indexB: prefijoComun + bi });
      }
    } else if (subM === 0) {
      for (var ai = 0; ai < subN; ai++) {
        diffIntermedio.push({ op: "eliminar", token: aSub[ai], indexA: prefijoComun + ai });
      }
    } else {
      // Ejecutar Myers sobre la parte intermedia
      var MAX = subN + subM;
      var limiteD = maxD !== undefined ? Math.min(maxD, MAX) : MAX;

      // Usamos arrays tipados o vectores planos con offset
      var offset = MAX;
      var V = new Int32Array(2 * MAX + 1);
      V.fill(-1);
      V[1 + offset] = 0;

      var trace = [];
      var completado = false;
      var finD = 0;

      for (var D = 0; D <= limiteD; D++) {
        finD = D;
        var vCopia = new Int32Array(V);
        trace.push(vCopia);

        for (var k = -D; k <= D; k += 2) {
          var kOffset = k + offset;
          var x;
          if (k === -D || (k !== D && V[kOffset - 1] < V[kOffset + 1])) {
            x = V[kOffset + 1]; // Inserción (abajo)
          } else {
            x = V[kOffset - 1] + 1; // Eliminación (derecha)
          }

          var y = x - k;

          while (x < subN && y < subM && aSub[x].cmp === bSub[y].cmp) {
            x++;
            y++;
          }

          V[kOffset] = x;

          if (x >= subN && y >= subM) {
            completado = true;
            break;
          }
        }

        if (completado) break;
      }

      if (!completado) {
        // Degeneración / Límite excedido: fallback rápido
        for (var ea = 0; ea < subN; ea++) {
          diffIntermedio.push({ op: "eliminar", token: aSub[ea], indexA: prefijoComun + ea });
        }
        for (var eb = 0; eb < subM; eb++) {
          diffIntermedio.push({ op: "insertar", token: bSub[eb], indexB: prefijoComun + eb });
        }
      } else {
        // Backtracking
        var camino = [];
        var currX = subN;
        var currY = subM;

        for (var d = finD; d > 0; d--) {
          var kCurr = currX - currY;
          var vHist = trace[d];
          var kOff = kCurr + offset;

          var prevK;
          if (kCurr === -d || (kCurr !== d && vHist[kOff - 1] < vHist[kOff + 1])) {
            prevK = kCurr + 1;
          } else {
            prevK = kCurr - 1;
          }

          var prevX = vHist[prevK + offset];
          var prevY = prevX - prevK;

          while (currX > prevX && currY > prevY) {
            camino.push({
              op: "igual",
              token: aSub[currX - 1],
              tokenB: bSub[currY - 1],
              indexA: prefijoComun + currX - 1,
              indexB: prefijoComun + currY - 1
            });
            currX--;
            currY--;
          }

          if (d > 0) {
            if (currX === prevX) {
              camino.push({
                op: "insertar",
                token: bSub[currY - 1],
                indexB: prefijoComun + currY - 1
              });
              currY--;
            } else {
              camino.push({
                op: "eliminar",
                token: aSub[currX - 1],
                indexA: prefijoComun + currX - 1
              });
              currX--;
            }
          }
        }

        while (currX > 0 && currY > 0) {
          camino.push({
            op: "igual",
            token: aSub[currX - 1],
            tokenB: bSub[currY - 1],
            indexA: prefijoComun + currX - 1,
            indexB: prefijoComun + currY - 1
          });
          currX--;
          currY--;
        }

        camino.reverse();
        diffIntermedio = camino;
      }
    }

    // Reensamblar con prefijo y sufijo
    var resultado = [];
    for (var p = 0; p < prefijoComun; p++) {
      resultado.push({
        op: "igual",
        token: a[p],
        tokenB: b[p],
        indexA: p,
        indexB: p
      });
    }

    for (var m = 0; m < diffIntermedio.length; m++) {
      resultado.push(diffIntermedio[m]);
    }

    for (var s = 0; s < sufijoComun; s++) {
      var idxA = N - sufijoComun + s;
      var idxB = M - sufijoComun + s;
      resultado.push({
        op: "igual",
        token: a[idxA],
        tokenB: b[idxB],
        indexA: idxA,
        indexB: idxB
      });
    }

    return resultado;
  };

  /**
   * Diff de Nivel 2: Compara dos líneas carácter a carácter con heurística de fusión de fragmentos cortos.
   * @param {string} lineaA
   * @param {string} lineaB
   * @param {Object} opciones
   * @returns {{ chunksA: Array<{ texto: string, tipo: 'igual'|'modificado' }>, chunksB: Array<{ texto: string, tipo: 'igual'|'modificado' }>, charsModificadosA: number, charsModificadosB: number, charsIguales: number }}
   */
  DUtilsDiffCore.diffCaracteresLinea = function (lineaA, lineaB, opciones) {
    opciones = opciones || {};

    // Umbral de seguridad contra líneas gigantes
    if (lineaA.length > 5000 || lineaB.length > 5000 || lineaA.length * lineaB.length > 250000) {
      return {
        chunksA: [{ texto: lineaA, tipo: "modificado" }],
        chunksB: [{ texto: lineaB, tipo: "modificado" }],
        charsModificadosA: lineaA.length,
        charsModificadosB: lineaB.length,
        charsIguales: 0,
        degradado: true
      };
    }

    var tokensA = DUtilsDiffCore.tokenizarCaracteres(lineaA, opciones);
    var tokensB = DUtilsDiffCore.tokenizarCaracteres(lineaB, opciones);

    var diffRaw = DUtilsDiffCore.myersDiff(tokensA, tokensB, 500);

    // Separar en secuencias para A y para B
    var seqA = [];
    var seqB = [];

    for (var i = 0; i < diffRaw.length; i++) {
      var paso = diffRaw[i];
      if (paso.op === "igual") {
        seqA.push({ char: paso.token.original, tipo: "igual" });
        seqB.push({ char: paso.tokenB.original, tipo: "igual" });
      } else if (paso.op === "eliminar") {
        seqA.push({ char: paso.token.original, tipo: "modificado" });
      } else if (paso.op === "insertar") {
        seqB.push({ char: paso.token.original, tipo: "modificado" });
      }
    }

    // Heurística de legibilidad: Fusión de fragmentos "iguales" muy cortos (1-2 caracteres)
    // atrapados entre modificaciones dentro de la misma línea
    function fusionarFragmentosCortos(seq) {
      if (seq.length === 0) return [];
      var res = seq.slice();
      for (var j = 1; j < res.length - 1; j++) {
        if (res[j].tipo === "igual") {
          var antesMod = res[j - 1].tipo === "modificado";
          // Comprobar si el tramo "igual" tiene longitud 1 o 2
          var lenIgual = 1;
          if (j + 1 < res.length && res[j + 1].tipo === "igual") {
            lenIgual = 2;
          }
          var despuesIdx = j + lenIgual;
          var despuesMod = despuesIdx < res.length && res[despuesIdx].tipo === "modificado";

          if (antesMod && despuesMod && lenIgual <= 2) {
            // No fusionar si es un espacio o salto crucial a menos que sea muy obvio
            res[j].tipo = "modificado";
            if (lenIgual === 2) {
              res[j + 1].tipo = "modificado";
            }
          }
        }
      }
      return res;
    }

    var seqAFusionada = fusionarFragmentosCortos(seqA);
    var seqBFusionada = fusionarFragmentosCortos(seqB);

    // Agrupar caracteres contiguos en chunks
    function agruparChunks(seq) {
      if (seq.length === 0) return [];
      var chunks = [];
      var currTexto = seq[0].char;
      var currTipo = seq[0].tipo;

      for (var k = 1; k < seq.length; k++) {
        if (seq[k].tipo === currTipo) {
          currTexto += seq[k].char;
        } else {
          chunks.push({ texto: currTexto, tipo: currTipo });
          currTexto = seq[k].char;
          currTipo = seq[k].tipo;
        }
      }
      chunks.push({ texto: currTexto, tipo: currTipo });
      return chunks;
    }

    var chunksA = agruparChunks(seqAFusionada);
    var chunksB = agruparChunks(seqBFusionada);

    var charsModA = 0;
    var charsModB = 0;
    var charsIguales = 0;

    for (var ca = 0; ca < chunksA.length; ca++) {
      if (chunksA[ca].tipo === "modificado") {
        charsModA += Array.from(chunksA[ca].texto).length;
      } else {
        charsIguales += Array.from(chunksA[ca].texto).length;
      }
    }

    for (var cb = 0; cb < chunksB.length; cb++) {
      if (chunksB[cb].tipo === "modificado") {
        charsModB += Array.from(chunksB[cb].texto).length;
      }
    }

    return {
      chunksA: chunksA,
      chunksB: chunksB,
      charsModificadosA: charsModA,
      charsModificadosB: charsModB,
      charsIguales: charsIguales,
      degradado: false
    };
  };

  /**
   * Ejecuta el diff completo en dos niveles entre textoA y textoB.
   * @param {string} textoA
   * @param {string} textoB
   * @param {Object} opciones
   * @returns {Object} Resultado estructurado con filas alineadas y estadísticas
   */
  DUtilsDiffCore.compararTextos = function (textoA, textoB, opciones) {
    opciones = opciones || {};

    var lineasA = DUtilsDiffCore.tokenizarLineas(textoA, opciones);
    var lineasB = DUtilsDiffCore.tokenizarLineas(textoB, opciones);

    // Nivel 1: Diff de líneas
    var diffLineas = DUtilsDiffCore.myersDiff(lineasA, lineasB);

    // Agrupación de bloques contiguos "eliminadas + añadidas" para emparejamiento inteligente
    var filas = [];
    var i = 0;

    var totalLineasIguales = 0;
    var totalLineasEliminadas = 0;
    var totalLineasAnadidas = 0;
    var totalLineasModificadas = 0;

    var totalCharsEliminados = 0;
    var totalCharsAnadidos = 0;
    var totalCharsModificadosA = 0;
    var totalCharsModificadosB = 0;
    var totalCharsIguales = 0;

    var numLadoA = 1;
    var numLadoB = 1;

    while (i < diffLineas.length) {
      var item = diffLineas[i];

      if (item.op === "igual") {
        var lenLinea = Array.from(item.token.original).length;
        totalCharsIguales += lenLinea;
        totalLineasIguales++;

        filas.push({
          tipo: "igual",
          ladoA: {
            linea: item.token.original,
            num: numLadoA++,
            chunks: [{ texto: item.token.original, tipo: "igual" }]
          },
          ladoB: {
            linea: item.tokenB.original,
            num: numLadoB++,
            chunks: [{ texto: item.tokenB.original, tipo: "igual" }]
          }
        });
        i++;
      } else {
        // Bloque de cambios contiguos
        var delTokens = [];
        var insTokens = [];

        while (i < diffLineas.length && diffLineas[i].op !== "igual") {
          if (diffLineas[i].op === "eliminar") {
            delTokens.push(diffLineas[i].token);
          } else if (diffLineas[i].op === "insertar") {
            insTokens.push(diffLineas[i].token);
          }
          i++;
        }

        var paresMod = Math.min(delTokens.length, insTokens.length);

        // 1. Emparejar líneas modificadas (Nivel 2)
        for (var p = 0; p < paresMod; p++) {
          var tA = delTokens[p];
          var tB = insTokens[p];
          var diffChars = DUtilsDiffCore.diffCaracteresLinea(tA.original, tB.original, opciones);

          totalLineasModificadas++;
          totalCharsModificadosA += diffChars.charsModificadosA;
          totalCharsModificadosB += diffChars.charsModificadosB;
          totalCharsIguales += diffChars.charsIguales;

          filas.push({
            tipo: "modificado",
            ladoA: {
              linea: tA.original,
              num: numLadoA++,
              chunks: diffChars.chunksA,
              degradado: diffChars.degradado
            },
            ladoB: {
              linea: tB.original,
              num: numLadoB++,
              chunks: diffChars.chunksB,
              degradado: diffChars.degradado
            }
          });
        }

        // 2. Líneas restantes eliminadas puras
        for (var d = paresMod; d < delTokens.length; d++) {
          var tokA = delTokens[d];
          var lenA = Array.from(tokA.original).length;
          totalLineasEliminadas++;
          totalCharsEliminados += lenA;

          filas.push({
            tipo: "eliminado",
            ladoA: {
              linea: tokA.original,
              num: numLadoA++,
              chunks: [{ texto: tokA.original, tipo: "eliminado" }]
            },
            ladoB: null
          });
        }

        // 3. Líneas restantes añadidas puras
        for (var aIdx = paresMod; aIdx < insTokens.length; aIdx++) {
          var tokB = insTokens[aIdx];
          var lenB = Array.from(tokB.original).length;
          totalLineasAnadidas++;
          totalCharsAnadidos += lenB;

          filas.push({
            tipo: "anadido",
            ladoA: null,
            ladoB: {
              linea: tokB.original,
              num: numLadoB++,
              chunks: [{ texto: tokB.original, tipo: "anadido" }]
            }
          });
        }
      }
    }

    // Si hay líneas completas iguales, los saltos de línea intermedios también son iguales
    if (totalLineasIguales > 1) {
      totalCharsIguales += (totalLineasIguales - 1);
    }

    var sonIdenticos = (
      totalLineasEliminadas === 0 &&
      totalLineasAnadidas === 0 &&
      totalLineasModificadas === 0 &&
      totalCharsEliminados === 0 &&
      totalCharsAnadidos === 0 &&
      totalCharsModificadosA === 0 &&
      totalCharsModificadosB === 0
    );

    // Porcentaje de similitud: Índice de Sørensen-Dice sobre caracteres
    // Similitud = (2 * iguales) / (longA + longB) * 100
    var codePointsTotalA = Array.from(textoA || "").length;
    var codePointsTotalB = Array.from(textoB || "").length;
    var sumaTotalChars = codePointsTotalA + codePointsTotalB;

    var similitud = 100;
    if (sonIdenticos) {
      similitud = 100;
      totalCharsIguales = codePointsTotalA;
    } else if (sumaTotalChars > 0) {
      similitud = Math.round(((2 * totalCharsIguales) / sumaTotalChars) * 100);
      if (similitud > 100) similitud = 100;
    }

    return {
      filas: filas,
      sonIdenticos: sonIdenticos,
      resumenDiff: {
        lineasIguales: totalLineasIguales,
        lineasEliminadas: totalLineasEliminadas,
        lineasAnadidas: totalLineasAnadidas,
        lineasModificadas: totalLineasModificadas,
        charsIguales: totalCharsIguales,
        charsEliminados: totalCharsEliminados,
        charsAnadidos: totalCharsAnadidos,
        charsModificadosA: totalCharsModificadosA,
        charsModificadosB: totalCharsModificadosB,
        charsModificadosTotal: totalCharsModificadosA + totalCharsModificadosB,
        similitudPorcentaje: similitud,
        formulaSimilitud: "2 × chars_iguales / (total_A + total_B)"
      }
    };
  };

  /**
   * Calcula estadísticas detalladas de composición de un texto usando propiedades Unicode.
   * @param {string} texto
   * @returns {Object}
   */
  DUtilsDiffCore.analizarComposicion = function (texto) {
    var str = texto || "";
    var codePoints = Array.from(str);
    var totalChars = codePoints.length;

    var totalSinEspacios = 0;
    var letras = 0;
    var mayusculas = 0;
    var minusculas = 0;
    var digitos = 0;
    var espacios = 0;
    var tabuladores = 0;
    var saltosLinea = 0;
    var puntuacion = 0;
    var otrosYSymbols = 0;

    // Conteo por código Unicode usando RegExp con flag 'u'
    var regexLetra = /^\p{L}$/u;
    var regexMayus = /^\p{Lu}$/u;
    var regexMinus = /^\p{Ll}$/u;
    var regexDigito = /^\p{N}$/u;
    var regexPunt = /^\p{P}$/u;
    var regexEspacioBlanco = /^\s$/u;

    for (var i = 0; i < codePoints.length; i++) {
      var cp = codePoints[i];

      if (cp === "\n") {
        saltosLinea++;
      } else if (cp === "\t") {
        tabuladores++;
      } else if (cp === " ") {
        espacios++;
      } else if (regexEspacioBlanco.test(cp)) {
        espacios++;
      } else {
        totalSinEspacios++;
      }

      if (regexLetra.test(cp)) {
        letras++;
        if (regexMayus.test(cp)) {
          mayusculas++;
        } else if (regexMinus.test(cp)) {
          minusculas++;
        }
      } else if (regexDigito.test(cp)) {
        digitos++;
      } else if (regexPunt.test(cp)) {
        puntuacion++;
      } else if (!regexEspacioBlanco.test(cp)) {
        otrosYSymbols++;
      }
    }

    // Conteo de palabras (secuencias continuas de letras/números Unicode)
    var palabrasCoincidencias = str.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu);
    var palabras = palabrasCoincidencias ? palabrasCoincidencias.length : 0;

    // Conteo de líneas
    var lineas = str === "" ? 0 : str.split(/\r\n|\r|\n/).length;

    return {
      totalChars: totalChars,
      totalSinEspacios: totalSinEspacios,
      palabras: palabras,
      lineas: lineas,
      letras: letras,
      mayusculas: mayusculas,
      minusculas: minusculas,
      digitos: digitos,
      espacios: espacios,
      tabuladores: tabuladores,
      saltosLinea: saltosLinea,
      puntuacion: puntuacion,
      otrosYSymbols: otrosYSymbols
    };
  };

  // Exportar al ámbito global o módulo
  if (typeof module !== "undefined" && module.exports) {
    module.exports = DUtilsDiffCore;
  } else {
    global.DUtilsDiffCore = DUtilsDiffCore;
  }
})(typeof window !== "undefined" ? window : this);
