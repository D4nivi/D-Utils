/* =========================================================
   D-Utils · Módulo de Radio Táctica Integrada
   - Componente modular de audio para toda la interfaz
   - Reproductor HTML5 independiente de los efectos sintéticos (SFX)
   - Playlist de pistas locales (.ogg)
   - Sin almacenamiento en localStorage: siempre arranca con la misma pista y volumen fijo
   - Compatible 100% estático con GitHub Pages
   ========================================================= */
(function () {
  "use strict";

  // ▼▼▼ CONFIGURACIÓN DE LA PLAYLIST ▼▼▼ -------------------------------
  // Array de pistas disponibles. Para añadir más temas, agrega aquí
  // el título, artista, etiqueta y la ruta relativa a assets/
  var PLAYLIST = [
    {
      title: "Freaky Menu",
      artist: "Spongephanes",
      tag: "MENU // OST",
      src: "audio/freakyMenu.ogg"
    }
  ];
  // ▲▲▲ CONFIGURACIÓN DE LA PLAYLIST ▲▲▲ -------------------------------

  // Configuración inicial fija (sin persistencia en localStorage)
  var VOLUMEN_PREDETERMINADO = 0.2;  // 20% volumen fijo
  var PISTA_PREDETERMINADA = 0;      // Siempre inicia con la primera pista

  var audioRadio = null;
  var indicePistaActual = PISTA_PREDETERMINADA;
  var radioSonando = false;
  var radioVolumen = VOLUMEN_PREDETERMINADO;
  var radioVolumenPrevio = VOLUMEN_PREDETERMINADO;

  // Ubicación del script actual para resolver la ruta hacia assets/audio/
  var baseScript = document.currentScript ? document.currentScript.src : location.href;

  function resolverRutaAudio(src) {
    if (!src) return "";
    if (/^https?:\/\/|^\/\//i.test(src)) return src;
    try {
      // Como radio.js reside en componentes/, assets/ está en ../assets/
      return new URL("../assets/" + src, baseScript).href;
    } catch (e) {
      return src;
    }
  }

  function obtenerIcono(nombre) {
    return (window.DUtilsIconos && window.DUtilsIconos[nombre]) || "";
  }

  function reproducirSonidoClick() {
    if (window.DUtils && window.DUtils.audio && window.DUtils.audio.click) {
      window.DUtils.audio.click();
    }
  }

  function reproducirSonidoAccion() {
    if (window.DUtils && window.DUtils.audio && window.DUtils.audio.accion) {
      window.DUtils.audio.accion();
    }
  }

  function obtenerAudioRadio() {
    if (!audioRadio) {
      audioRadio = new Audio();
      audioRadio.preload = "metadata";
      audioRadio.volume = radioVolumen;

      audioRadio.addEventListener("ended", function () {
        if (PLAYLIST.length > 1) {
          siguientePista();
        } else {
          audioRadio.currentTime = 0;
          var promesa = audioRadio.play();
          if (promesa !== undefined) {
            promesa.catch(function () {});
          }
        }
      });

      audioRadio.addEventListener("play", function () {
        radioSonando = true;
        actualizarUIRadio();
      });

      audioRadio.addEventListener("pause", function () {
        radioSonando = false;
        actualizarUIRadio();
      });

      audioRadio.addEventListener("error", function () {
        radioSonando = false;
        actualizarUIRadio();
      });

      cargarPista(indicePistaActual, false);
    }
    return audioRadio;
  }

  function cargarPista(indice, autoPlay) {
    if (PLAYLIST.length === 0) return;
    if (indice < 0) indice = PLAYLIST.length - 1;
    if (indice >= PLAYLIST.length) indice = 0;
    indicePistaActual = indice;

    var pista = PLAYLIST[indicePistaActual];
    if (!pista) return;

    if (audioRadio) {
      var estabaReproduciendo = autoPlay || (!audioRadio.paused && !audioRadio.ended && radioSonando);
      audioRadio.src = resolverRutaAudio(pista.src);
      audioRadio.currentTime = 0;
      if (estabaReproduciendo) {
        var promesa = audioRadio.play();
        if (promesa !== undefined) {
          promesa.then(function () {
            radioSonando = true;
            actualizarUIRadio();
          }).catch(function (error) {
            if (error && error.name !== "AbortError") {
              radioSonando = false;
              actualizarUIRadio();
            }
          });
        }
      }
    }
    actualizarUIRadio();
  }

  function alternarRadio() {
    var audio = obtenerAudioRadio();
    if (!audio) return;

    if (audio.paused) {
      if (!audio.src) {
        cargarPista(indicePistaActual, false);
      }
      var promesa = audio.play();
      if (promesa !== undefined) {
        promesa.then(function () {
          radioSonando = true;
          actualizarUIRadio();
        }).catch(function () {
          radioSonando = false;
          actualizarUIRadio();
        });
      }
    } else {
      audio.pause();
      radioSonando = false;
      actualizarUIRadio();
    }
  }

  function siguientePista() {
    if (PLAYLIST.length <= 1) return;
    cargarPista(indicePistaActual + 1, radioSonando);
    reproducirSonidoAccion();
  }

  function anteriorPista() {
    if (PLAYLIST.length <= 1) return;
    cargarPista(indicePistaActual - 1, radioSonando);
    reproducirSonidoAccion();
  }

  function fijarVolumenRadio(nuevoVolumen) {
    radioVolumen = Math.max(0, Math.min(1, nuevoVolumen));
    if (radioVolumen > 0) radioVolumenPrevio = radioVolumen;
    if (audioRadio) {
      audioRadio.volume = radioVolumen;
    }
    actualizarUIRadioVolumen();
  }

  function alternarMuteRadio() {
    if (radioVolumen > 0) {
      radioVolumenPrevio = radioVolumen;
      fijarVolumenRadio(0);
    } else {
      fijarVolumenRadio(radioVolumenPrevio > 0 ? radioVolumenPrevio : VOLUMEN_PREDETERMINADO);
    }
    reproducirSonidoClick();
  }

  // Elementos DOM del widget
  var radioWidgetEl = null;
  var radioPlayBtnEl = null;
  var radioPrevBtnEl = null;
  var radioNextBtnEl = null;
  var radioVolBtnEl = null;
  var radioSliderEl = null;
  var radioTrackEl = null;
  var radioDisplayEl = null;

  function actualizarUIRadio() {
    if (!radioWidgetEl) return;

    radioWidgetEl.classList.toggle("playing", radioSonando);
    radioWidgetEl.classList.toggle("single-track", PLAYLIST.length <= 1);

    var pista = PLAYLIST[indicePistaActual] || { title: "D-Utils Radio", artist: "Tactical", tag: "SYS" };

    if (radioTrackEl) {
      radioTrackEl.textContent = pista.title;
    }

    if (radioDisplayEl) {
      var estadoTexto = radioSonando ? "Reproduciendo" : "Pausada";
      var tagTexto = pista.tag ? " [" + pista.tag + "]" : "";
      var artistaTexto = pista.artist ? " — " + pista.artist : "";
      radioDisplayEl.title = estadoTexto + ": " + pista.title + artistaTexto + tagTexto;
    }

    if (radioPlayBtnEl) {
      radioPlayBtnEl.setAttribute("aria-label", radioSonando ? "Pausar radio" : "Reproducir radio");
      radioPlayBtnEl.title = radioSonando ? "Pausar radio (Pulsa R)" : "Reproducir radio (Pulsa R)";
      radioPlayBtnEl.innerHTML = radioSonando ? obtenerIcono("radioPause") : obtenerIcono("radioPlay");
    }

    if (radioPrevBtnEl) {
      radioPrevBtnEl.innerHTML = obtenerIcono("radioPrev");
    }
    if (radioNextBtnEl) {
      radioNextBtnEl.innerHTML = obtenerIcono("radioNext");
    }
  }

  function actualizarUIRadioVolumen() {
    if (radioSliderEl) {
      radioSliderEl.value = String(radioVolumen);
      var pct = Math.round(radioVolumen * 100);
      radioSliderEl.title = "Volumen: " + pct + "%";
    }

    if (radioVolBtnEl) {
      var esMute = radioVolumen === 0;
      radioVolBtnEl.setAttribute("aria-label", esMute ? "Restablecer volumen de radio" : "Silenciar radio");
      radioVolBtnEl.title = esMute ? "Restablecer volumen de radio" : "Silenciar radio";
      radioVolBtnEl.innerHTML = esMute ? obtenerIcono("radioMute") : obtenerIcono("radioVol");
    }
  }

  function montarWidget(contenedor) {
    if (!contenedor) return null;
    if (radioWidgetEl && contenedor.contains(radioWidgetEl)) return radioWidgetEl;

    var widget = document.createElement("div");
    widget.className = "radio-widget" + (PLAYLIST.length <= 1 ? " single-track" : "");
    widget.setAttribute("role", "region");
    widget.setAttribute("aria-label", "Radio táctica integrada");
    radioWidgetEl = widget;

    // 1. Display con indicador de ecualizador y nombre de pista
    var display = document.createElement("div");
    display.className = "radio-display";
    radioDisplayEl = display;

    var eq = document.createElement("div");
    eq.className = "radio-eq";
    eq.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 4; i++) {
      var bar = document.createElement("span");
      bar.className = "radio-eq-bar";
      eq.appendChild(bar);
    }

    var meta = document.createElement("div");
    meta.className = "radio-meta";
    meta.innerHTML = '<span class="radio-tag">RAD //</span><span class="radio-title">...</span>';
    radioTrackEl = meta.querySelector(".radio-title");

    display.appendChild(eq);
    display.appendChild(meta);

    // 2. Botonera de control táctico
    var acciones = document.createElement("div");
    acciones.className = "radio-actions";

    // Botón Pista Anterior
    radioPrevBtnEl = document.createElement("button");
    radioPrevBtnEl.type = "button";
    radioPrevBtnEl.className = "radio-btn radio-btn-step radio-prev";
    radioPrevBtnEl.setAttribute("aria-label", "Pista anterior");
    radioPrevBtnEl.title = "Pista anterior";
    radioPrevBtnEl.innerHTML = obtenerIcono("radioPrev");
    radioPrevBtnEl.addEventListener("click", function () {
      anteriorPista();
    });

    // Botón Play / Pause principal
    radioPlayBtnEl = document.createElement("button");
    radioPlayBtnEl.type = "button";
    radioPlayBtnEl.className = "radio-btn radio-btn-play";
    radioPlayBtnEl.setAttribute("aria-label", "Reproducir música");
    radioPlayBtnEl.title = "Reproducir radio (Pulsa R)";
    radioPlayBtnEl.innerHTML = obtenerIcono("radioPlay");
    radioPlayBtnEl.addEventListener("click", function () {
      reproducirSonidoClick();
      alternarRadio();
    });

    // Botón Pista Siguiente
    radioNextBtnEl = document.createElement("button");
    radioNextBtnEl.type = "button";
    radioNextBtnEl.className = "radio-btn radio-btn-step radio-next";
    radioNextBtnEl.setAttribute("aria-label", "Pista siguiente");
    radioNextBtnEl.title = "Pista siguiente";
    radioNextBtnEl.innerHTML = obtenerIcono("radioNext");
    radioNextBtnEl.addEventListener("click", function () {
      siguientePista();
    });

    acciones.appendChild(radioPrevBtnEl);
    acciones.appendChild(radioPlayBtnEl);
    acciones.appendChild(radioNextBtnEl);

    // 3. Control de volumen compacto
    var volBox = document.createElement("div");
    volBox.className = "radio-volume";

    radioVolBtnEl = document.createElement("button");
    radioVolBtnEl.type = "button";
    radioVolBtnEl.className = "radio-vol-btn";
    radioVolBtnEl.setAttribute("aria-label", "Silenciar o activar radio");
    radioVolBtnEl.innerHTML = obtenerIcono("radioVol");
    radioVolBtnEl.addEventListener("click", function () {
      alternarMuteRadio();
    });

    radioSliderEl = document.createElement("input");
    radioSliderEl.type = "range";
    radioSliderEl.className = "radio-slider";
    radioSliderEl.min = "0";
    radioSliderEl.max = "1";
    radioSliderEl.step = "0.05";
    radioSliderEl.value = String(radioVolumen);
    radioSliderEl.setAttribute("aria-label", "Volumen de la radio");
    radioSliderEl.addEventListener("input", function () {
      fijarVolumenRadio(parseFloat(this.value));
    });

    volBox.appendChild(radioVolBtnEl);
    volBox.appendChild(radioSliderEl);

    widget.appendChild(display);
    widget.appendChild(acciones);
    widget.appendChild(volBox);

    contenedor.innerHTML = "";
    contenedor.appendChild(widget);

    actualizarUIRadio();
    actualizarUIRadioVolumen();

    return widget;
  }

  // Auto-anclaje si el host ya existe en el DOM
  function autoMontarSiExisteHost() {
    var host = document.getElementById("radio-host");
    if (host && (!radioWidgetEl || !host.contains(radioWidgetEl))) {
      montarWidget(host);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMontarSiExisteHost);
  } else {
    autoMontarSiExisteHost();
  }

  // Exportar API Global
  window.DUtilsRadio = {
    montar: montarWidget,
    reproducir: function () {
      var audio = obtenerAudioRadio();
      if (audio) {
        if (!audio.src) cargarPista(indicePistaActual, false);
        var promesa = audio.play();
        if (promesa !== undefined) {
          promesa.then(function () {
            radioSonando = true;
            actualizarUIRadio();
          }).catch(function () {});
        }
      }
    },
    pausar: function () {
      if (audioRadio) {
        audioRadio.pause();
        radioSonando = false;
        actualizarUIRadio();
      }
    },
    alternar: alternarRadio,
    siguiente: siguientePista,
    anterior: anteriorPista,
    fijarVolumen: fijarVolumenRadio,
    obtenerVolumen: function () { return radioVolumen; },
    estaSonando: function () { return radioSonando; },
    pistaActual: function () { return PLAYLIST[indicePistaActual] || null; },
    playlist: function () { return PLAYLIST; },
    actualizarIconos: function () {
      actualizarUIRadio();
      actualizarUIRadioVolumen();
    }
  };

  // Enlace con window.DUtils si ya existe
  if (window.DUtils) {
    window.DUtils.radio = window.DUtilsRadio;
  }
})();
