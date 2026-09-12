import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve('public');

function getAllImages(dir) {
  let list = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      list = list.concat(getAllImages(fullPath));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpeg', '.jpg'].includes(ext)) {
        list.push(fullPath);
      }
    }
  }
  return list;
}

async function convertAll() {
  const images = getAllImages(PUBLIC_DIR);
  console.log(`Encontradas ${images.length} imágenes para procesar en public/...`);

  let originalTotal = 0;
  let webpTotal = 0;
  let convertedCount = 0;
  let errors = [];

  for (const file of images) {
    const ext = path.extname(file);
    const webpPath = file.slice(0, -ext.length) + '.webp';
    const statBefore = fs.statSync(file);
    originalTotal += statBefore.size;

    try {
      // Redimensionar a máximo 600x600 manteniendo proporción y convertir a WebP calidad 82
      await sharp(file)
        .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toFile(webpPath);

      const statAfter = fs.statSync(webpPath);
      webpTotal += statAfter.size;
      convertedCount++;

      // Eliminar el archivo antiguo .png / .jpeg / .jpg si el webp se generó correctamente
      // Excepto si es idéntico a webpPath
      if (file.toLowerCase() !== webpPath.toLowerCase()) {
        fs.unlinkSync(file);
      }
    } catch (err) {
      console.error(`Error procesando ${file}:`, err.message);
      errors.push({ file, error: err.message });
    }
  }

  console.log('────────────────────────────────────────────────────────────');
  console.log(`✅ Procesamiento finalizado con éxito.`);
  console.log(`Total convertidas: ${convertedCount} / ${images.length}`);
  console.log(`Peso original: ${(originalTotal / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Nuevo peso WebP: ${(webpTotal / (1024 * 1024)).toFixed(2)} MB`);
  const savings = ((1 - webpTotal / originalTotal) * 100).toFixed(1);
  console.log(`Ahorro total de peso: ${savings}%`);
  if (errors.length > 0) {
    console.log(`Errores: ${errors.length}`, errors);
  }
}

convertAll();
