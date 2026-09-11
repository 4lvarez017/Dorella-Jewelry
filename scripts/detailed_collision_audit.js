import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const productsDir = path.resolve("src/data/products");
const files = fs.readdirSync(productsDir).filter(f => f.endsWith(".js"));

async function audit() {
  let all = [];
  for (const file of files) {
    const mod = await import(pathToFileURL(path.join(productsDir, file)).href);
    for (const k of Object.keys(mod)) {
      if (Array.isArray(mod[k])) {
        all.push(...mod[k].map(item => ({ ...item, _file: file })));
      }
    }
  }

  const idMap = {};
  for (const item of all) {
    const sId = String(item.id);
    if (!idMap[sId]) idMap[sId] = [];
    idMap[sId].push(item);
  }

  const crossCategory = [];
  for (const [id, list] of Object.entries(idMap)) {
    const cats = new Set(list.map(i => i.category));
    if (cats.size > 1) {
      crossCategory.push({ id, count: list.length, items: list });
    }
  }

  console.log(`⚡ Cross-Category ID Collisions: ${crossCategory.length}`);
  for (const col of crossCategory) {
    console.log(`\nID: ${col.id} (${col.count} productos en diferentes categorías):`);
    for (const it of col.items) {
      console.log(`  - Categoría: "${it.category}" | Archivo: ${it._file} | Nombre: "${it.name}"`);
    }
  }
}

audit().catch(console.error);
