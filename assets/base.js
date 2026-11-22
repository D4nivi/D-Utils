/* =========================================================
   D-Utils · código común a todas las páginas
   - Aplica el tema claro/oscuro (antes de pintar, para evitar parpadeos)
   - Inserta el interruptor de modo oscuro arriba a la izquierda
   - Pone el favicon
   Se carga en el <head> de cada página, sin "defer".
   ========================================================= */
(function () {
  "use strict";

  // ▼▼▼ FAVICON ▼▼▼ ----------------------------------------------------
  // Sustituye el archivo assets/favicon.png por el tuyo (el actual es un
  // marcador de posición). Si usas otro formato (favicon.ico, favicon.svg…),
  // cambia aquí el nombre del archivo.
  var FAVICON = "favicon.png";
  // ▲▲▲ FAVICON ▲▲▲ ----------------------------------------------------

  var CLAVE = "dutils-tema";
  var raiz = document.documentElement;
  var base = document.currentScript ? document.currentScript.src : location.href;

  function leer() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
  function guardar(v) { try { localStorage.setItem(CLAVE, v); } catch (e) { /* sin almacenamiento: no pasa nada */ } }

  var sistema = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function porDefecto() { return sistema && sistema.matches ? "dark" : "light"; }

  // Si nunca has elegido, se sigue el tema del sistema; al elegir, se recuerda tu elección.
  raiz.setAttribute("data-theme", leer() || porDefecto());

  // Favicon (una sola vez, para todas las páginas)
  var icono = document.createElement("link");
  icono.rel = "icon";
  icono.href = new URL(FAVICON, base).href;
  document.head.appendChild(icono);

  function montarInterruptor() {
    var barra = document.createElement("header");
    barra.className = "topbar";

    var boton = document.createElement("button");
    boton.type = "button";
    boton.className = "switch";
    boton.setAttribute("role", "switch");
    boton.innerHTML =
      '<span class="switch-track"><span class="switch-thumb"></span></span>' +
      '<span class="switch-label">Modo oscuro</span>';

    function pintar() {
      boton.setAttribute("aria-checked", String(raiz.getAttribute("data-theme") === "dark"));
    }
    boton.addEventListener("click", function () {
      var nuevo = raiz.getAttribute("data-theme") === "dark" ? "light" : "dark";
      raiz.setAttribute("data-theme", nuevo);
      guardar(nuevo);
      pintar();
    });
    if (sistema && sistema.addEventListener) {
      sistema.addEventListener("change", function () {
        if (!leer()) { raiz.setAttribute("data-theme", porDefecto()); pintar(); }
      });
    }

    pintar();
    barra.appendChild(boton);
    document.body.insertBefore(barra, document.body.firstChild);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montarInterruptor);
  else montarInterruptor();
})();
