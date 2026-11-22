# D-Utils

Página estática para GitHub Pages con utilidades que se ejecutan en el navegador.
Cada utilidad es una carpeta con su `index.html`; la portada (`index.html`) las enlaza.

```
index.html              portada con buscador
recortar/index.html     utilidad: recortar imágenes
assets/base.css         estilos comunes: temas, fuente, interruptor
assets/base.js          tema claro/oscuro, interruptor y favicon
assets/favicon.png      ← MARCADOR DE POSICIÓN: sustitúyelo por tu favicon
assets/fonts/           fuente Rubik (autoalojada) y su licencia
```

## Publicar
1. Crea un repositorio público en GitHub (por ejemplo `d-utils`) y sube estos archivos a la rama `main`.
2. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   rama `main`, carpeta `/ (root)`.
3. En un minuto aproximadamente estará en `https://TU_USUARIO.github.io/d-utils/`.

## Favicon
Sustituye `assets/favicon.png` por tu imagen conservando el nombre. Es un único sitio para todas las páginas.
Si usas otro formato (`.ico`, `.svg`…), cambia el nombre en la constante `FAVICON`, al principio de
`assets/base.js` (está marcada con `▼▼▼ FAVICON ▼▼▼`). Si no ves el cambio, es la caché del navegador:
prueba con recarga forzada (Ctrl+Shift+R) o en una ventana privada.

## Tema claro / oscuro
El interruptor aparece arriba a la izquierda en todas las páginas que carguen `assets/base.css` y
`assets/base.js`. Mientras no lo toques, se sigue el tema del sistema; al usarlo, se recuerda tu elección
en ese navegador. Los colores de cada tema están en `assets/base.css` (bloques `:root` y `:root[data-theme="dark"]`).

## Añadir una utilidad
1. Crea `nueva/index.html` y pon esto en su `<head>` (ajusta `../` a la profundidad de la carpeta):
   ```html
   <link rel="stylesheet" href="../assets/base.css">
   <script src="../assets/base.js"></script>
   ```
   Usa las variables de color (`var(--bg)`, `var(--fg)`, `var(--accent)`, `var(--card)`, `var(--line)`…)
   para que funcione en ambos temas.
2. Copia el `<li>` de ejemplo en la lista de `index.html` y enlaza a `nueva/index.html`.
   `data-keywords` sirve para añadir palabras por las que quieras que aparezca en el buscador.

## Cambiar la fuente
Ahora se usa **Rubik** (licencia SIL OFL), alojada en `assets/fonts/`, con respaldo a las fuentes del sistema.
La fuente se define en la variable `--fuente` de `assets/base.css`:

```css
--fuente: "Rubik", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
```

Hay dos formas de cambiarla:

**A) Google Fonts (lo más rápido).**
1. Elige la fuente en <https://fonts.google.com>, copia su `<link>` y pégalo en el `<head>` de cada página
   (o usa `@import` al principio de `base.css`).
2. Borra los dos bloques `@font-face` de Rubik en `base.css` y cambia `--fuente` por el nombre de la nueva fuente
   seguido del respaldo.
3. Requisitos: que quien visite la página tenga conexión a Google, y ten en cuenta que cada visita hace una
   petición a un tercero (puede importar por privacidad/RGPD). Sin conexión se verá la fuente de respaldo.

**B) Autoalojada (como ahora; funciona sin conexión y sin terceros).**
1. Consigue la fuente en formato **`.woff2`**. Una vía cómoda es el paquete npm `@fontsource/NOMBRE`
   o `@fontsource-variable/NOMBRE` (en `files/` están los `.woff2` ya separados por alfabetos),
   o <https://gwfh.mranftl.com/fonts>.
2. Copia los `.woff2` a `assets/fonts/`. Para español basta el subconjunto **latin** (cubre tildes, ñ, ¿, ¡, €)
   y, opcionalmente, **latin-ext**.
3. Sustituye los `@font-face` de `base.css` (misma estructura: `font-family`, `font-weight`, `src`, `unicode-range`)
   y cambia `--fuente`.
4. Requisitos: que la licencia permita incrustarla y redistribuirla en una web (SIL OFL y Apache 2.0 lo permiten;
   las fuentes comerciales suelen exigir una licencia web). Guarda el archivo de licencia junto a la fuente.
   Si la fuente es de pesos fijos y no variable, declara un `@font-face` por cada peso que uses (400, 500, 700…).

Mantén siempre las fuentes del sistema al final de `--fuente`: se usan mientras carga la fuente principal
o si falla.
