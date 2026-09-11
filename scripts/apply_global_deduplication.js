import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const productsDir = path.resolve("src/data/products");
const reportPath = path.resolve("scripts/deduplication_report.json");
const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));

async function apply() {
  console.log("==================================================");
  console.log("✂️ EJECUTANDO DEDUPLICACIÓN EN ARCHIVOS DE PRODUCTOS");
  console.log("==================================================\n");

  for (const [file, info] of Object.entries(report)) {
    const filePath = path.join(productsDir, file);
    const mod = await import(pathToFileURL(filePath).href);
    const items = mod[info.exportKey];

    const duplicateIndices = new Set(info.duplicates.map(d => d.index));
    const cleanedItems = items.filter((_, idx) => !duplicateIndices.has(idx));

    console.log(`📁 ${file}: ${items.length} -> ${cleanedItems.length} (Eliminados: ${duplicateIndices.size})`);

    // Formatear archivo JS
    const content = `export const ${info.exportKey} = ${JSON.stringify(cleanedItems, null, 2)};\n`;
    fs.writeFileSync(filePath, content, "utf-8");
  }

  console.log("\n✅ Todos los archivos de productos han sido actualizados y deduplicados con éxito.");
}

apply().catch(console.error);
