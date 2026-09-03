import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./src/lib/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchSupabase(reqPath, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1${reqPath}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`[Supabase Error ${res.status}]: ${errorText}`);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return null;
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function getAllExistingProducts() {
  console.log("📥 Consultando productos existentes en Supabase...");
  let all = [];
  const PAGE = 1000;
  let offset = 0;

  while (true) {
    const batch = await fetchSupabase(
      `/products?select=id,name,category&limit=${PAGE}&offset=${offset}`
    );
    if (!batch || batch.length === 0) break;
    all = all.concat(batch);
    if (batch.length < PAGE) break;
    offset += PAGE;
  }

  return all;
}

function normalizeStr(str) {
  return (str || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function loadAllLocalProducts() {
  const productsDir = path.join(__dirname, "src", "data", "products");
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

  return allProducts;
}

async function sync() {
  try {
    console.log("==================================================");
    console.log("🚀 INICIANDO SINCRONIZACIÓN DE TODAS LAS CATEGORÍAS");
    console.log("==================================================");

    const localProducts = await loadAllLocalProducts();
    console.log(`📦 Encontrados ${localProducts.length} productos en archivos locales (src/data/products/*.js).`);

    const existing = await getAllExistingProducts();
    console.log(`✅ Se encontraron ${existing.length} productos registrados en Supabase.`);

    // Crear set de comprobación por ID y por (Categoría + Nombre)
    const existingIds = new Set(existing.map((p) => String(p.id)));
    const existingNamesByCat = new Set(
      existing.map((p) => `${normalizeStr(p.category)}:::${normalizeStr(p.name)}`)
    );

    const toInsert = [];

    for (const p of localProducts) {
      const idStr = String(p.id);
      const nameCatKey = `${normalizeStr(p.category)}:::${normalizeStr(p.name)}`;

      // Omitir si ya existe
      if (existingIds.has(idStr) || existingNamesByCat.has(nameCatKey)) {
        continue;
      }

      const imgs = Array.isArray(p.images)
        ? p.images
        : [p.image || "/placeholder.jpg"];

      toInsert.push({
        id: idStr.startsWith("prod-") || idStr.startsWith("chryso-") || idStr.startsWith("custom-")
          ? idStr
          : `prod-${idStr}`,
        name: p.name,
        category: p.category,
        price: Number(p.price) || 0,
        images: imgs,
        desc: p.desc || "",
        stock: p.stock !== undefined ? Number(p.stock) : 10,
        visible: p.visible !== false,
      });

      existingIds.add(idStr);
      existingNamesByCat.add(nameCatKey);
    }

    console.log(`\n🔍 Nuevos productos listos para subir a Supabase: ${toInsert.length}`);

    if (toInsert.length === 0) {
      console.log("✨ No hay nuevos productos por subir. Todo está al día.");
      return;
    }

    // Insertar en lotes pequeños
    const BATCH_SIZE = 25;
    let insertedCount = 0;

    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const chunk = toInsert.slice(i, i + BATCH_SIZE);
      await fetchSupabase("/products", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(chunk),
      });

      insertedCount += chunk.length;
      process.stdout.write(`\r⏳ Subiendo a Supabase: ${insertedCount}/${toInsert.length} productos...`);
    }

    console.log("\n\n🎉 ¡Sincronización finalizada con éxito!");
    console.log(`Total de productos nuevos ingresados a Supabase: ${insertedCount}`);
  } catch (err) {
    console.error("\n❌ Error durante la sincronización:", err.message);
    process.exit(1);
  }
}

sync();
