import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const productsDir = path.join(rootDir, "src", "data", "products");

async function audit() {
  console.log("=================================================================");
  console.log("🔍 AUDITORÍA INTEGRAL DE PRODUCTOS Y CATEGORÍAS — DORELLA JEWELRY");
  console.log("=================================================================\n");

  const files = fs.readdirSync(productsDir).filter((f) => f.endsWith(".js"));

  const allItems = [];
  const fileReports = {};

  for (const file of files) {
    const filePath = path.join(productsDir, file);
    const fileUrl = pathToFileURL(filePath).href;
    const mod = await import(fileUrl);

    let items = [];
    for (const key of Object.keys(mod)) {
      if (Array.isArray(mod[key])) {
        items = items.concat(mod[key].map(item => ({ ...item, _file: file })));
      }
    }

    fileReports[file] = {
      count: items.length,
      categories: [...new Set(items.map(i => i.category))],
      duplicateIdsInsideFile: [],
    };

    const idCountsInFile = {};
    for (const item of items) {
      idCountsInFile[item.id] = (idCountsInFile[item.id] || 0) + 1;
    }
    for (const [id, count] of Object.entries(idCountsInFile)) {
      if (count > 1) {
        fileReports[file].duplicateIdsInsideFile.push({ id, count });
      }
    }

    allItems.push(...items);
  }

  console.log(`📦 Total de archivos analizados: ${files.length}`);
  console.log(`💎 Total de productos registrados: ${allItems.length}\n`);

  // 1. Reporte por archivo y categorías detectadas
  console.log("--- 1. Categorías por Archivo ---");
  for (const [file, rep] of Object.entries(fileReports)) {
    console.log(`📄 ${file.padEnd(24)} -> ${rep.count.toString().padStart(4)} productos | Categorías: [${rep.categories.map(c => `"${c}"`).join(", ")}]`);
  }

  // 2. Comprobar categorías con espacios, minúsculas o discrepancias
  console.log("\n--- 2. Análisis de Normalización de Categorías ---");
  const allCategories = [...new Set(allItems.map(i => i.category))];
  const suspiciousCategories = [];
  for (const cat of allCategories) {
    if (!cat || cat.trim() !== cat) {
      suspiciousCategories.push({ cat, reason: "Espacios al inicio o final" });
    }
    // Check if category name casing is odd
    const lower = cat?.toLowerCase();
    const matches = allCategories.filter(c => c && c.toLowerCase() === lower && c !== cat);
    if (matches.length > 0) {
      suspiciousCategories.push({ cat, reason: `Inconsistencia de mayúsculas con "${matches.join('", "')}"` });
    }
  }
  if (suspiciousCategories.length === 0) {
    console.log("✅ Todas las categorías están limpias, sin espacios espurios ni inconsistencias de mayúsculas.");
  } else {
    console.log("⚠️ Categorías con inconsistencias encontradas:", suspiciousCategories);
  }

  // 3. Colisión de IDs global (Cross-file e intra-file)
  console.log("\n--- 3. Detección de Colisiones de IDs ---");
  const globalIdMap = {};
  for (const item of allItems) {
    const sId = String(item.id);
    if (!globalIdMap[sId]) globalIdMap[sId] = [];
    globalIdMap[sId].push(item);
  }

  const crossFileCollisions = [];
  const sameFileCollisions = [];

  for (const [id, list] of Object.entries(globalIdMap)) {
    if (list.length > 1) {
      const distinctFiles = new Set(list.map(i => i._file));
      const distinctCategories = new Set(list.map(i => i.category));
      if (distinctCategories.size > 1) {
        crossFileCollisions.push({
          id,
          count: list.length,
          categories: [...distinctCategories],
          files: [...distinctFiles],
          names: list.map(i => i.name),
        });
      } else {
        sameFileCollisions.push({
          id,
          category: list[0].category,
          count: list.length,
          names: list.map(i => i.name),
          file: list[0]._file,
        });
      }
    }
  }

  console.log(`⚠️ Colisiones inter-categoría (distintas categorías con mismo ID): ${crossFileCollisions.length}`);
  if (crossFileCollisions.length > 0) {
    for (const c of crossFileCollisions) {
      console.log(`   - ID ${c.id}: Categorías [${c.categories.join(", ")}] en archivos [${c.files.join(", ")}]`);
      c.names.forEach((n, idx) => console.log(`       * ${n} (${c.files[idx] || c.files[0]})`));
    }
  } else {
    console.log("   ✅ Cero colisiones inter-categoría.");
  }

  console.log(`\nℹ️ Repeticiones intra-categoría (mismo ID en la misma categoría, variantes): ${sameFileCollisions.length}`);
  for (const sc of sameFileCollisions.slice(0, 10)) {
    console.log(`   - ID ${sc.id} (${sc.category}, ${sc.file}): ${sc.count} productos (Ej: "${sc.names[0]}", "${sc.names[1]}")`);
  }
  if (sameFileCollisions.length > 10) {
    console.log(`   ... y ${sameFileCollisions.length - 10} grupos más.`);
  }

  // 4. Detección de duplicados semánticos de producto (mismo nombre o nombre similar con diferente fuente de imagen)
  console.log("\n--- 4. Detección de Duplicados Semánticos (Modelos repetidos en la misma categoría) ---");
  const semanticDuplicates = [];
  
  // Agrupar por categoría
  const byCategory = {};
  for (const item of allItems) {
    const cat = item.category || "Sin Categoria";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  }

  function cleanName(str) {
    return (str || "")
      .toLowerCase()
      .replace(/^(t|a|p|c|d|h|r)\s+/i, "") // quitar prefijos de catálogo
      .replace(/\b(cms|cm|mm)\b/g, "")
      .replace(/[+\s-]/g, "")
      .trim();
  }

  for (const [cat, prods] of Object.entries(byCategory)) {
    const nameMap = {};
    for (const p of prods) {
      const cName = cleanName(p.name);
      if (!nameMap[cName]) nameMap[cName] = [];
      nameMap[cName].push(p);
    }
    for (const [cName, list] of Object.entries(nameMap)) {
      if (list.length > 1) {
        // Verificar si uno es URL remota y otro es local
        const hasLocal = list.some(i => (i.image || "").startsWith("/"));
        const hasRemote = list.some(i => (i.image || "").startsWith("http"));
        semanticDuplicates.push({
          category: cat,
          cleanKey: cName,
          count: list.length,
          hasLocalAndRemote: hasLocal && hasRemote,
          items: list.map(i => ({ id: i.id, name: i.name, image: i.image, file: i._file }))
        });
      }
    }
  }

  const localRemoteDuplicates = semanticDuplicates.filter(d => d.hasLocalAndRemote);
  console.log(`🚨 DUPLICADOS LOCAL + REMOTO BELATRIZ ENCONTRADOS: ${localRemoteDuplicates.length}`);
  for (const dup of localRemoteDuplicates) {
    console.log(`\n📌 Categoría: "${dup.category}" (${dup.items[0].file})`);
    for (const it of dup.items) {
      console.log(`   - ID: ${it.id.toString().padEnd(7)} | Nombre: "${it.name.padEnd(38)}" | Img: ${it.image}`);
    }
  }

  // Comprobar si hay archivos con categorías mezcladas
  console.log("\n--- 5. Archivos con Múltiples Categorías o Inesperadas ---");
  for (const [file, rep] of Object.entries(fileReports)) {
    if (rep.categories.length > 1) {
      console.log(`⚠️ ${file} tiene más de una categoría:`, rep.categories);
    }
  }

  console.log("\n=================================================================");
  console.log("🏁 FIN DE AUDITORÍA");
  console.log("=================================================================");
}

audit().catch(console.error);
