const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const assetsDir = path.join(rootDir, 'ocr', 'assets');
const coreDir = path.join(assetsDir, 'core');
const tessdataFastDir = path.join(assetsDir, 'tessdata', 'fast');
const tessdataBestDir = path.join(assetsDir, 'tessdata', 'best');
const nodeModulesDir = path.join(rootDir, 'node_modules');

console.log('--- Preparando activos locales de OCR ---');

[assetsDir, coreDir, tessdataFastDir, tessdataBestDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function copyIfExists(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[OK] Copiado: ${path.relative(rootDir, dest)} (${(fs.statSync(dest).size / (1024 * 1024)).toFixed(2)} MB)`);
  } else {
    console.error(`[ERROR] Archivo origen no encontrado: ${src}`);
    process.exit(1);
  }
}

// 1. Tesseract.js scripts
copyIfExists(path.join(nodeModulesDir, 'tesseract.js', 'dist', 'tesseract.min.js'), path.join(assetsDir, 'tesseract.min.js'));
copyIfExists(path.join(nodeModulesDir, 'tesseract.js', 'dist', 'worker.min.js'), path.join(assetsDir, 'worker.min.js'));

// 2. Tesseract.js-core WASM JS
const coreSource = path.join(nodeModulesDir, 'tesseract.js-core');
[
  'tesseract-core.wasm.js',
  'tesseract-core-simd.wasm.js',
  'tesseract-core-lstm.wasm.js',
  'tesseract-core-simd-lstm.wasm.js',
].forEach((file) => {
  copyIfExists(path.join(coreSource, file), path.join(coreDir, file));
});

// 3. Modelos lingüísticos entrenados fast y best
const spaSource = path.join(nodeModulesDir, '@tesseract.js-data', 'spa');
const engSource = path.join(nodeModulesDir, '@tesseract.js-data', 'eng');

copyIfExists(path.join(spaSource, '4.0.0_best_int', 'spa.traineddata.gz'), path.join(tessdataFastDir, 'spa.traineddata.gz'));
copyIfExists(path.join(engSource, '4.0.0_best_int', 'eng.traineddata.gz'), path.join(tessdataFastDir, 'eng.traineddata.gz'));

copyIfExists(path.join(spaSource, '4.0.0', 'spa.traineddata.gz'), path.join(tessdataBestDir, 'spa.traineddata.gz'));
copyIfExists(path.join(engSource, '4.0.0', 'eng.traineddata.gz'), path.join(tessdataBestDir, 'eng.traineddata.gz'));

// 4. Limpieza de node_modules temporal para no empaquetarlo en el despliegue de Pages
console.log('Limpiando node_modules temporal...');
try {
  fs.rmSync(nodeModulesDir, { recursive: true, force: true });
  console.log('[OK] node_modules eliminado correctamente.');
} catch (e) {
  console.warn('Aviso al limpiar node_modules:', e.message);
}

console.log('--- Activos de OCR preparados y listos para publicar ---');
