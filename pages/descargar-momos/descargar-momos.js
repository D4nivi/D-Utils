/* =========================================================
   D-Utils · Descargar momos · Controlador principal (descargar-momos.js)
   Orquestación de UI, slider de redes, validación y descargas
   ========================================================= */
(function () {
  "use strict";

  // Estado central de la aplicación
  var estado = {
    redActiva: "twitter",
    procesando: false,
    ultimoResultado: null
  };

  // Diccionario de módulos por red social
  var modulos = {
    twitter: null,
    instagram: null,
    tiktok: null
  };

  /**
   * Obtiene un icono SVG de window.DUtilsIconos
   */
  function obtenerIcono(id) {
    if (!window.DUtilsIconos) return "";
    var tema = (window.DUtilsTemas && window.DUtilsTemas.temaActual)
      ? window.DUtilsTemas.temaActual()
      : (document.documentElement.getAttribute("data-theme") || "tactico");

    if (window.DUtilsIconos.obtener) {
      return window.DUtilsIconos.obtener(id, tema);
    }
    return window.DUtilsIconos[id] || "";
  }

  /**
   * Inicializa los iconos SVG en los slots de la interfaz
   */
  function inicializarIconos() {
    // Iconos de las pestañas del slider
    var icoTabTwitter = document.getElementById("tab-ico-twitter");
    if (icoTabTwitter) icoTabTwitter.innerHTML = obtenerIcono("red-x");

    var icoTabInsta = document.getElementById("tab-ico-instagram");
    if (icoTabInsta) icoTabInsta.innerHTML = obtenerIcono("red-instagram");

    var icoTabTiktok = document.getElementById("tab-ico-tiktok");
    if (icoTabTiktok) icoTabTiktok.innerHTML = obtenerIcono("red-tiktok");

    // Icono del botón de pegar
    var icoBtnPegar = document.getElementById("ico-btn-pegar");
    if (icoBtnPegar) icoBtnPegar.innerHTML = obtenerIcono("pegar");

    // Botón de limpiar input
    var btnLimpiar = document.getElementById("btn-limpiar");
    if (btnLimpiar) btnLimpiar.innerHTML = obtenerIcono("cerrar") || "✕";

    // Iconos de acciones secundarias
    var icoCopiarEnlace = document.getElementById("ico-copiar-enlace");
    if (icoCopiarEnlace) icoCopiarEnlace.innerHTML = obtenerIcono("copiar");

    var icoNuevaDescarga = document.getElementById("ico-nueva-descarga");
    if (icoNuevaDescarga) icoNuevaDescarga.innerHTML = obtenerIcono("borrar");

    // Actualizar icono dinámico según red activa
    actualizarIconosRed();
  }

  /**
   * Actualiza los iconos dependientes de la red activa (input y botón descargar)
   */
  function actualizarIconosRed() {
    var mod = modulos[estado.redActiva];
    if (!mod) return;

    var iconoRedId = mod.iconoBoton || "descarga";
    var svgIcono = obtenerIcono(iconoRedId);

    // Icono dentro del input a la izquierda
    var inputIco = document.getElementById("input-icono-activo");
    if (inputIco) inputIco.innerHTML = svgIcono;

    // Icono dentro del botón descargar principal
    var btnDescargaIco = document.getElementById("ico-btn-descargar");
    if (btnDescargaIco) btnDescargaIco.innerHTML = svgIcono;
  }

  /**
   * Cambia la red social activa en el slider y actualiza la UI
   * @param {"twitter"|"instagram"|"tiktok"} red
   */
  function cambiarRed(red) {
    if (!modulos[red]) return;
    estado.redActiva = red;

    // Actualizar botones de segmento
    var tabs = document.querySelectorAll("#slider-redes .btn-segmento");
    tabs.forEach(function (tab) {
      var coincide = tab.getAttribute("data-red") === red;
      tab.classList.toggle("activo", coincide);
      tab.setAttribute("aria-selected", coincide ? "true" : "false");
    });

    var mod = modulos[red];
    var input = document.getElementById("input-url");
    if (input) {
      input.placeholder = mod.placeholder;
    }

    actualizarIconosRed();
    ocultarError();
  }

  /**
   * Muestra un mensaje de error táctico
   */
  function mostrarError(mensaje) {
    var aviso = document.getElementById("aviso-error");
    var txt = document.getElementById("aviso-error-texto");
    if (aviso && txt) {
      txt.textContent = mensaje;
      aviso.classList.remove("oculto");
    }
  }

  /**
   * Oculta el mensaje de error táctico
   */
  function ocultarError() {
    var aviso = document.getElementById("aviso-error");
    if (aviso) aviso.classList.add("oculto");
  }

  /**
   * Muestra u oculta el estado de carga / escaneo
   */
  function alternarCarga(mostrar, subtexto) {
    estado.procesando = mostrar;
    var el = document.getElementById("estado-carga");
    var sub = document.getElementById("carga-subtexto");
    var btnDescarga = document.getElementById("btn-descargar");
    var txtDescarga = document.getElementById("txt-btn-descargar");

    if (el) {
      if (mostrar) {
        el.classList.remove("oculto");
        if (sub && subtexto) sub.textContent = subtexto;
      } else {
        el.classList.add("oculto");
      }
    }

    if (btnDescarga) {
      btnDescarga.disabled = mostrar;
      if (txtDescarga) {
        txtDescarga.textContent = mostrar ? "Procesando..." : "Descargar";
      }
    }
  }

  /**
   * Dispara el flujo de validación y extracción
   */
  function procesarDescarga() {
    if (estado.procesando) return;

    var input = document.getElementById("input-url");
    if (!input) return;

    var urlCruda = input.value;
    if (!urlCruda || !urlCruda.trim()) {
      mostrarError("Por favor, introduce o pega un enlace para descargar.");
      input.focus();
      return;
    }

    ocultarError();

    // Auto-detección inteligente: si pegó un link de otra red, cambiar de pestaña automáticamente
    var redDetectada = (window.DUtilsDescargaComun && window.DUtilsDescargaComun.extraerTipoRed)
      ? window.DUtilsDescargaComun.extraerTipoRed(urlCruda)
      : null;

    if (redDetectada && redDetectada !== estado.redActiva && modulos[redDetectada]) {
      cambiarRed(redDetectada);
      if (window.DUtilsDescargaComun && window.DUtilsDescargaComun.notificar) {
        window.DUtilsDescargaComun.notificar("Cambiado a " + modulos[redDetectada].nombre + " automáticamente", "info");
      }
    }

    var mod = modulos[estado.redActiva];
    if (!mod) {
      mostrarError("Módulo no disponible.");
      return;
    }

    // Validar formato de URL antes de solicitar
    var validacion = mod.validarUrl(urlCruda);
    if (!validacion.valido) {
      mostrarError(validacion.error || "Formato de URL no válido para " + mod.nombre);
      return;
    }

    // Ocultar resultado anterior mientras se procesa
    var contResultado = document.getElementById("contenedor-resultado");
    if (contResultado) contResultado.classList.add("oculto");

    alternarCarga(true, "Consultando metadatos y enlaces de " + mod.nombre + "...");

    // Ejecutar algoritmo de extracción
    mod.obtenerMedios(urlCruda)
      .then(function (datos) {
        alternarCarga(false);
        estado.ultimoResultado = datos;
        renderizarResultado(datos);
        if (window.DUtilsDescargaComun && window.DUtilsDescargaComun.notificar) {
          window.DUtilsDescargaComun.notificar("¡Medio extraído con éxito!", "ok");
        }
      })
      .catch(function (err) {
        alternarCarga(false);
        var msg = (err && err.message) ? err.message : "No se pudo extraer el contenido.";
        mostrarError(msg);
      });
  }

  /**
   * Renderiza la tarjeta de resultado con carátula y botones de calidades
   */
  function renderizarResultado(datos) {
    var cont = document.getElementById("contenedor-resultado");
    if (!cont || !datos) return;

    // 1. Autor y badges
    var resAvatar = document.getElementById("res-avatar");
    if (resAvatar) {
      if (datos.autor && datos.autor.avatar) {
        resAvatar.innerHTML = '<img src="' + datos.autor.avatar + '" alt="' + (datos.autor.nombre || "Avatar") + '" onerror="this.style.display=\'none\'" />';
      } else {
        resAvatar.innerHTML = obtenerIcono(modulos[datos.red] ? modulos[datos.red].iconoBoton : "descarga");
      }
    }

    var resNombre = document.getElementById("res-autor-nombre");
    if (resNombre) resNombre.textContent = (datos.autor && datos.autor.nombre) || "Creador";

    var resHandle = document.getElementById("res-autor-handle");
    if (resHandle) resHandle.textContent = (datos.autor && datos.autor.handle) || "";

    var badgeRed = document.getElementById("res-badge-red");
    if (badgeRed) {
      badgeRed.textContent = (modulos[datos.red] ? modulos[datos.red].nombre : datos.red).toUpperCase();
    }

    var badgeTipo = document.getElementById("res-badge-tipo");
    if (badgeTipo) {
      var tipoTexto = "MULTIMEDIA";
      if (datos.tipo === "video") tipoTexto = "VÍDEO HD";
      else if (datos.tipo === "gif") tipoTexto = "GIF / MP4";
      else if (datos.tipo === "imagen") tipoTexto = "IMAGEN HD";
      badgeTipo.textContent = tipoTexto;
    }

    // 2. Carátula
    var imgCaratula = document.getElementById("res-caratula-img");
    var overlayPlay = document.getElementById("caratula-overlay-play");
    var tagDuracion = document.getElementById("res-duracion-tag");

    if (imgCaratula) {
      if (datos.caratula) {
        imgCaratula.src = datos.caratula;
        imgCaratula.style.display = "block";
        imgCaratula.onerror = function () {
          imgCaratula.style.display = "none";
        };
      } else {
        imgCaratula.src = "";
        imgCaratula.style.display = "none";
      }
    }

    if (overlayPlay) {
      if (datos.tipo === "video" || datos.tipo === "gif") {
        overlayPlay.classList.remove("oculto");
      } else {
        overlayPlay.classList.add("oculto");
      }
    }

    if (tagDuracion) {
      if (datos.duracion) {
        tagDuracion.textContent = datos.duracion;
        tagDuracion.classList.remove("oculto");
      } else {
        tagDuracion.classList.add("oculto");
      }
    }

    // 3. Título / Descripción
    var resTitulo = document.getElementById("res-titulo");
    if (resTitulo) {
      resTitulo.textContent = datos.titulo || "Sin descripción disponible.";
    }

    // 4. Aviso secundario si existe
    var avisoSec = document.getElementById("res-aviso-secundario");
    if (avisoSec) {
      if (datos.aviso) {
        avisoSec.textContent = datos.aviso;
        avisoSec.classList.remove("oculto");
      } else {
        avisoSec.classList.add("oculto");
      }
    }

    // 5. Lista de botones de calidad
    var listaCalidades = document.getElementById("lista-calidades");
    if (listaCalidades) {
      listaCalidades.innerHTML = "";
      var opciones = Array.isArray(datos.opciones) ? datos.opciones : [];

      opciones.forEach(function (opc) {
        var btn = document.createElement("a");
        btn.className = "btn-calidad" + (opc.esPrimario ? " calidad-primaria" : "");
        btn.href = opc.url;
        btn.target = "_blank";
        btn.rel = "noopener noreferrer";

        var svgIcono = obtenerIcono(opc.icono || "descarga");

        btn.innerHTML =
          '<div class="calidad-info">' +
            '<span class="calidad-icono">' + svgIcono + '</span>' +
            '<div class="calidad-textos">' +
              '<span class="calidad-etiqueta">' + opc.etiqueta + '</span>' +
              '<span class="calidad-resolucion">' + opc.resolucion + '</span>' +
            '</div>' +
          '</div>' +
          '<span class="calidad-badge">' + opc.formato + '</span>';

        // Evento de clic: forzar descarga directa con DUtilsDescargaComun
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          if (window.DUtilsDescargaComun && window.DUtilsDescargaComun.descargarArchivo) {
            window.DUtilsDescargaComun.descargarArchivo(
              opc.url,
              opc.nombreSugerido,
              function (estadoDescarga) {
                if (estadoDescarga === "descargando" || estadoDescarga === "iniciando") {
                  window.DUtilsDescargaComun.notificar("Iniciando descarga: " + opc.formato, "info");
                } else if (estadoDescarga === "completado") {
                  window.DUtilsDescargaComun.notificar("¡Descarga completada!", "ok");
                }
              }
            );
          } else {
            window.open(opc.url, "_blank");
          }
        });

        listaCalidades.appendChild(btn);
      });
    }

    // Mostrar el contenedor
    cont.classList.remove("oculto");

    // Scroll suave hacia el resultado
    try {
      cont.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (e) {}
  }

  /**
   * Limpia el campo de entrada y el resultado
   */
  function limpiarTodo() {
    var input = document.getElementById("input-url");
    if (input) {
      input.value = "";
      input.focus();
    }
    var btnLimpiar = document.getElementById("btn-limpiar");
    if (btnLimpiar) btnLimpiar.classList.add("oculto");

    ocultarError();

    var cont = document.getElementById("contenedor-resultado");
    if (cont) cont.classList.add("oculto");

    estado.ultimoResultado = null;
  }

  /**
   * Inicialización al cargar la página
   */
  function inicializar() {
    // Vincular módulos cargados
    modulos.twitter = window.DUtilsTwitter || null;
    modulos.instagram = window.DUtilsInstagram || null;
    modulos.tiktok = window.DUtilsTikTok || null;

    // Renderizar footer táctico
    if (window.DUtilsFooter && window.DUtilsFooter.renderizar) {
      window.DUtilsFooter.renderizar("footer-host");
    }

    // Renderizar iconos
    inicializarIconos();

    // Eventos del slider / tabs
    var tabs = document.querySelectorAll("#slider-redes .btn-segmento");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var red = tab.getAttribute("data-red");
        if (red) cambiarRed(red);
      });
    });

    var input = document.getElementById("input-url");
    var btnLimpiar = document.getElementById("btn-limpiar");
    var btnPegar = document.getElementById("btn-pegar");
    var btnDescargar = document.getElementById("btn-descargar");
    var btnCopiarEnlace = document.getElementById("btn-copiar-enlace");
    var btnNuevaDescarga = document.getElementById("btn-nueva-descarga");

    // Input listeners
    if (input) {
      input.addEventListener("input", function () {
        var valor = input.value.trim();
        if (btnLimpiar) {
          btnLimpiar.classList.toggle("oculto", valor.length === 0);
        }

        // Auto-detección en tiempo real mientras escribe/pega
        if (valor.length > 8) {
          var red = (window.DUtilsDescargaComun && window.DUtilsDescargaComun.extraerTipoRed)
            ? window.DUtilsDescargaComun.extraerTipoRed(valor)
            : null;
          if (red && red !== estado.redActiva && modulos[red]) {
            cambiarRed(red);
          }
        }
      });

      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          procesarDescarga();
        } else if (e.key === "Escape") {
          limpiarTodo();
        }
      });
    }

    // Botón Limpiar dentro del input
    if (btnLimpiar) {
      btnLimpiar.addEventListener("click", function () {
        if (input) {
          input.value = "";
          btnLimpiar.classList.add("oculto");
          input.focus();
        }
      });
    }

    // Botón Pegar del portapapeles
    if (btnPegar) {
      btnPegar.addEventListener("click", function () {
        if (window.DUtilsDescargaComun && window.DUtilsDescargaComun.pegarPortapapeles) {
          window.DUtilsDescargaComun.pegarPortapapeles()
            .then(function (texto) {
              if (texto && input) {
                input.value = texto;
                if (btnLimpiar) btnLimpiar.classList.remove("oculto");

                // Auto-detección inmediata al pegar
                var red = window.DUtilsDescargaComun.extraerTipoRed(texto);
                if (red && modulos[red]) {
                  cambiarRed(red);
                }

                if (window.DUtilsDescargaComun.notificar) {
                  window.DUtilsDescargaComun.notificar("Enlace pegado del portapapeles", "ok");
                }
                input.focus();
              } else {
                if (window.DUtilsDescargaComun.notificar) {
                  window.DUtilsDescargaComun.notificar("El portapapeles está vacío o no contiene texto", "warn");
                }
              }
            });
        }
      });
    }

    // Botón Descargar principal
    if (btnDescargar) {
      btnDescargar.addEventListener("click", function () {
        procesarDescarga();
      });
    }

    // Botón Copiar enlace original
    if (btnCopiarEnlace) {
      btnCopiarEnlace.addEventListener("click", function () {
        if (estado.ultimoResultado && estado.ultimoResultado.urlOriginal) {
          if (window.DUtilsDescargaComun && window.DUtilsDescargaComun.copiarPortapapeles) {
            window.DUtilsDescargaComun.copiarPortapapeles(estado.ultimoResultado.urlOriginal)
              .then(function (ok) {
                if (ok && window.DUtilsDescargaComun.notificar) {
                  window.DUtilsDescargaComun.notificar("Enlace original copiado al portapapeles", "ok");
                }
              });
          }
        }
      });
    }

    // Botón Nueva descarga
    if (btnNuevaDescarga) {
      btnNuevaDescarga.addEventListener("click", function () {
        limpiarTodo();
      });
    }

    // Re-renderizado reactivo cuando cambie el tema
    window.addEventListener("dutils:tema-cambiado", function () {
      inicializarIconos();
      if (estado.ultimoResultado) {
        renderizarResultado(estado.ultimoResultado);
      }
    });

    // Poner foco en el input al cargar
    if (input) {
      setTimeout(function () {
        input.focus();
      }, 100);
    }
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializar);
  } else {
    inicializar();
  }
})();
