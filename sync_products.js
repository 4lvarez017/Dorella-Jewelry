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
  console.log("📥 Consultando todos los productos existentes en Supabase...");
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
    console.log(`📦 Encontrados ${localProducts.length} productos en archivos locales.`);

    const existing = await getAllExistingProducts();
    console.log(`✅ Se encontraron ${existing.length} productos registrados en Supabase.`);

    // Crear set con TODOS los IDs existentes en Supabase
    const existingIds = new Set(existing.map((p) => String(p.id)));

    // Crear set por (Categoría + Nombre) para evitar duplicar el mismo producto con otro ID
    const existingNamesByCat = new Set(
      existing.map((p) => `${normalizeStr(p.category)}:::${normalizeStr(p.name)}`)
    );

    const toInsert = [];

    for (const p of localProducts) {
      const rawId = String(p.id);
      const nameCatKey = `${normalizeStr(p.category)}:::${normalizeStr(p.name)}`;

      // Si ya existe por nombre y categoría en Supabase, no lo volvemos a subir
      if (existingNamesByCat.has(nameCatKey)) {
        continue;
      }

      // Generar ID único asegurando que no colisione con los de Supabase
      let finalId = rawId.startsWith("prod-") || rawId.startsWith("chryso-") || rawId.startsWith("custom-")
        ? rawId
        : `prod-${rawId}`;

      // Si por alguna razón ese ID ya existe en Supabase o en el lote actual, creamos un ID único garantizado
      if (existingIds.has(finalId)) {
        finalId = `prod-${rawId}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      }

      const imgs = Array.isArray(p.images)
        ? p.images
        : [p.image || "/placeholder.jpg"];

      toInsert.push({
        id: finalId,
        name: p.name,
        category: p.category,
        price: Number(p.price) || 0,
        images: imgs,
        desc: p.desc || "",
        stock: p.stock !== undefined ? Number(p.stock) : 10,
        visible: p.visible !== false,
      });

      // Marcar para no duplicar en el mismo ciclo
      existingIds.add(finalId);
      existingNamesByCat.add(nameCatKey);
    }

    console.log(`\n🔍 Nuevos productos listos para subir a Supabase: ${toInsert.length}`);

    if (toInsert.length === 0) {
      console.log("✨ Todos tus productos ya están completamente sincronizados en Supabase.");
      return;
    }

    // Insertar producto por producto o en lotes para máxima tolerancia a fallos
    let insertedCount = 0;
    for (const prod of toInsert) {
      try {
        await fetchSupabase("/products", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify(prod),
        });
        insertedCount++;
        process.stdout.write(`\r⏳ Subiendo a Supabase: ${insertedCount}/${toInsert.length} productos...`);
      } catch (insertErr) {
        console.error(`\n⚠️ No se pudo insertar "${prod.name}":`, insertErr.message);
      }
    }

    console.log("\n\n🎉 ¡Sincronización finalizada con éxito!");
    console.log(`Total de productos nuevos ingresados a Supabase: ${insertedCount}`);
  } catch (err) {
    console.error("\n❌ Error durante la sincronización:", err.message);
    process.exit(1);
  }
}

sync();
