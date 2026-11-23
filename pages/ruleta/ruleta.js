/* =========================================================
   D-Utils · Ruleta para sorteos
   Motor de ruleta física, audio sintético, modos normal/avanzado
   100% en el navegador, sin librerías externas
   ========================================================= */

(function () {
  "use strict";

  // ---------- Constantes del Módulo ----------
  var TIEMPO_GIRO_MS = 5000; // Duración de giro constante (5 segundos)
  var V_IDLE = 0.0018; // Velocidad de rotación pasiva / en reposo
  var VALORES_PROBABILIDAD = [
    "auto", 1, 3, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 99
  ];

  // Paleta de colores vivos y contrastados estilo arcade / táctico
  var PALETA_COLORES = [
    "#00f0ff", // Cian eléctrico
    "#ff2a85", // Neón magenta
    "#ffb800", // Ámbar brillante
    "#00ff9f", // Verde esmeralda
    "#9d4edd", // Violeta láser
    "#ff6b35", // Naranja fuego
    "#3a86ff", // Azul cobalto
    "#06d6a0", // Turquesa
    "#f72585", // Rosa fucsia
    "#4cc9f0", // Celeste neón
    "#70e000", // Lima vibrante
    "#e0aaff"  // Lavanda luminoso
  ];

  // ---------- Motor de Audio Sintético (Web Audio API) ----------
  var audioCtx = null;

  function obtenerAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      var AudioCtor = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtor();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  var RuletaAudio = {
    // Sonido de clic / perno que cruza el puntero
    tick: function () {
      try {
        var ctx = obtenerAudioContext();
        if (!ctx) return;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(840 + Math.random() * 80, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.022);

        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.025);
      } catch (e) {
        /* Silenciar si el navegador bloquea audio */
      }
    },

    // Fanfarria / acorde armónico al detenerse en el ganador
    victoria: function () {
      try {
        var ctx = obtenerAudioContext();
        if (!ctx) return;
        var now = ctx.currentTime;
        var notas = [523.25, 659.25, 783.99, 1046.5]; // Acorde C5 - E5 - G5 - C6

        notas.forEach(function (freq, i) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          var tiempoInicio = now + i * 0.09;
          var duracion = 0.55;

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, tiempoInicio);

          gain.gain.setValueAtTime(0.001, tiempoInicio);
          gain.gain.linearRampToValueAtTime(0.06, tiempoInicio + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0005, tiempoInicio + duracion);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(tiempoInicio);
          osc.stop(tiempoInicio + duracion + 0.05);
        });
      } catch (e) {
        /* Silenciar */
      }
    }
  };

  // ---------- Estado Global de la Ruleta ----------
  var estado = {
    modo: "normal", // "normal" | "avanzado"
    opciones: [
      { id: 1, texto: "Opción 1", probModo: "auto", porcentajeReal: 25 },
      { id: 2, texto: "Opción 2", probModo: "auto", porcentajeReal: 25 },
      { id: 3, texto: "Opción 3", probModo: "auto", porcentajeReal: 25 },
      { id: 4, texto: "Opción 4", probModo: "auto", porcentajeReal: 25 }
    ],
    siguienteId: 5,
    anguloActual: 0,
    girando: false,
    ganadorActual: null,
    ultimoIndiceTick: -1
  };

  // Instantánea del conjunto de opciones antes de empezar a girar por primera vez
  var instantaneaInicial = null;

  function guardarInstantaneaInicial() {
    instantaneaInicial = JSON.parse(JSON.stringify(estado.opciones));
  }

  function invalidarInstantanea() {
    instantaneaInicial = null;
  }

  // ---------- Elementos del DOM ----------
  var els = {};

  function mapearElementos() {
    els.canvas = document.getElementById("canvas-ruleta");
    els.marcador = document.getElementById("marcador-top");
    els.btnLetItRide = document.getElementById("btn-let-it-ride");
    els.estadoGiro = document.getElementById("ruleta-estado-giro");

    els.btnModoNormal = document.getElementById("btn-modo-normal");
    els.btnModoAvanzado = document.getElementById("btn-modo-avanzado");
    els.wrapModoNormal = document.getElementById("modo-normal-contenedor");
    els.wrapModoAvanzado = document.getElementById("modo-avanzado-contenedor");

    els.textareaNombres = document.getElementById("textarea-nombres");
    els.infoNombres = document.getElementById("info-total-nombres");

    els.listaFilas = document.getElementById("lista-opciones-avanzadas");
    els.btnAnadirFila = document.getElementById("btn-anadir-fila");

    els.gifSalto = document.getElementById("gif-salto-contenedor");

    els.btnMezclar = document.getElementById("btn-mezclar");
    els.btnLimpiar = document.getElementById("btn-limpiar");
    els.btnOrdenar = document.getElementById("btn-ordenar");

    // Modal del ganador
    els.modalOverlay = document.getElementById("modal-ganador");
    els.modalNombre = document.getElementById("modal-ganador-nombre");
    els.btnModalCerrar = document.getElementById("btn-modal-cerrar");
    els.btnModalGirarOtra = document.getElementById("btn-modal-girar-otra");
    els.btnModalGirarQuitar = document.getElementById("btn-modal-girar-quitar");
    els.btnModalReiniciar = document.getElementById("btn-modal-reiniciar");
  }

  // ---------- Cálculo de Probabilidades Equitativas y Fijas ----------
  function recalcularProbabilidades() {
    var ops = estado.opciones;
    if (ops.length === 0) return;

    var fijas = [];
    var autos = [];
    var sumaFijas = 0;

    ops.forEach(function (op) {
      if (op.probModo === "auto") {
        autos.push(op);
      } else {
        var num = parseFloat(op.probModo) || 0;
        fijas.push({ op: op, val: num });
        sumaFijas += num;
      }
    });

    if (autos.length > 0) {
      if (sumaFijas < 100) {
        var restante = 100 - sumaFijas;
        var porcAuto = restante / autos.length;
        autos.forEach(function (op) {
          op.porcentajeReal = porcAuto;
        });
        fijas.forEach(function (item) {
          item.op.porcentajeReal = item.val;
        });
      } else {
        // La suma de fijas supera o iguala 100%: normalizar proporcionalmente
        var pesoAuto = 1;
        var pesoTotal = sumaFijas + autos.length * pesoAuto;
        autos.forEach(function (op) {
          op.porcentajeReal = (pesoAuto / pesoTotal) * 100;
        });
        fijas.forEach(function (item) {
          item.op.porcentajeReal = (item.val / pesoTotal) * 100;
        });
      }
    } else {
      // Todas las opciones son fijas
      if (sumaFijas > 0) {
        fijas.forEach(function (item) {
          item.op.porcentajeReal = (item.val / sumaFijas) * 100;
        });
      } else {
        var eq = 100 / ops.length;
        ops.forEach(function (op) {
          op.porcentajeReal = eq;
        });
      }
    }
  }

  function formatearPorcentaje(num) {
    if (typeof num !== "number" || isNaN(num)) return "0%";
    if (num % 1 === 0) return num.toFixed(0) + "%";
    return num.toFixed(1) + "%";
  }

  // ---------- Sincronización entre Modos ----------
  function sincronizarModoNormalAAvanzado() {
    var lineas = els.textareaNombres.value
      .split("\n")
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 0; });

    if (lineas.length === 0) {
      // Si la lista está vacía al pasar a modo avanzado, crear directamente una fila lista para escribir
      estado.opciones = [
        {
          id: estado.siguienteId++,
          texto: "",
          probModo: "auto",
          porcentajeReal: 100
        }
      ];
    } else {
      estado.opciones = lineas.map(function (nombre, idx) {
        return {
          id: estado.siguienteId++,
          texto: nombre,
          probModo: "auto",
          porcentajeReal: 100 / lineas.length
        };
      });
    }

    recalcularProbabilidades();
    renderizarFilasAvanzadas();
    actualizarResumenes();
  }

  function sincronizarModoAvanzadoANormal() {
    var lineas = estado.opciones
      .map(function (op) { return op.texto.trim(); })
      .filter(function (s) { return s.length > 0; });

    els.textareaNombres.value = lineas.join("\n");
    actualizarInfoTextarea();
  }

  function cambiarModo(nuevoModo) {
    if (estado.modo === nuevoModo) return;

    if (nuevoModo === "avanzado") {
      sincronizarModoNormalAAvanzado();
      els.wrapModoNormal.style.display = "none";
      els.wrapModoAvanzado.style.display = "flex";
      els.btnModoNormal.classList.remove("activo");
      els.btnModoAvanzado.classList.add("activo");
    } else {
      sincronizarModoAvanzadoANormal();
      els.wrapModoAvanzado.style.display = "none";
      els.wrapModoNormal.style.display = "flex";
      els.btnModoAvanzado.classList.remove("activo");
      els.btnModoNormal.classList.add("activo");
    }

    estado.modo = nuevoModo;
    dibujarRuleta();
  }

  // ---------- Renderizado de la Interfaz Avanzada ----------
  function renderizarFilasAvanzadas() {
    if (!els.listaFilas) return;
    els.listaFilas.innerHTML = "";

    estado.opciones.forEach(function (op, index) {
      var fila = document.createElement("div");
      fila.className = "fila-opcion";
      fila.setAttribute("data-id", op.id);

      // Número
      var colNum = document.createElement("span");
      colNum.className = "fila-numero";
      colNum.textContent = (index + 1) + ".";

      // Input wrap
      var inputWrap = document.createElement("div");
      inputWrap.className = "input-opcion-wrap";

      var inputTexto = document.createElement("input");
      inputTexto.type = "text";
      inputTexto.className = "input-opcion-texto";
      inputTexto.value = op.texto;
      inputTexto.placeholder = "Nombre de la opción…";
      inputTexto.setAttribute("aria-label", "Nombre de la opción " + (index + 1));

      inputTexto.addEventListener("input", function () {
        op.texto = inputTexto.value;
        invalidarInstantanea();
        dibujarRuleta();
      });

      // Badge con la probabilidad real dentro del textfield
      var badgeProb = document.createElement("span");
      badgeProb.className = "badge-prob-dentro";
      badgeProb.textContent = formatearPorcentaje(op.porcentajeReal);

      inputWrap.appendChild(inputTexto);
      inputWrap.appendChild(badgeProb);

      // Select de Probabilidad
      var selectWrap = document.createElement("div");
      selectWrap.className = "select-prob-wrap";

      var select = document.createElement("select");
      select.className = "select-prob";
      select.setAttribute("aria-label", "Seleccionar probabilidad para opción " + (index + 1));

      VALORES_PROBABILIDAD.forEach(function (val) {
        var opt = document.createElement("option");
        opt.value = val;
        opt.textContent = val === "auto" ? "Auto" : val + "%";
        if (op.probModo === val || (op.probModo.toString() === val.toString())) {
          opt.selected = true;
        }
        select.appendChild(opt);
      });

      select.addEventListener("change", function () {
        var nuevoVal = select.value === "auto" ? "auto" : parseFloat(select.value);
        op.probModo = nuevoVal;
        invalidarInstantanea();
        recalcularProbabilidades();
        actualizarBadgesFilas();
        actualizarResumenes();
        dibujarRuleta();
      });

      var iconoChevron = document.createElement("span");
      iconoChevron.className = "select-prob-icono";
      iconoChevron.innerHTML = (window.DUtilsIconos && window.DUtilsIconos.chevronAbajo) || "▼";

      selectWrap.appendChild(select);
      selectWrap.appendChild(iconoChevron);

      // Botón papelera para eliminar fila
      var btnBorrar = document.createElement("button");
      btnBorrar.type = "button";
      btnBorrar.className = "btn-borrar-fila";
      btnBorrar.title = "Eliminar esta opción";
      btnBorrar.setAttribute("aria-label", "Eliminar opción " + (index + 1));
      btnBorrar.innerHTML = (window.DUtilsIconos && window.DUtilsIconos.borrar) || "🗑";

      btnBorrar.addEventListener("click", function () {
        invalidarInstantanea();
        eliminarOpcionPorId(op.id);
      });

      fila.appendChild(colNum);
      fila.appendChild(inputWrap);
      fila.appendChild(selectWrap);
      fila.appendChild(btnBorrar);

      els.listaFilas.appendChild(fila);
    });

    actualizarResumenes();
  }

  function actualizarBadgesFilas() {
    if (!els.listaFilas) return;
    var filas = els.listaFilas.querySelectorAll(".fila-opcion");
    filas.forEach(function (fila, idx) {
      var op = estado.opciones[idx];
      if (op) {
        var badge = fila.querySelector(".badge-prob-dentro");
        if (badge) {
          badge.textContent = formatearPorcentaje(op.porcentajeReal);
        }
      }
    });
  }

  function anadirNuevaFila() {
    invalidarInstantanea();
    var nuevaOp = {
      id: estado.siguienteId++,
      texto: "Opción " + (estado.opciones.length + 1),
      probModo: "auto",
      porcentajeReal: 0
    };
    estado.opciones.push(nuevaOp);
    recalcularProbabilidades();
    renderizarFilasAvanzadas();
    dibujarRuleta();

    // Enfocar el nuevo input
    setTimeout(function () {
      var filas = els.listaFilas.querySelectorAll(".input-opcion-texto");
      if (filas.length > 0) {
        filas[filas.length - 1].focus();
        filas[filas.length - 1].select();
      }
    }, 40);
  }

  function eliminarOpcionPorId(id) {
    estado.opciones = estado.opciones.filter(function (op) {
      return op.id !== id;
    });
    recalcularProbabilidades();
    renderizarFilasAvanzadas();
    dibujarRuleta();
  }

  // ---------- Acciones Globales: Mezclar, Limpiar, Ordenar ----------
  function mezclarOpciones() {
    invalidarInstantanea();
    for (var i = estado.opciones.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = estado.opciones[i];
      estado.opciones[i] = estado.opciones[j];
      estado.opciones[j] = temp;
    }

    if (estado.modo === "normal") {
      sincronizarModoAvanzadoANormal();
    } else {
      renderizarFilasAvanzadas();
    }
    dibujarRuleta();
  }

  function limpiarOpciones() {
    invalidarInstantanea();
    estado.opciones = [];
    if (estado.modo === "normal") {
      els.textareaNombres.value = "";
      actualizarInfoTextarea();
    } else {
      renderizarFilasAvanzadas();
    }
    dibujarRuleta();
  }

  function ordenarOpciones() {
    invalidarInstantanea();
    estado.opciones.sort(function (a, b) {
      return a.texto.localeCompare(b.texto, "es", { numeric: true, sensitivity: "base" });
    });

    if (estado.modo === "normal") {
      sincronizarModoAvanzadoANormal();
    } else {
      renderizarFilasAvanzadas();
    }
    dibujarRuleta();
  }

  function actualizarInfoTextarea() {
    if (!els.infoNombres) return;
    var lineas = els.textareaNombres.value
      .split("\n")
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 0; });
    var cant = lineas.length;
    els.infoNombres.textContent = cant + (cant === 1 ? " opción cargada" : " opciones cargadas");
  }

  function actualizarResumenes() {
    actualizarInfoTextarea();
  }

  // ---------- Renderizado del Canvas de la Ruleta ----------
  function obtenerOpcionesValidas() {
    return estado.opciones.filter(function (op) {
      return op.texto.trim().length > 0 && op.porcentajeReal > 0;
    });
  }

  function dibujarRuleta() {
    var canvas = els.canvas;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = window.devicePixelRatio || 1;
    var width = canvas.clientWidth || 420;
    var height = canvas.clientHeight || 420;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    var cx = width / 2;
    var cy = height / 2;
    var radio = Math.min(cx, cy) - 14;

    var ops = obtenerOpcionesValidas();

    if (ops.length === 0) {
      // Cuando no hay opciones, dibujar la ruleta con unas 10 opciones/sectores vacíos
      var numSectoresVacios = 10;
      var anguloSectorVacio = (Math.PI * 2) / numSectoresVacios;
      var anguloAcumVacio = estado.anguloActual;

      for (var s = 0; s < numSectoresVacios; s++) {
        var angFinVacio = anguloAcumVacio + anguloSectorVacio;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radio, anguloAcumVacio, angFinVacio);
        ctx.closePath();

        // Alternancia sutil de fondos entre sectores vacíos
        ctx.fillStyle = (s % 2 === 0) ? "rgba(255, 255, 255, 0.035)" : "rgba(255, 255, 255, 0.065)";
        ctx.fill();

        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "rgba(0, 240, 255, 0.22)";
        ctx.stroke();

        anguloAcumVacio = angFinVacio;
      }

      // Borde exterior
      ctx.beginPath();
      ctx.arc(cx, cy, radio, 0, Math.PI * 2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(10, 16, 28, 0.9)";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, radio + 3, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.stroke();

      // Pernos perimetrales
      for (var p = 0; p < numSectoresVacios; p++) {
        var angPerno = estado.anguloActual + p * anguloSectorVacio;
        var px = cx + (radio - 2) * Math.cos(angPerno);
        var py = cy + (radio - 2) * Math.sin(angPerno);

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0, 240, 255, 0.7)";
        ctx.shadowBlur = 5;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Núcleo central (Hub cap)
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.fillStyle = "#090d16";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0, 240, 255, 0.5)";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 240, 255, 0.6)";
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();
      return;
    }

    // Dibujar sectores
    var anguloAcum = estado.anguloActual;

    ops.forEach(function (op, idx) {
      var fraccion = op.porcentajeReal / 100;
      var anguloSector = fraccion * (Math.PI * 2);
      var anguloFin = anguloAcum + anguloSector;

      var color = PALETA_COLORES[idx % PALETA_COLORES.length];

      // Sector circular
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radio, anguloAcum, anguloFin);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();

      // Línea divisoria
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
      ctx.stroke();

      // Texto de la opción
      ctx.save();
      ctx.translate(cx, cy);
      var anguloMedio = anguloAcum + anguloSector / 2;
      ctx.rotate(anguloMedio);

      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      // Tamaño de fuente según cantidad y ángulo
      var tamFuente = Math.max(11, Math.min(18, Math.floor(radio * anguloSector * 0.45)));
      ctx.font = "700 " + tamFuente + "px 'Rubik', sans-serif";

      // Sombra y legibilidad
      ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
      ctx.shadowBlur = 4;
      ctx.fillStyle = "#ffffff";

      // Truncar texto si es muy largo para el radio disponible
      var textoVisible = op.texto;
      var maxAnchoTexto = radio - 55;
      if (ctx.measureText(textoVisible).width > maxAnchoTexto) {
        while (textoVisible.length > 3 && ctx.measureText(textoVisible + "…").width > maxAnchoTexto) {
          textoVisible = textoVisible.slice(0, -1);
        }
        textoVisible += "…";
      }

      ctx.fillText(textoVisible, radio - 24, 0);
      ctx.restore();

      anguloAcum = anguloFin;
    });

    // Perno / Borde exterior de la ruleta
    ctx.beginPath();
    ctx.arc(cx, cy, radio, 0, Math.PI * 2);
    ctx.lineWidth = 7;
    ctx.strokeStyle = "rgba(10, 16, 28, 0.9)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radio + 3, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0, 240, 255, 0.5)";
    ctx.stroke();

    // Pernos perimetrales (pegs)
    var numPernos = Math.max(ops.length, 12);
    var pasoPerno = (Math.PI * 2) / numPernos;
    for (var p = 0; p < numPernos; p++) {
      var angPerno = estado.anguloActual + p * pasoPerno;
      var px = cx + (radio - 2) * Math.cos(angPerno);
      var py = cy + (radio - 2) * Math.sin(angPerno);

      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 240, 255, 0.8)";
      ctx.shadowBlur = 6;
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Núcleo central (Hub cap)
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fillStyle = "#090d16";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#00f0ff";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#00f0ff";
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // ---------- Detección del Sector Bajo el Marcador Superior ----------
  // El marcador fijo está en la parte superior (12 o'clock, ángulo -π/2)
  function obtenerIndiceBajoMarcador() {
    var ops = obtenerOpcionesValidas();
    if (ops.length === 0) return -1;

    var dosPi = Math.PI * 2;
    var anguloMarcador = (-Math.PI / 2) % dosPi;
    if (anguloMarcador < 0) anguloMarcador += dosPi;

    var rotRelativa = (anguloMarcador - (estado.anguloActual % dosPi) + dosPi) % dosPi;

    var anguloAcum = 0;
    for (var i = 0; i < ops.length; i++) {
      var fraccion = ops[i].porcentajeReal / 100;
      var anguloSector = fraccion * dosPi;
      if (rotRelativa >= anguloAcum && rotRelativa < anguloAcum + anguloSector) {
        return i;
      }
      anguloAcum += anguloSector;
    }
    return 0;
  }

  // ---------- Animación y Giro de la Ruleta ----------
  var animacionFrameId = null;

  function animarBucle() {
    if (!estado.girando) {
      // Rotación suave pasiva mientras no se usa
      estado.anguloActual = (estado.anguloActual + V_IDLE) % (Math.PI * 2);
      dibujarRuleta();
      animacionFrameId = requestAnimationFrame(animarBucle);
    }
  }

  function iniciarGiro() {
    var ops = obtenerOpcionesValidas();
    if (ops.length === 0 || estado.girando) return;

    // Inicializar AudioContext en interacción directa del usuario
    obtenerAudioContext();

    // Guardar instantánea del estado antes de girar por primera vez
    if (!instantaneaInicial || instantaneaInicial.length === 0) {
      guardarInstantaneaInicial();
    }

    // Activar animación del GIF de salto
    if (els.gifSalto) {
      els.gifSalto.classList.remove("animando");
      void els.gifSalto.offsetWidth; // Forzar reflow para reiniciar la animación
      els.gifSalto.classList.add("animando");
    }

    estado.girando = true;
    els.btnLetItRide.disabled = true;
    if (els.estadoGiro) els.estadoGiro.textContent = "¡Girando a toda velocidad…!";

    // Selección ponderada del ganador según porcentajes reales
    var rand = Math.random() * 100;
    var acum = 0;
    var ganadorIdx = 0;
    for (var i = 0; i < ops.length; i++) {
      acum += ops[i].porcentajeReal;
      if (rand < acum) {
        ganadorIdx = i;
        break;
      }
    }
    estado.ganadorActual = ops[ganadorIdx];

    // Calcular el ángulo destino para que el marcador superior (-π/2) aterrice en el ganador
    var dosPi = Math.PI * 2;
    var anguloMarcador = (-Math.PI / 2) % dosPi;
    if (anguloMarcador < 0) anguloMarcador += dosPi;

    var inicioSector = 0;
    for (var k = 0; k < ganadorIdx; k++) {
      inicioSector += (ops[k].porcentajeReal / 100) * dosPi;
    }
    var tamSector = (ops[ganadorIdx].porcentajeReal / 100) * dosPi;

    // Desplazamiento aleatorio dentro del sector ganador (evitando los bordes extremos)
    var margenSeguro = tamSector * 0.2;
    var offsetEnSector = margenSeguro + Math.random() * (tamSector - margenSeguro * 2);
    var puntoMedioGanador = inicioSector + offsetEnSector;

    var vueltasCompletas = 8; // Vueltas fijas para emoción visual
    var anguloObjetivoMod = (anguloMarcador - puntoMedioGanador + dosPi) % dosPi;

    var anguloInicial = estado.anguloActual;
    var distanciaGiro = (vueltasCompletas * dosPi) + ((anguloObjetivoMod - (anguloInicial % dosPi) + dosPi) % dosPi);
    var anguloFinal = anguloInicial + distanciaGiro;

    var tiempoInicio = performance.now();
    estado.ultimoIndiceTick = obtenerIndiceBajoMarcador();

    function frameGiro(ahora) {
      var tiempoTranscurrido = ahora - tiempoInicio;
      var progreso = Math.min(1, tiempoTranscurrido / TIEMPO_GIRO_MS);

      // Función de desaceleración suave (Curva cuártica ease-out)
      var ease = 1 - Math.pow(1 - progreso, 4);

      estado.anguloActual = anguloInicial + distanciaGiro * ease;

      // Sonido de clic y movimiento del marcador al cruzar división
      var indiceActual = obtenerIndiceBajoMarcador();
      if (indiceActual !== estado.ultimoIndiceTick) {
        estado.ultimoIndiceTick = indiceActual;
        RuletaAudio.tick();
        hacerEfectoMarcadorTick();
      }

      dibujarRuleta();

      if (progreso < 1) {
        requestAnimationFrame(frameGiro);
      } else {
        // Giro completado exactamente en el tiempo previsto
        estado.anguloActual = anguloFinal;
        dibujarRuleta();
        finalizarGiro();
      }
    }

    requestAnimationFrame(frameGiro);
  }

  function hacerEfectoMarcadorTick() {
    if (!els.marcador) return;
    els.marcador.classList.add("marcador-tick");
    setTimeout(function () {
      els.marcador.classList.remove("marcador-tick");
    }, 45);
  }

  function finalizarGiro() {
    estado.girando = false;
    els.btnLetItRide.disabled = false;
    if (els.estadoGiro) els.estadoGiro.textContent = "¡Resultado obtenido!";

    // Fanfarria sonora de victoria
    RuletaAudio.victoria();

    // Mostrar modal del ganador
    mostrarModalGanador(estado.ganadorActual ? estado.ganadorActual.texto : "Ganador");
  }

  // ---------- Popup Modal del Ganador ----------
  function mostrarModalGanador(nombre) {
    if (!els.modalOverlay) return;
    els.modalNombre.textContent = nombre;
    els.modalOverlay.classList.add("abierto");
    els.modalOverlay.setAttribute("aria-hidden", "false");
  }

  function cerrarModalGanador() {
    if (!els.modalOverlay) return;
    els.modalOverlay.classList.remove("abierto");
    els.modalOverlay.setAttribute("aria-hidden", "true");
    if (!estado.girando) {
      animarBucle();
    }
  }

  function girarOtraVez() {
    cerrarModalGanador();
    setTimeout(function () {
      iniciarGiro();
    }, 180);
  }

  function girarYQuitarGanador() {
    if (estado.ganadorActual) {
      var idAEliminar = estado.ganadorActual.id;
      eliminarOpcionPorId(idAEliminar);

      if (estado.modo === "normal") {
        sincronizarModoAvanzadoANormal();
      }
    }
    cerrarModalGanador();

    var ops = obtenerOpcionesValidas();
    if (ops.length > 0) {
      setTimeout(function () {
        iniciarGiro();
      }, 220);
    }
  }

  function reiniciarRuleta() {
    if (instantaneaInicial && instantaneaInicial.length > 0) {
      estado.opciones = JSON.parse(JSON.stringify(instantaneaInicial));
      recalcularProbabilidades();
      if (estado.modo === "normal") {
        sincronizarModoAvanzadoANormal();
      } else {
        renderizarFilasAvanzadas();
      }
      actualizarInfoTextarea();
      dibujarRuleta();
    }
    cerrarModalGanador();
    if (els.estadoGiro) els.estadoGiro.textContent = "Listo para girar";
  }

  // ---------- Registro de Eventos e Inicialización ----------
  function registrarEventos() {
    // Botón "Let it ride"
    els.btnLetItRide.addEventListener("click", function () {
      iniciarGiro();
    });

    // Pestañas / Slider de Modos
    els.btnModoNormal.addEventListener("click", function () {
      cambiarModo("normal");
    });
    els.btnModoAvanzado.addEventListener("click", function () {
      cambiarModo("avanzado");
    });

    // Textarea Modo Normal
    els.textareaNombres.addEventListener("input", function () {
      invalidarInstantanea();
      sincronizarModoNormalAAvanzado();
      dibujarRuleta();
    });

    // Botones de acción común
    els.btnMezclar.addEventListener("click", mezclarOpciones);
    els.btnLimpiar.addEventListener("click", limpiarOpciones);
    els.btnOrdenar.addEventListener("click", ordenarOpciones);

    // Botón añadir fila en modo avanzado
    els.btnAnadirFila.addEventListener("click", anadirNuevaFila);

    // Acciones del modal ganador
    els.btnModalCerrar.addEventListener("click", cerrarModalGanador);
    els.btnModalGirarOtra.addEventListener("click", girarOtraVez);
    els.btnModalGirarQuitar.addEventListener("click", girarYQuitarGanador);
    els.btnModalReiniciar.addEventListener("click", reiniciarRuleta);

    // Cerrar modal al hacer clic en el backdrop o pulsar Esc
    els.modalOverlay.addEventListener("click", function (e) {
      if (e.target === els.modalOverlay) {
        cerrarModalGanador();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && els.modalOverlay.classList.contains("abierto")) {
        cerrarModalGanador();
      }
    });

    // Redimensionado responsivo de ventana
    window.addEventListener("resize", function () {
      dibujarRuleta();
    });
  }

  // ---------- Actualización de Iconos Centralizados ----------
  function actualizarIconos() {
    if (!window.DUtilsIconos) return;
    var tema = document.documentElement.getAttribute("data-theme") || "tactico";
    var slots = document.querySelectorAll("[data-icono]");
    for (var i = 0; i < slots.length; i++) {
      var idIcono = slots[i].getAttribute("data-icono");
      var svg = window.DUtilsIconos.obtener ? window.DUtilsIconos.obtener(idIcono, tema) : (window.DUtilsIconos[idIcono] || "");
      if (svg) {
        slots[i].innerHTML = svg;
      }
    }
  }

  function iniciar() {
    mapearElementos();
    actualizarIconos();
    sincronizarModoAvanzadoANormal();
    recalcularProbabilidades();
    renderizarFilasAvanzadas();
    actualizarResumenes();
    guardarInstantaneaInicial();
    registrarEventos();
    dibujarRuleta();
    animarBucle();

    // Observar cambios de tema para actualizar posibles variantes de iconos
    if (window.MutationObserver) {
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          if (m.type === "attributes" && m.attributeName === "data-theme") {
            actualizarIconos();
          }
        });
      });
      observer.observe(document.documentElement, { attributes: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
