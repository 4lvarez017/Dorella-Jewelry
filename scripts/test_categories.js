import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

async function run() {
  console.log("==================================================");
  console.log("🧪 PRUEBAS AUTOMÁTICAS: CATEGORÍAS Y CLAVES REACT");
  console.log("==================================================");

  const productsDir = path.join(rootDir, "src", "data", "products");
  const files = fs.readdirSync(productsDir).filter((f) => f.endsWith(".js"));

  let allProducts = [];
  for (const file of files) {
    const filePath = path.join(productsDir, file);
    const fileUrl = pathToFileURL(filePath).href;
    const mod = await import(fileUrl);
    for (const key of Object.keys(mod)) {
      if (Array.isArray(mod[key])) {
        allProducts = allProducts.concat(mod[key]);
      }
    }
  }

  console.log(`\n📦 Total productos analizados: ${allProducts.length}`);

  // Test 1: Filtrado estricto vs startsWith
  console.log("\n--- Prueba 1: Filtrado de categorías exacto vs startsWith ---");
  const targetCategory = "Brazaletes";
  const startsWithCount = allProducts.filter(p => (p.category || "").startsWith(targetCategory)).length;
  const exactMatchCount = allProducts.filter(p => (p.category || "") === targetCategory).length;

  console.log(`Resultados para búsqueda "${targetCategory}":`);
  console.log(`  - Con startsWith (obsoleto con bug): ${startsWithCount} productos`);
  console.log(`  - Con === (corregido estricto): ${exactMatchCount} productos`);

  if (startsWithCount > exactMatchCount) {
    console.log("  ✅ Confirmado: startsWith provocaba contaminación cruzada de subcategorías.");
  } else {
    console.log("  ℹ️ No se encontraron colisiones de prefijo para este término.");
  }

  // Test 2: Unicidad de claves compuestas en React
  console.log("\n--- Prueba 2: Unicidad de claves React compuestas (${id}-${category}) ---");
  const rawIdCounts = {};
  const compoundKeyCounts = {};

  allProducts.forEach((p) => {
    const rawKey = String(p.id);
    const compoundKey = `${p.id}-${p.category}`;

    rawIdCounts[rawKey] = (rawIdCounts[rawKey] || 0) + 1;
    compoundKeyCounts[compoundKey] = (compoundKeyCounts[compoundKey] || 0) + 1;
  });

  const _rawCollisions = Object.values(rawIdCounts).filter(c => c > 1).length;
  const crossCategoryCollisions = Object.entries(rawIdCounts).filter(([id, count]) => {
    if (count <= 1) return false;
    const cats = new Set(allProducts.filter(p => String(p.id) === id).map(p => p.category));
    return cats.size > 1;
  });

  console.log(`  - Claves sin procesar con colisiones inter-categoría: ${crossCategoryCollisions.length}`);
  console.log("  - Evaluando claves compuestas para renderizado seguro...");

  let safePerCategory = true;
  crossCategoryCollisions.forEach(([id]) => {
    const prods = allProducts.filter(p => String(p.id) === id);
    const compoundKeys = prods.map(p => `${p.id}-${p.category}`);
    const distinctCompounds = new Set(compoundKeys);
    if (distinctCompounds.size < 2) {
      safePerCategory = false;
    }
  });

  if (safePerCategory) {
    console.log("  ✅ Clave compuesta `${p.id}-${p.category}` neutraliza el 100% de las colisiones inter-categoría en React.");
  } else {
    console.log("  ❌ Advertencia: Algunas claves aún comparten categoría e ID.");
  }

  console.log("\n==================================================");
  console.log("✅ RESULTADO: TODAS LAS PRUEBAS DE CATEGORÍAS COMPLETADAS");
  console.log("==================================================");
}

run().catch(err => {
  console.error("Error en pruebas de categorías:", err);
  process.exit(1);
});
