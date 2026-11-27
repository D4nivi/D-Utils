/* =========================================================
   D-Utils · Codificador GIF89a Común (100% JavaScript en local)
   - Cuantización de color Median-Cut (hasta 256 colores)
   - Soporte completo de transparencia (canal alfa -> índice transparente)
   - Compresión LZW estándar con sub-bloques GIF89a
   - Control de repeticiones (Netscape 2.0: 0 = infinito)
   ========================================================= */
(function (global) {
  "use strict";

  var ns = (global.DUtilsVideoGif = global.DUtilsVideoGif || {});

  /**
   * Buffer de bytes dinámico para construir el archivo GIF.
   */
  function FlujoBytes() {
    this.bloques = [];
    this.actual = new Uint8Array(65536);
    this.pos = 0;
  }

  FlujoBytes.prototype.escribirByte = function (b) {
    if (this.pos >= this.actual.length) {
      this.bloques.push(this.actual);
      this.actual = new Uint8Array(65536);
      this.pos = 0;
    }
    this.actual[this.pos++] = b & 0xff;
  };

  FlujoBytes.prototype.escribirEntero16 = function (v) {
    this.escribirByte(v & 0xff);
    this.escribirByte((v >> 8) & 0xff);
  };

  FlujoBytes.prototype.escribirTexto = function (txt) {
    for (var i = 0; i < txt.length; i++) {
      this.escribirByte(txt.charCodeAt(i));
    }
  };

  FlujoBytes.prototype.escribirBytes = function (arr) {
    for (var i = 0; i < arr.length; i++) {
      this.escribirByte(arr[i]);
    }
  };

  FlujoBytes.prototype.aUint8Array = function () {
    var total = this.pos;
    for (var i = 0; i < this.bloques.length; i++) {
      total += this.bloques[i].length;
    }
    var salida = new Uint8Array(total);
    var offset = 0;
    for (var j = 0; j < this.bloques.length; j++) {
      salida.set(this.bloques[j], offset);
      offset += this.bloques[j].length;
    }
    salida.set(this.actual.subarray(0, this.pos), offset);
    return salida;
  };

  /**
   * Cuantizador Median-Cut para reducir píxeles RGBA a una paleta de hasta N colores.
   */
  function cuantizarMedianCut(rgba, maxColores, usarTransparencia) {
    var totalPixeles = rgba.length >> 2;
    // Muestreo adaptativo para mantener velocidad en vídeos grandes
    var paso = Math.max(1, Math.floor(totalPixeles / 20000));
    var muestras = [];
    var hayTransparencia = false;

    for (var i = 0; i < totalPixeles; i += paso) {
      var idx = i << 2;
      var a = rgba[idx + 3];
      if (usarTransparencia && a < 128) {
        hayTransparencia = true;
        continue;
      }
      muestras.push([rgba[idx], rgba[idx + 1], rgba[idx + 2]]);
    }

    // Si no se encontraron píxeles transparentes en el muestreo, verificar rápidamente si hay alguno
    if (usarTransparencia && !hayTransparencia) {
      for (var k = 3; k < rgba.length; k += 4) {
        if (rgba[k] < 128) {
          hayTransparencia = true;
          break;
        }
      }
    }

    var limite = hayTransparencia ? maxColores - 1 : maxColores;
    var paleta = [];

    if (hayTransparencia) {
      // El índice 0 se reserva para el color transparente
      paleta.push([0, 0, 0]);
    }

    if (muestras.length === 0) {
      while (paleta.length < 256) paleta.push([0, 0, 0]);
      return { paleta: paleta, indiceTransparente: hayTransparencia ? 0 : -1 };
    }

    var cajas = [muestras];
    while (cajas.length < limite) {
      // Buscar la caja con mayor rango en algún canal RGB
      var mejorCajaIdx = -1;
      var mejorRango = -1;
      var mejorCanal = 0;

      for (var c = 0; c < cajas.length; c++) {
        var caja = cajas[c];
        if (caja.length < 2) continue;

        var minR = 255, maxR = 0;
        var minG = 255, maxG = 0;
        var minB = 255, maxB = 0;

        for (var p = 0; p < caja.length; p++) {
          var px = caja[p];
          if (px[0] < minR) minR = px[0];
          if (px[0] > maxR) maxR = px[0];
          if (px[1] < minG) minG = px[1];
          if (px[1] > maxG) maxG = px[1];
          if (px[2] < minB) minB = px[2];
          if (px[2] > maxB) maxB = px[2];
        }

        var rR = maxR - minR;
        var rG = maxG - minG;
        var rB = maxB - minB;
        var rangoMax = Math.max(rR, rG, rB);

        if (rangoMax > mejorRango) {
          mejorRango = rangoMax;
          mejorCajaIdx = c;
          mejorCanal = rangoMax === rR ? 0 : (rangoMax === rG ? 1 : 2);
        }
      }

      if (mejorCajaIdx === -1 || mejorRango === 0) break;

      var cajaADividir = cajas.splice(mejorCajaIdx, 1)[0];
      cajaADividir.sort(function (a, b) {
        return a[mejorCanal] - b[mejorCanal];
      });
      var mitad = cajaADividir.length >> 1;
      cajas.push(cajaADividir.slice(0, mitad));
      cajas.push(cajaADividir.slice(mitad));
    }

    for (var b = 0; b < cajas.length; b++) {
      var grupo = cajas[b];
      var sumR = 0, sumG = 0, sumB = 0;
      for (var m = 0; m < grupo.length; m++) {
        sumR += grupo[m][0];
        sumG += grupo[m][1];
        sumB += grupo[m][2];
      }
      var n = grupo.length || 1;
      paleta.push([
        Math.round(sumR / n),
        Math.round(sumG / n),
        Math.round(sumB / n)
      ]);
    }

    while (paleta.length < 256) {
      paleta.push([0, 0, 0]);
    }

    return {
      paleta: paleta,
      indiceTransparente: hayTransparencia ? 0 : -1
    };
  }

  /**
   * Mapea los píxeles RGBA a índices de la paleta usando una caché 5-bit RGB (32x32x32).
   */
  function mapearPixelesAPaleta(rgba, paleta, indiceTransparente) {
    var total = rgba.length >> 2;
    var indices = new Uint8Array(total);
    var cache = new Int16Array(32768);
    cache.fill(-1);

    var inicio = indiceTransparente === 0 ? 1 : 0;

    for (var i = 0; i < total; i++) {
      var off = i << 2;
      var a = rgba[off + 3];
      if (indiceTransparente !== -1 && a < 128) {
        indices[i] = indiceTransparente;
        continue;
      }

      var r = rgba[off];
      var g = rgba[off + 1];
      var b = rgba[off + 2];
      var clave = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);

      var cached = cache[clave];
      if (cached !== -1) {
        indices[i] = cached;
        continue;
      }

      var mejorIdx = inicio;
      var mejorDist = Infinity;
      for (var p = inicio; p < 256; p++) {
        var col = paleta[p];
        var dr = r - col[0];
        var dg = g - col[1];
        var db = b - col[2];
        var dist = dr * dr + dg * dg + db * db;
        if (dist < mejorDist) {
          mejorDist = dist;
          mejorIdx = p;
          if (dist === 0) break;
        }
      }

      cache[clave] = mejorIdx;
      indices[i] = mejorIdx;
    }

    return indices;
  }

  /**
   * Compresor LZW para GIF89a con tamaño mínimo de código de 8 bits (paleta de 256).
   */
  function escribirLZW(flujo, indices) {
    var minCodeSize = 8;
    flujo.escribirByte(minCodeSize);

    var clearCode = 1 << minCodeSize; // 256
    var eoiCode = clearCode + 1;      // 257
    var codeSize = minCodeSize + 1;   // 9
    var nextCode = eoiCode + 1;       // 258
    var maxCode = 1 << codeSize;      // 512

    // Tabla hash rápida para pares (prefijo, sufijo)
    var TAM_TABLA = 5003;
    var tablaClaves = new Int32Array(TAM_TABLA);
    var tablaCodigos = new Int16Array(TAM_TABLA);
    tablaClaves.fill(-1);

    var subBloque = new Uint8Array(255);
    var subPos = 0;
    var acumBits = 0;
    var cantBits = 0;

    function volcarSubBloque() {
      if (subPos > 0) {
        flujo.escribirByte(subPos);
        for (var i = 0; i < subPos; i++) {
          flujo.escribirByte(subBloque[i]);
        }
        subPos = 0;
      }
    }

    function emitirCodigo(codigo) {
      acumBits |= codigo << cantBits;
      cantBits += codeSize;
      while (cantBits >= 8) {
        subBloque[subPos++] = acumBits & 0xff;
        if (subPos === 255) {
          volcarSubBloque();
        }
        acumBits >>= 8;
        cantBits -= 8;
      }
    }

    function reiniciarDiccionario() {
      tablaClaves.fill(-1);
      codeSize = minCodeSize + 1;
      maxCode = 1 << codeSize;
      nextCode = eoiCode + 1;
    }

    emitirCodigo(clearCode);

    if (indices.length === 0) {
      emitirCodigo(eoiCode);
    } else {
      var prefijo = indices[0];
      for (var i = 1; i < indices.length; i++) {
        var sufijo = indices[i];
        var claveCombinada = (prefijo << 8) | sufijo;
        var hash = ((prefijo << 4) ^ sufijo) % TAM_TABLA;
        if (hash < 0) hash += TAM_TABLA;

        var encontrado = false;
        while (tablaClaves[hash] !== -1) {
          if (tablaClaves[hash] === claveCombinada) {
            prefijo = tablaCodigos[hash];
            encontrado = true;
            break;
          }
          hash = (hash + 1) % TAM_TABLA;
        }

        if (!encontrado) {
          emitirCodigo(prefijo);
          if (nextCode < 4096) {
            tablaClaves[hash] = claveCombinada;
            tablaCodigos[hash] = nextCode++;
            if (nextCode > maxCode && codeSize < 12) {
              codeSize++;
              maxCode = 1 << codeSize;
            }
          } else {
            emitirCodigo(clearCode);
            reiniciarDiccionario();
          }
          prefijo = sufijo;
        }
      }
      emitirCodigo(prefijo);
      emitirCodigo(eoiCode);
    }

    if (cantBits > 0) {
      subBloque[subPos++] = acumBits & 0xff;
    }
    volcarSubBloque();
    flujo.escribirByte(0); // Terminador de bloque
  }

  /**
   * Codifica una lista de fotogramas RGBA en un Blob image/gif.
   *
   * @param {Object} params
   * @param {number} params.ancho - Ancho en píxeles.
   * @param {number} params.alto - Alto en píxeles.
   * @param {Array<{rgba: Uint8ClampedArray, retardoMs: number}>} params.fotogramas
   * @param {number} [params.repeticiones=0] - 0 para bucle infinito, >0 para número exacto.
   * @param {boolean} [params.transparencia=false] - Preservar canal alfa.
   * @param {Function} [params.onProgreso] - Callback (0..1).
   * @returns {Promise<Blob>}
   */
  async function codificar(params) {
    var ancho = params.ancho;
    var alto = params.alto;
    var fotogramas = params.fotogramas || [];
    var repeticiones = typeof params.repeticiones === "number" ? Math.max(0, Math.floor(params.repeticiones)) : 0;
    var transparencia = !!params.transparencia;
    var onProgreso = typeof params.onProgreso === "function" ? params.onProgreso : null;

    var flujo = new FlujoBytes();

    // 1. Cabecera GIF89a
    flujo.escribirTexto("GIF89a");

    // 2. Descriptor lógico de pantalla (sin tabla de color global; cada fotograma usa tabla local)
    flujo.escribirEntero16(ancho);
    flujo.escribirEntero16(alto);
    flujo.escribirByte(0x70); // Bit 7 = 0 (sin GCT), resolución de color 8 bits
    flujo.escribirByte(0x00); // Índice de color de fondo
    flujo.escribirByte(0x00); // Proporción de píxel

    // 3. Extensión de aplicación Netscape 2.0 (control de repeticiones)
    flujo.escribirByte(0x21); // Extension Introducer
    flujo.escribirByte(0xff); // Application Extension Label
    flujo.escribirByte(0x0b); // Block Size (11 bytes)
    flujo.escribirTexto("NETSCAPE2.0");
    flujo.escribirByte(0x03); // Sub-block size
    flujo.escribirByte(0x01); // Sub-block ID
    flujo.escribirEntero16(repeticiones); // 0 = infinito
    flujo.escribirByte(0x00); // Block Terminator

    // 4. Codificar cada fotograma
    for (var i = 0; i < fotogramas.length; i++) {
      var frame = fotogramas[i];
      var retardoCs = Math.max(2, Math.round((frame.retardoMs || 100) / 10)); // en centésimas de segundo

      var resCuant = cuantizarMedianCut(frame.rgba, 256, transparencia);
      var indices = mapearPixelesAPaleta(frame.rgba, resCuant.paleta, resCuant.indiceTransparente);
      var tieneAlfa = resCuant.indiceTransparente !== -1;

      // Graphic Control Extension
      flujo.escribirByte(0x21);
      flujo.escribirByte(0xf9);
      flujo.escribirByte(0x04);
      // Disposal method: 2 (Restore to background) si hay transparencia, 1 (Do not dispose) si es opaco
      var packedGce = (tieneAlfa ? 2 << 2 : 1 << 2) | (tieneAlfa ? 1 : 0);
      flujo.escribirByte(packedGce);
      flujo.escribirEntero16(retardoCs);
      flujo.escribirByte(tieneAlfa ? resCuant.indiceTransparente : 0);
      flujo.escribirByte(0x00);

      // Image Descriptor
      flujo.escribirByte(0x2c);
      flujo.escribirEntero16(0); // Left
      flujo.escribirEntero16(0); // Top
      flujo.escribirEntero16(ancho);
      flujo.escribirEntero16(alto);
      flujo.escribirByte(0x87); // Local Color Table Flag = 1, Size = 7 (2^(7+1) = 256 colores)

      // Local Color Table (256 * 3 bytes)
      for (var c = 0; c < 256; c++) {
        var rgb = resCuant.paleta[c];
        flujo.escribirByte(rgb[0]);
        flujo.escribirByte(rgb[1]);
        flujo.escribirByte(rgb[2]);
      }

      // Datos de imagen LZW
      escribirLZW(flujo, indices);

      if (onProgreso) {
        onProgreso((i + 1) / fotogramas.length);
      }

      // Ceder el hilo principal cada 3 fotogramas para mantener fluida la interfaz
      if (i % 3 === 2) {
        await new Promise(function (r) { setTimeout(r, 0); });
      }
    }

    // 5. Trailer GIF
    flujo.escribirByte(0x3b);

    return new Blob([flujo.aUint8Array()], { type: "image/gif" });
  }

  ns.CodificadorGIF = {
    codificar: codificar
  };
})(window);
