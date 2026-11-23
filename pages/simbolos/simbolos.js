/* =========================================================
   D-Utils · Catálogo interactivo de símbolos y glifos Unicode
   MOD_02 // GLIFOS & SÍMBOLOS - Lógica de UI y eventos
   ========================================================= */
(function () {
  "use strict";

  // Carga de catálogo y categorías desde simbolos-datos.js
  const datos = window.DUtilsSimbolosDatos || { CATEGORIAS: [], SIMBOLOS: [] };
  const CATEGORIAS = datos.CATEGORIAS;
  const SIMBOLOS = datos.SIMBOLOS;

  let categoriaActiva = "todos";
  let terminoBusqueda = "";

  // Elementos DOM
  let elBuscador, elBtnLimpiar, elFiltrosCategorias, elContenedor, elEstadoVacio, elTerminoVacio, elBtnLimpiarFiltro, elContadorVisibles, elContadorCategorias, elToast, toastTimeout;

  // Mapa de elementos para búsquedas rápidas
  const mapaBotonesPorCategoria = new Map();
  const mapaSeccionesPorCategoria = new Map();

  function normalizarTexto(txt) {
    if (!txt) return "";
    return txt
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function hex(ch) {
    if (!ch) return "";
    const cp = ch.codePointAt(0);
    return "U+" + cp.toString(16).toUpperCase().padStart(4, "0");
  }

  function mostrarToast(char, nombre, codigoHex) {
    if (!elToast) return;
    const txtChar = char === "\u00A0" ? "NBSP" : (char === "\u200B" ? "ZWSP" : char);
    elToast.innerHTML = '<span class="toast-char">' + txtChar + '</span>' +
      '<span class="toast-meta"><strong>¡Copiado!</strong> ' + codigoHex + ' · ' + nombre + '</span>';
    elToast.classList.add("activo");

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      elToast.classList.remove("activo");
    }, 1800);
  }

  function copiarAlPortapapeles(char, nombre, btn) {
    const cp = hex(char);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(char).catch(() => fallbackCopiar(char));
    } else {
      fallbackCopiar(char);
    }

    if (window.DUtils && window.DUtils.audio && window.DUtils.audio.accion) {
      window.DUtils.audio.accion();
    }

    const tipOriginal = btn.dataset.tip;
    btn.dataset.tip = "¡Copiado!\n" + char + "  ·  " + cp;
    btn.classList.add("copiado");
    mostrarToast(char, nombre, cp);

    setTimeout(() => {
      btn.dataset.tip = tipOriginal;
      btn.classList.remove("copiado");
    }, 900);
  }

  function fallbackCopiar(text) {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.top = "-9999px";
    area.style.left = "-9999px";
    area.setAttribute("readonly", "");
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
    } catch (e) {
      /* sin permisos */
    }
    document.body.removeChild(area);
  }

  function crearBotonSimbolo(char, nombre, alt, cat) {
    const btn = document.createElement("button");
    btn.className = "sym-btn";
    btn.type = "button";

    const codigoHex = hex(char);

    if (char === "\u00A0") {
      btn.innerHTML = '<span class="sym-badge-especial">NBSP</span>';
    } else if (char === "\u200B") {
      btn.innerHTML = '<span class="sym-badge-especial">ZWSP</span>';
    } else {
      btn.textContent = char.trim() ? char : "␣";
    }

    btn.setAttribute("aria-label", "Copiar " + nombre + " (" + codigoHex + ")");

    const busquedaRaw = [char, nombre, cat, alt ? ("alt+" + alt + " " + alt) : "", codigoHex].join(" ");
    btn.dataset.search = normalizarTexto(busquedaRaw);

    btn.dataset.tip = alt
      ? nombre + "\nAlt+" + alt + "  ·  " + codigoHex
      : nombre + "\n" + codigoHex + "  (sin Alt)";

    btn.addEventListener("click", () => {
      copiarAlPortapapeles(char, nombre, btn);
    });

    return btn;
  }

  function renderizarCatalogo() {
    elContenedor.innerHTML = "";
    mapaBotonesPorCategoria.clear();
    mapaSeccionesPorCategoria.clear();

    const agrupados = new Map();
    for (const cat of CATEGORIAS) {
      agrupados.set(cat, []);
    }

    for (const [char, name, alt, cat] of SIMBOLOS) {
      let lista = agrupados.get(cat);
      if (!lista) {
        lista = [];
        agrupados.set(cat, lista);
      }
      const btn = crearBotonSimbolo(char, name, alt, cat);
      lista.push(btn);
    }

    for (const [cat, botones] of agrupados.entries()) {
      const seccion = document.createElement("section");
      seccion.className = "categoria-seccion";
      seccion.id = "cat-" + normalizarTexto(cat).replace(/\s+/g, "-");
      seccion.dataset.categoria = cat;

      const header = document.createElement("div");
      header.className = "categoria-header";

      const titulo = document.createElement("h2");
      titulo.className = "categoria-titulo";
      titulo.textContent = cat;

      const badge = document.createElement("span");
      badge.className = "categoria-badge";
      badge.textContent = botones.length + (botones.length === 1 ? " símbolo" : " símbolos");

      header.appendChild(titulo);
      header.appendChild(badge);
      seccion.appendChild(header);

      const grid = document.createElement("div");
      grid.className = "grid-simbolos";

      for (const b of botones) {
        grid.appendChild(b);
      }

      seccion.appendChild(grid);
      elContenedor.appendChild(seccion);

      mapaBotonesPorCategoria.set(cat, botones);
      mapaSeccionesPorCategoria.set(cat, seccion);
    }

    renderizarFiltrosCategorias(agrupados);
    actualizarVista();
  }

  function renderizarFiltrosCategorias(agrupados) {
    elFiltrosCategorias.innerHTML = "";

    // Chip "Todos"
    const chipTodos = document.createElement("button");
    chipTodos.type = "button";
    chipTodos.className = "filter-chip active";
    chipTodos.dataset.categoria = "todos";
    chipTodos.innerHTML = 'Todos <span class="chip-count">' + SIMBOLOS.length + '</span>';
    chipTodos.addEventListener("click", () => {
      seleccionarCategoria("todos");
    });
    elFiltrosCategorias.appendChild(chipTodos);

    for (const cat of CATEGORIAS) {
      const cantidad = (agrupados.get(cat) || []).length;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "filter-chip";
      chip.dataset.categoria = cat;
      chip.innerHTML = cat + ' <span class="chip-count">' + cantidad + '</span>';
      chip.addEventListener("click", () => {
        seleccionarCategoria(cat);
      });
      elFiltrosCategorias.appendChild(chip);
    }
  }

  function seleccionarCategoria(cat) {
    if (window.DUtils && window.DUtils.audio && window.DUtils.audio.click) {
      window.DUtils.audio.click();
    }

    categoriaActiva = cat;

    const chips = elFiltrosCategorias.querySelectorAll(".filter-chip");
    chips.forEach(chip => {
      if (chip.dataset.categoria === cat) {
        chip.classList.add("active");
        chip.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      } else {
        chip.classList.remove("active");
      }
    });

    actualizarVista();
  }

  function actualizarVista() {
    const q = normalizarTexto(terminoBusqueda);
    let totalVisibles = 0;
    let categoriasConResultados = 0;

    for (const cat of CATEGORIAS) {
      const seccion = mapaSeccionesPorCategoria.get(cat);
      const botones = mapaBotonesPorCategoria.get(cat) || [];
      if (!seccion) continue;

      const perteneceCategoria = (categoriaActiva === "todos" || categoriaActiva === cat);

      if (!perteneceCategoria) {
        seccion.hidden = true;
        continue;
      }

      let visiblesEnCategoria = 0;
      for (const btn of botones) {
        const coincide = !q || btn.dataset.search.includes(q);
        btn.hidden = !coincide;
        if (coincide) {
          visiblesEnCategoria++;
          totalVisibles++;
        }
      }

      const mostrarSeccion = visiblesEnCategoria > 0;
      seccion.hidden = !mostrarSeccion;
      if (mostrarSeccion) {
        categoriasConResultados++;
      }
    }

    if (elContadorVisibles) {
      elContadorVisibles.textContent = totalVisibles;
    }
    if (elContadorCategorias) {
      elContadorCategorias.textContent = categoriasConResultados;
    }

    if (totalVisibles === 0) {
      elEstadoVacio.hidden = false;
      elTerminoVacio.textContent = terminoBusqueda;
    } else {
      elEstadoVacio.hidden = true;
    }

    if (elBtnLimpiar) {
      elBtnLimpiar.hidden = !terminoBusqueda;
    }
  }

  function inicializarEventos() {
    elBuscador.addEventListener("input", e => {
      terminoBusqueda = e.target.value.trim();
      actualizarVista();
    });

    elBtnLimpiar.addEventListener("click", () => {
      if (window.DUtils && window.DUtils.audio && window.DUtils.audio.click) {
        window.DUtils.audio.click();
      }
      elBuscador.value = "";
      terminoBusqueda = "";
      elBuscador.focus();
      actualizarVista();
    });

    elBtnLimpiarFiltro.addEventListener("click", () => {
      if (window.DUtils && window.DUtils.audio && window.DUtils.audio.click) {
        window.DUtils.audio.click();
      }
      elBuscador.value = "";
      terminoBusqueda = "";
      seleccionarCategoria("todos");
      elBuscador.focus();
    });

    document.addEventListener("keydown", e => {
      if (e.key === "/" && document.activeElement !== elBuscador && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        elBuscador.focus();
        elBuscador.select();
      } else if (e.key === "Escape" && document.activeElement === elBuscador) {
        if (elBuscador.value) {
          elBuscador.value = "";
          terminoBusqueda = "";
          actualizarVista();
        } else {
          elBuscador.blur();
        }
      }
    });
  }

  function iniciar() {
    elBuscador = document.getElementById("buscador-simbolos");
    elBtnLimpiar = document.getElementById("btn-limpiar-busqueda");
    elFiltrosCategorias = document.getElementById("filtros-categorias");
    elContenedor = document.getElementById("contenedor-simbolos");
    elEstadoVacio = document.getElementById("estado-vacio");
    elTerminoVacio = document.getElementById("termino-busqueda-vacio");
    elBtnLimpiarFiltro = document.getElementById("btn-limpiar-filtro");
    elContadorVisibles = document.getElementById("contador-visibles");
    elContadorCategorias = document.getElementById("contador-categorias");
    elToast = document.getElementById("hud-toast");

    if (!elContenedor) return;

    renderizarCatalogo();
    inicializarEventos();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
