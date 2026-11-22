/* =========================================================
   D-Utils · Fondo Dinámico Táctico: Nebulosas Orgánicas y
   Rejilla Reactiva con Curvatura Gravitatoria
   - Fondo interactivo en tiempo real sobre <canvas>
   - Nubes de color cromáticas y fluidas (estética cyberpunk/anime/HUD)
   - Deformación del espacio-tiempo al mover el ratón (lente gravitatoria)
   - Compatible con temas claro y oscuro de D-Utils
   - Detección de DPR, resize, visibilidad de pestaña y accesibilidad (prefers-reduced-motion)
   - Cero dependencias externas, puro código nativo optimizado
   ========================================================= */
(function () {
  "use strict";

  // ▼▼▼ CONFIGURACIÓN Y PARÁMETROS CLAVE AJUSTABLES ▼▼▼ ----------------
  var CONFIG = {
    // 1. Rejilla y física gravitatoria
    tamanoRejilla: 42,          // Densidad: distancia entre líneas en píxeles (menor = más líneas)
    radioGravedad: 230,         // Radio de influencia gravitatoria alrededor del cursor (en px)
    fuerzaGravedad: 0.26,       // Fuerza de atracción hacia el cursor (0 = plano, 1 = máxima atracción)
    suavizadoRaton: 0.08,       // Inercia/lerp del cursor (0.02 = muy fluido/lento, 0.2 = inmediato)
    inerciaRetorno: 0.045,      // Velocidad de retorno a plano cuando el ratón sale de la ventana

    // 2. Nebulosas orgánicas y ciclado cromático
    velocidadDeriva: 0.00045,   // Velocidad de deriva espacial de las nubes (menor = más zen)
    velocidadCromatica: 0.0003, // Velocidad de rotación tonal (hue shift)
    radioNebulosaMin: 0.35,     // Radio mínimo relativo de las nubes respecto a la pantalla
    radioNebulosaMax: 0.55,     // Radio máximo relativo

    // 3. Estética táctica y HUD
    mostrarNodos: true,         // Dibuja micro-cruces tácticas en las intersecciones del grid
    tamanoNodos: 3,             // Longitud en px de los brazos de las micro-cruces
    haloCursor: true,           // Resplandor de lente luminosa centrado en el ratón
    radioHalo: 260              // Radio del halo luminoso
  };
  // ▲▲▲ CONFIGURACIÓN Y PARÁMETROS CLAVE AJUSTABLES ▲▲▲ ----------------

  var canvas = null;
  var ctx = null;
  var animId = null;
  var ejecutando = false;

  var ancho = 0;
  var alto = 0;
  var dpr = 1;

  // Seguimiento del cursor y su inercia
  var ratonObjetivoX = -9999;
  var ratonObjetivoY = -9999;
  var ratonActualX = -9999;
  var ratonActualY = -9999;
  var actividadRaton = 0; // 0 = reposo plano, 1 = máxima deformación
  var ratonEnPantalla = false;

  // Estado temporal y cromático
  var ultimoTiempo = 0;
  var tiempoAcumulado = 0;
  var offsetHue = 0;

  // Detección de tema
  var esOscuro = true;

  // Reducción de movimiento accesible
  var mediaReducirMovimiento = null;

  // Definición de las nebulosas armónicas (estética Cyberpunk / Anime Sci-Fi)
  var nebulosas = [
    {
      baseHue: 184, // Cian Neón táctico (--accent en oscuro)
      frecX: 0.9,
      frecY: 0.7,
      faseX: 0.0,
      faseY: 1.5,
      centroX: 0.25,
      centroY: 0.25,
      ampX: 0.20,
      ampY: 0.18,
      radioRel: 0.42
    },
    {
      baseHue: 334, // Magenta Neotokyo (--accent-sec)
      frecX: 0.7,
      frecY: 1.1,
      faseX: 2.5,
      faseY: 0.4,
      centroX: 0.80,
      centroY: 0.75,
      ampX: 0.18,
      ampY: 0.22,
      radioRel: 0.45
    },
    {
      baseHue: 270, // Ultravioleta profundo / Índigo
      frecX: 0.8,
      frecY: 0.6,
      faseX: 4.1,
      faseY: 3.2,
      centroX: 0.70,
      centroY: 0.22,
      ampX: 0.22,
      ampY: 0.16,
      radioRel: 0.38
    },
    {
      baseHue: 156, // Menta esmeralda (--accent-ok)
      frecX: 0.6,
      frecY: 0.85,
      faseX: 1.8,
      faseY: 4.7,
      centroX: 0.20,
      centroY: 0.82,
      ampX: 0.16,
      ampY: 0.20,
      radioRel: 0.35
    }
  ];

  // Búfer reutilizable para los vértices deformados (optimización sin recolección de basura)
  var puntosDeformados = [];

  function actualizarTemaActual(nuevoTema) {
    if (nuevoTema) {
      esOscuro = nuevoTema === "dark";
    } else {
      var attr = document.documentElement.getAttribute("data-theme");
      esOscuro = attr ? attr === "dark" : true;
    }
  }

  function crearOEncontrarCanvas() {
    canvas = document.getElementById("dutils-fondo-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "dutils-fondo-canvas";
      canvas.setAttribute("aria-hidden", "true");
      // Se inserta antes que cualquier otro nodo para quedar de fondo fijo
      if (document.body) {
        document.body.insertBefore(canvas, document.body.firstChild);
      } else {
        document.documentElement.appendChild(canvas);
      }
    }
    ctx = canvas.getContext("2d", { alpha: false });
  }

  function redimensionar() {
    if (!canvas || !ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    ancho = window.innerWidth;
    alto = window.innerHeight;

    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);
    canvas.style.width = ancho + "px";
    canvas.style.height = alto + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Si el usuario prefiere movimiento reducido, redibujamos el fotograma estático
    if (mediaReducirMovimiento && mediaReducirMovimiento.matches) {
      renderizarFotogramaEstatico();
    }
  }

  // ---------- FÍSICA Y RENDERIZADO DEL FONDO ----------

  function dibujarNebulosas() {
    // Fondo base del tema
    var colorFondo = esOscuro ? "#090d16" : "#f3f6fa";
    ctx.fillStyle = colorFondo;
    ctx.fillRect(0, 0, ancho, alto);

    var escalaMin = Math.min(ancho, alto);
    var t = tiempoAcumulado * CONFIG.velocidadDeriva;

    for (var i = 0; i < nebulosas.length; i++) {
      var neb = nebulosas[i];

      // Posición orbital sinusoidal orgánica
      var nx = ancho * (neb.centroX + neb.ampX * Math.sin(t * neb.frecX + neb.faseX));
      var ny = alto * (neb.centroY + neb.ampY * Math.cos(t * neb.frecY + neb.faseY));

      // Radio dinámico con suave pulsación
      var radioPulsado = neb.radioRel * (1 + 0.12 * Math.sin(t * 1.2 + neb.faseX));
      var radio = escalaMin * radioPulsado;

      // Color cíclico HSL
      var hue = (neb.baseHue + offsetHue + 18 * Math.sin(t * 0.8 + neb.faseY)) % 360;
      if (hue < 0) hue += 360;

      var grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, radio);

      if (esOscuro) {
        // Tema oscuro: brillo de neón ambiental profundo
        grad.addColorStop(0.0, "hsla(" + hue + ", 95%, 52%, 0.12)");
        grad.addColorStop(0.45, "hsla(" + ((hue + 15) % 360) + ", 90%, 46%, 0.05)");
        grad.addColorStop(1.0, "hsla(" + hue + ", 95%, 50%, 0)");
      } else {
        // Tema claro: atmósfera etérea de laboratorio táctico (sutil para preservar legibilidad)
        grad.addColorStop(0.0, "hsla(" + hue + ", 85%, 58%, 0.055)");
        grad.addColorStop(0.5, "hsla(" + ((hue + 12) % 360) + ", 80%, 64%, 0.022)");
        grad.addColorStop(1.0, "hsla(" + hue + ", 85%, 60%, 0)");
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(nx, ny, radio, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function calcularYRenderizarRejilla() {
    var paso = CONFIG.tamanoRejilla;
    var cols = Math.ceil(ancho / paso) + 1;
    var filas = Math.ceil(alto / paso) + 1;

    var rGrav = CONFIG.radioGravedad;
    var rGrav2 = rGrav * rGrav;
    var fuerza = CONFIG.fuerzaGravedad * actividadRaton;

    var mx = ratonActualX;
    var my = ratonActualY;

    // Redimensionar matriz de puntos si varió la resolución
    if (puntosDeformados.length !== cols) {
      puntosDeformados = new Array(cols);
      for (var c = 0; c < cols; c++) {
        puntosDeformados[c] = new Array(filas);
        for (var f = 0; f < filas; f++) {
          puntosDeformados[c][f] = { x: 0, y: 0, d: 9999, influenciado: false };
        }
      }
    }

    // 1. Cálculo de deformación espacial (Curvatura Gravitatoria)
    for (var i = 0; i < cols; i++) {
      var x0 = i * paso;
      for (var j = 0; j < filas; j++) {
        var y0 = j * paso;
        var p = puntosDeformados[i][j];

        if (fuerza > 0.001) {
          var dx = x0 - mx;
          var dy = y0 - my;
          var d2 = dx * dx + dy * dy;

          if (d2 < rGrav2) {
            var d = Math.sqrt(d2);
            var q = 1 - (d / rGrav);
            // Factor cúbico Hermite (smoothstep): pendiente suave en borde y centro
            var peso = q * q * (3 - 2 * q) * fuerza;

            // Atracción hacia el centro de gravedad (signo negativo desplaza hacia el cursor)
            p.x = x0 - dx * peso;
            p.y = y0 - dy * peso;
            p.d = d;
            p.influenciado = true;
            continue;
          }
        }

        p.x = x0;
        p.y = y0;
        p.d = 9999;
        p.influenciado = false;
      }
    }

    // 2. Trazado de líneas de la rejilla
    var colorLinea = esOscuro ? "rgba(0, 240, 255, 0.04)" : "rgba(13, 22, 36, 0.045)";
    ctx.lineWidth = 1;
    ctx.strokeStyle = colorLinea;

    // Líneas verticales (siguen la deformación vertical)
    ctx.beginPath();
    for (var col = 0; col < cols; col++) {
      var pInicioV = puntosDeformados[col][0];
      ctx.moveTo(pInicioV.x, pInicioV.y);
      for (var rowV = 1; rowV < filas; rowV++) {
        var pV = puntosDeformados[col][rowV];
        ctx.lineTo(pV.x, pV.y);
      }
    }
    ctx.stroke();

    // Líneas horizontales (siguen la deformación horizontal)
    ctx.beginPath();
    for (var fila = 0; fila < filas; fila++) {
      var pInicioH = puntosDeformados[0][fila];
      ctx.moveTo(pInicioH.x, pInicioH.y);
      for (var colH = 1; colH < cols; colH++) {
        var pH = puntosDeformados[colH][fila];
        ctx.lineTo(pH.x, pH.y);
      }
    }
    ctx.stroke();

    // 3. Resplandor / Halo gravitatorio del cursor
    if (CONFIG.haloCursor && actividadRaton > 0.02) {
      var rHalo = CONFIG.radioHalo;
      var gradHalo = ctx.createRadialGradient(mx, my, 0, mx, my, rHalo);
      if (esOscuro) {
        gradHalo.addColorStop(0.0, "rgba(0, 240, 255, " + (0.09 * actividadRaton) + ")");
        gradHalo.addColorStop(0.5, "rgba(0, 240, 255, " + (0.03 * actividadRaton) + ")");
        gradHalo.addColorStop(1.0, "rgba(0, 240, 255, 0)");
      } else {
        gradHalo.addColorStop(0.0, "rgba(0, 119, 182, " + (0.07 * actividadRaton) + ")");
        gradHalo.addColorStop(0.5, "rgba(0, 119, 182, " + (0.02 * actividadRaton) + ")");
        gradHalo.addColorStop(1.0, "rgba(0, 119, 182, 0)");
      }
      ctx.fillStyle = gradHalo;
      ctx.beginPath();
      ctx.arc(mx, my, rHalo, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Micro-cruces tácticas en los nodos influenciados
    if (CONFIG.mostrarNodos && actividadRaton > 0.02) {
      var brazo = CONFIG.tamanoNodos;
      ctx.lineWidth = 1;

      for (var ni = 0; ni < cols; ni++) {
        for (var nj = 0; nj < filas; nj++) {
          var nodo = puntosDeformados[ni][nj];
          if (nodo.influenciado && nodo.d < rGrav) {
            var factorLuz = (1 - (nodo.d / rGrav)) * actividadRaton;
            var alfaNodo = esOscuro
              ? (0.12 + factorLuz * 0.55)
              : (0.10 + factorLuz * 0.40);

            var colorNodo = esOscuro
              ? "rgba(0, 240, 255, " + alfaNodo + ")"
              : "rgba(0, 119, 182, " + alfaNodo + ")";

            ctx.strokeStyle = colorNodo;
            ctx.beginPath();
            // Cruz táctica (+)
            ctx.moveTo(nodo.x - brazo, nodo.y);
            ctx.lineTo(nodo.x + brazo, nodo.y);
            ctx.moveTo(nodo.x, nodo.y - brazo);
            ctx.lineTo(nodo.x, nodo.y + brazo);
            ctx.stroke();
          }
        }
      }
    }
  }

  function bucleAnimacion(marcaTiempo) {
    if (!ejecutando) return;

    if (!ultimoTiempo) ultimoTiempo = marcaTiempo;
    var delta = Math.min(marcaTiempo - ultimoTiempo, 50); // Límite de 50ms para evitar saltos bruscos
    ultimoTiempo = marcaTiempo;

    tiempoAcumulado += delta;
    offsetHue = (offsetHue + delta * CONFIG.velocidadCromatica * 360) % 360;

    // Suavizado inercial del cursor (lerp)
    ratonActualX += (ratonObjetivoX - ratonActualX) * CONFIG.suavizadoRaton;
    ratonActualY += (ratonObjetivoY - ratonActualY) * CONFIG.suavizadoRaton;

    // Transición de la actividad gravitatoria
    if (ratonEnPantalla) {
      actividadRaton += (1 - actividadRaton) * 0.08;
    } else {
      actividadRaton += (0 - actividadRaton) * CONFIG.inerciaRetorno;
      if (actividadRaton < 0.001) actividadRaton = 0;
    }

    dibujarNebulosas();
    calcularYRenderizarRejilla();

    animId = window.requestAnimationFrame(bucleAnimacion);
  }

  function renderizarFotogramaEstatico() {
    // Para modo prefers-reduced-motion o estado congelado
    dibujarNebulosas();
    calcularYRenderizarRejilla();
  }

  // ---------- GESTIÓN DE EVENTOS Y ENTORNO ----------

  function onPointerMove(e) {
    ratonObjetivoX = e.clientX;
    ratonObjetivoY = e.clientY;
    ratonEnPantalla = true;

    // Si el cursor acaba de entrar por primera vez, inicializamos la posición sin salto
    if (ratonActualX < -1000) {
      ratonActualX = ratonObjetivoX;
      ratonActualY = ratonObjetivoY;
    }
  }

  function onPointerLeave() {
    ratonEnPantalla = false;
  }

  function onVisibilidadCambiada() {
    if (document.hidden) {
      pausar();
    } else {
      reanudar();
    }
  }

  function onPreferenciaMovimientoCambiada(e) {
    if (e.matches) {
      pausar();
      renderizarFotogramaEstatico();
    } else {
      reanudar();
    }
  }

  function pausar() {
    if (animId) {
      window.cancelAnimationFrame(animId);
      animId = null;
    }
    ejecutando = false;
  }

  function reanudar() {
    if (mediaReducirMovimiento && mediaReducirMovimiento.matches) {
      renderizarFotogramaEstatico();
      return;
    }
    if (!ejecutando) {
      ejecutando = true;
      ultimoTiempo = 0;
      animId = window.requestAnimationFrame(bucleAnimacion);
    }
  }

  function iniciar() {
    crearOEncontrarCanvas();
    actualizarTemaActual();
    redimensionar();

    mediaReducirMovimiento = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (mediaReducirMovimiento && mediaReducirMovimiento.addEventListener) {
      mediaReducirMovimiento.addEventListener("change", onPreferenciaMovimientoCambiada);
    }

    window.addEventListener("resize", redimensionar, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave, { passive: true });
    window.addEventListener("blur", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibilidadCambiada);

    // Observar cambios automáticos en el atributo data-theme del <html>
    if (window.MutationObserver) {
      var observadorTema = new MutationObserver(function (mutaciones) {
        for (var m = 0; m < mutaciones.length; m++) {
          if (mutaciones[m].attributeName === "data-theme") {
            actualizarTemaActual();
            if (!ejecutando) renderizarFotogramaEstatico();
            break;
          }
        }
      });
      observadorTema.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }

    if (mediaReducirMovimiento && mediaReducirMovimiento.matches) {
      renderizarFotogramaEstatico();
    } else {
      reanudar();
    }
  }

  // ---------- API PÚBLICA GLOBAL ----------
  window.DUtilsFondo = {
    config: CONFIG,
    iniciar: iniciar,
    pausar: pausar,
    reanudar: reanudar,
    redimensionar: redimensionar,
    actualizarTema: function (nuevoTema) {
      actualizarTemaActual(nuevoTema);
      if (!ejecutando) renderizarFotogramaEstatico();
    }
  };

  // Auto-arranque al cargar el DOM si no fue inicializado antes
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      if (!canvas) iniciar();
    });
  } else {
    iniciar();
  }
})();
