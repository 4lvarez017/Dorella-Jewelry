import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const ANILLOS_FILE = path.join(rootDir, "src", "data", "products", "anillos.js");
const PUBLIC_ANILLOS_DIR = path.join(rootDir, "public", "ANILLOS");

async function main() {
  const mode = process.argv.includes("--mode=download") ? "download" : "download";
  console.log("==================================================");
  console.log("📸 MIGRACIÓN DE 49 IMÁGENES DE SUPABASE ANTIGUO");
  console.log(`Modo seleccionado: ${mode}`);
  console.log("==================================================");

  if (!fs.existsSync(PUBLIC_ANILLOS_DIR)) {
    fs.mkdirSync(PUBLIC_ANILLOS_DIR, { recursive: true });
  }

  let content = fs.readFileSync(ANILLOS_FILE, "utf-8");
  const regex = /https:\/\/oepxxlqvfxkwgwjchkzz\.supabase\.co\/storage\/v1\/object\/public\/uploads\/productos\/[^"'\s]+/g;
  const matches = [...new Set(content.match(regex) || [])];

  console.log(`Encontradas ${matches.length} URLs del Supabase antiguo.`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < matches.length; i++) {
    const url = matches[i];
    const fileName = path.basename(url);
    const destPath = path.join(PUBLIC_ANILLOS_DIR, fileName);

    process.stdout.write(`[${i + 1}/${matches.length}] Descargando ${fileName}... `);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(destPath, buffer);
      console.log("✅ OK");
      successCount++;
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      failCount++;
    }
  }

  console.log("\n--------------------------------------------------");
  console.log(`Descarga finalizada: ${successCount} exitosas, ${failCount} fallidas.`);

  if (successCount === matches.length) {
    console.log("Reemplazando URLs remotas por rutas locales relativas en anillos.js...");
    let updatedContent = content;
    for (const url of matches) {
      const fileName = path.basename(url);
      const localPath = `/ANILLOS/${fileName}`;
      updatedContent = updatedContent.replaceAll(url, localPath);
    }
    fs.writeFileSync(ANILLOS_FILE, updatedContent, "utf-8");
    console.log("✅ Archivo anillos.js actualizado con éxito con rutas locales.");
  }
}

main().catch(err => {
  console.error("Error crítico durante la migración:", err);
  process.exit(1);
});
