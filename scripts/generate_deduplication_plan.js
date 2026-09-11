import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const productsDir = path.resolve("src/data/products");
const files = [
  "anillos.js",
  "aretes.js",
  "cadenas.js",
  "herrajes.js",
  "pulseras.js",
  "rosarios.js",
];

function clean(s) {
  return (s || "")
    .toLowerCase()
    .replace(/^(t|a|p|c|d|h|r|bp|bm|bh)\s+/i, "")
    .replace(/\b(cms|cm|mm)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

async function plan() {
  const fileDetails = {};

  for (const file of files) {
    const filePath = path.join(productsDir, file);
    const mod = await import(pathToFileURL(filePath).href);
    const exportKey = Object.keys(mod).find(k => Array.isArray(mod[k]));
    const items = mod[exportKey];

    const localMap = new Map();
    const duplicatesToRemove = [];

    // Primer paso: registrar todos los items locales canónicos
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const isLocal = (it.image || "").startsWith("/");
      if (isLocal) {
        const k = clean(it.name);
        localMap.set(k, { item: it, index: i });
      }
    }

    // Segundo paso: identificar items remotos redundantes que duplican a un local
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const isRemote = (it.image || "").startsWith("http");
      if (isRemote) {
        const k = clean(it.name);
        if (localMap.has(k)) {
          duplicatesToRemove.push({
            index: i,
            id: it.id,
            name: it.name,
            image: it.image,
            duplicatesCanonical: localMap.get(k).item.name,
            canonicalId: localMap.get(k).item.id,
          });
        }
      }
    }

    fileDetails[file] = {
      exportKey,
      totalBefore: items.length,
      duplicatesCount: duplicatesToRemove.length,
      totalAfter: items.length - duplicatesToRemove.length,
      duplicates: duplicatesToRemove,
    };
  }

  console.log("==================================================");
  console.log("📋 PLAN DE DEDUPLICACIÓN GLOBAL DE PRODUCTOS");
  console.log("==================================================\n");

  let totalDups = 0;
  for (const [file, info] of Object.entries(fileDetails)) {
    console.log(`📁 ${file}:`);
    console.log(`   - Productos antes: ${info.totalBefore}`);
    console.log(`   - Duplicados a remover: ${info.duplicatesCount}`);
    console.log(`   - Productos limpios resultantes: ${info.totalAfter}`);
    totalDups += info.duplicatesCount;
    info.duplicates.forEach(d => {
      console.log(`     ❌ [ID ${d.id}] "${d.name}" -> Duplica canónico [ID ${d.canonicalId}] "${d.duplicatesCanonical}"`);
    });
    console.log("");
  }

  console.log(`🔥 TOTAL GENERAL DE PRODUCTOS DUPLICADOS A ELIMINAR: ${totalDups}`);
  
  // Guardar reporte JSON detallado para usar en la migración SQL y en la edición de archivos
  fs.writeFileSync(
    path.resolve("scripts/deduplication_report.json"),
    JSON.stringify(fileDetails, null, 2)
  );
  console.log("\n💾 Reporte guardado en scripts/deduplication_report.json");
}

plan().catch(console.error);
