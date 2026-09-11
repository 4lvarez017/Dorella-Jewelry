import fs from "fs";
import path from "path";

const reportPath = path.resolve("scripts/deduplication_report.json");
const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));

let sql = `-- =============================================================================
-- Migración 009: Limpieza Integral y Preventiva de Duplicados en Todas las Categorías
-- Dorella Jewelry — Auditoría Global y Prevención Permanente
-- =============================================================================

-- PASO 1: Normalización de nombres de categorías (eliminar espacios y capitalizar)
UPDATE products SET category = 'Anillos'           WHERE LOWER(TRIM(category)) = 'anillos';
UPDATE products SET category = 'Aretes'            WHERE LOWER(TRIM(category)) = 'aretes';
UPDATE products SET category = 'Brazaletes Hombre' WHERE LOWER(TRIM(category)) = 'brazaletes hombre';
UPDATE products SET category = 'Brazaletes Mujer'  WHERE LOWER(TRIM(category)) = 'brazaletes mujer';
UPDATE products SET category = 'Brazaletes Niñas'  WHERE LOWER(TRIM(category)) = 'brazaletes niñas' OR LOWER(TRIM(category)) = 'brazaletes ninas';
UPDATE products SET category = 'Brazaletes Niños'  WHERE LOWER(TRIM(category)) = 'brazaletes niños' OR LOWER(TRIM(category)) = 'brazaletes ninos';
UPDATE products SET category = 'Brazaletes Pareja' WHERE LOWER(TRIM(category)) = 'brazaletes pareja';
UPDATE products SET category = 'Cadenas'           WHERE LOWER(TRIM(category)) = 'cadenas';
UPDATE products SET category = 'Conjuntos'         WHERE LOWER(TRIM(category)) = 'conjuntos';
UPDATE products SET category = 'Cruceros'          WHERE LOWER(TRIM(category)) = 'cruceros';
UPDATE products SET category = 'Dijes'             WHERE LOWER(TRIM(category)) = 'dijes';
UPDATE products SET category = 'Herrajes'          WHERE LOWER(TRIM(category)) = 'herrajes';
UPDATE products SET category = 'Pulseras'          WHERE LOWER(TRIM(category)) = 'pulseras';
UPDATE products SET category = 'Rosarios'          WHERE LOWER(TRIM(category)) = 'rosarios';
UPDATE products SET category = 'Tobilleras'        WHERE LOWER(TRIM(category)) = 'tobilleras' OR LOWER(TRIM(category)) = 'tobillera';

-- PASO 2: Eliminación selectiva de los 49 registros duplicados detectados en la auditoría
`;

const fileToCategory = {
  "anillos.js": "Anillos",
  "aretes.js": "Aretes",
  "cadenas.js": "Cadenas",
  "herrajes.js": "Herrajes",
  "pulseras.js": "Pulseras",
  "rosarios.js": "Rosarios",
};

for (const [file, info] of Object.entries(report)) {
  const cat = fileToCategory[file];
  sql += `\n-- ── Categoría: ${cat} (${info.duplicatesCount} duplicados redundantes eliminados) ──\n`;
  
  const names = info.duplicates.map(d => `'${d.name.replace(/'/g, "''")}'`);
  const ids = info.duplicates.map(d => `'${d.id}'`);
  const canonicalIds = [...new Set(info.duplicates.map(d => `'${d.canonicalId}'`))];

  sql += `DELETE FROM products\n`;
  sql += `WHERE category = '${cat}'\n`;
  sql += `  AND (\n`;
  sql += `    name IN (${names.join(", ")})\n`;
  sql += `    OR id::text IN (${[...new Set(ids)].join(", ")})\n`;
  sql += `    OR id::text LIKE 'prod-${cat.toLowerCase().replace(/\\s/g, '_')}-%'\n`;
  sql += `  )\n`;
  sql += `  -- Proteger siempre los modelos canónicos oficiales\n`;
  sql += `  AND id::text NOT IN (${canonicalIds.join(", ")})\n`;
  sql += `  AND NOT (images::text LIKE '%/${cat.toUpperCase()}/%');\n`;
}

sql += `\n-- PASO 3: Verificación final de integridad y conteo por categoría
SELECT category, COUNT(*) as total_productos, SUM(stock) as stock_total
FROM products
GROUP BY category
ORDER BY category ASC;
`;

fs.writeFileSync(
  path.resolve("supabase/migrations/009_cleanup_all_duplicate_products.sql"),
  sql,
  "utf-8"
);
console.log("✅ Migración generada exitosamente en supabase/migrations/009_cleanup_all_duplicate_products.sql");
