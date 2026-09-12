import fs from 'fs';
import path from 'path';

const TARGET_FILES = [
  'index.html',
  'src/pages/CatalogView.jsx',
  'src/components/home/HeroCinematic.jsx',
  'src/components/home/CraftsmanshipStory.jsx',
];

// Add all files in src/data/products
const productsDir = path.resolve('src/data/products');
if (fs.existsSync(productsDir)) {
  const pFiles = fs.readdirSync(productsDir).filter(f => f.endsWith('.js'));
  pFiles.forEach(f => TARGET_FILES.push(path.join('src/data/products', f)));
}

let modifiedFiles = 0;

for (const relPath of TARGET_FILES) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  // Replace image extensions: .png -> .webp, .jpg -> .webp, .jpeg -> .webp
  // Specific for our image paths:
  // e.g. /ANILLOS/...png -> .webp
  // /pulsera_base.jpg -> .webp
  // /pulsera_ensamblada.jpg -> .webp
  content = content.replace(/\.(png|jpg|jpeg)(["'?#])/gi, '.webp$2');

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    modifiedFiles++;
    console.log(`✓ Actualizado: ${relPath}`);
  }
}

console.log(`Total archivos de código actualizados a .webp: ${modifiedFiles}`);
