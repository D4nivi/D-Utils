/* =========================================================
   D-Utils · Lógica del buscador, normalización y filtros rápidos
   ========================================================= */
(function () {
  "use strict";

  // Normalización estricta: ignora mayúsculas, tildes y diacríticos
  function normalizar(s) {
    return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }

  function inicializarBuscador() {
    var inputBuscador = document.getElementById("buscador");
    var contenedorVacio = document.getElementById("vacio");
    var contadorVisibles = document.getElementById("contador-visibles");
    var chipsFiltro = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var btnReset = document.getElementById("btnResetSearch");

    // Indexar elementos con su texto y metadatos
    var elementosLi = Array.prototype.slice.call(document.querySelectorAll("#lista > li"));
    var items = elementosLi.map(function (li) {
      var estado = li.getAttribute("data-estado") || "";
      var categoria = li.getAttribute("data-categoria") || "";
      var keywords = li.getAttribute("data-keywords") || "";
      var contenidoTexto = li.textContent || "";

      return {
        li: li,
        estado: estado,
        categoria: categoria,
        textoBusqueda: normalizar(contenidoTexto + " " + keywords)
      };
    });

    var filtroActual = "todos";

    function aplicarFiltros() {
      var consulta = inputBuscador ? normalizar(inputBuscador.value) : "";
      var palabras = consulta.split(/\s+/).filter(Boolean);

      var visibles = 0;

      for (var i = 0; i < items.length; i++) {
        var item = items[i];

        // 1. Comprobar filtro rápido (estado o categoría)
        var pasaFiltro = true;
        if (filtroActual === "disponibles") {
          pasaFiltro = item.estado === "disponibles";
        } else if (filtroActual === "construccion") {
          pasaFiltro = item.estado === "construccion";
        } else if (filtroActual.indexOf("cat-") === 0) {
          pasaFiltro = item.categoria === filtroActual;
        }

        // 2. Comprobar palabras del buscador
        var pasaTexto = true;
        if (palabras.length > 0) {
          pasaTexto = palabras.every(function (p) {
            return item.textoBusqueda.indexOf(p) !== -1;
          });
        }

        var esVisible = pasaFiltro && pasaTexto;
        item.li.hidden = !esVisible;
        if (esVisible) visibles++;
      }

      // Actualizar contador e interfaz de resultado vacío
      if (contadorVisibles) {
        contadorVisibles.textContent = visibles + " de " + items.length + " módulos disponibles";
      }
      if (contenedorVacio) {
        contenedorVacio.classList.toggle("visible", visibles === 0);
      }
    }

    // Eventos del buscador
    if (inputBuscador) {
      inputBuscador.addEventListener("input", function () {
        aplicarFiltros();
        if (window.DUtils && window.DUtils.audio) {
          window.DUtils.audio.tecleo();
        }
      });
    }

    // Eventos de los filtros rápidos
    chipsFiltro.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chipsFiltro.forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        filtroActual = chip.getAttribute("data-filtro") || "todos";
        aplicarFiltros();
        if (window.DUtils && window.DUtils.audio) {
          window.DUtils.audio.accion();
        }
      });
    });

    // Botón de restablecer
    if (btnReset) {
      btnReset.addEventListener("click", function () {
        if (inputBuscador) inputBuscador.value = "";
        filtroActual = "todos";
        chipsFiltro.forEach(function (c) { c.classList.remove("active"); });
        var chipTodos = chipsFiltro.filter(function (c) {
          return c.getAttribute("data-filtro") === "todos";
        })[0];
        if (chipTodos) chipTodos.classList.add("active");
        aplicarFiltros();
        if (inputBuscador) inputBuscador.focus();
        if (window.DUtils && window.DUtils.audio) {
          window.DUtils.audio.accion();
        }
      });
    }

    // Inicializar estado inicial
    aplicarFiltros();
  }

  window.DUtilsInicializarBuscador = inicializarBuscador;
})();
