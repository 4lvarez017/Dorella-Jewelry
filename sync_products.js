import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./src/lib/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Helpers ────────────────────────────────────────────────────────────────
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
      `/products?select=id,name,category,price,stock,visible,desc,images&limit=${PAGE}&offset=${offset}`
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

// ─── Sync principal ─────────────────────────────────────────────────────────
async function sync() {
  try {
    console.log("==================================================");
    console.log("🚀 SINCRONIZACIÓN IDEMPOTENTE DE TODAS LAS CATEGORÍAS");
    console.log("==================================================");

    const localProducts = await loadAllLocalProducts();
    console.log(`📦 Encontrados ${localProducts.length} productos en archivos locales.`);

    const existing = await getAllExistingProducts();
    console.log(`✅ Se encontraron ${existing.length} productos registrados en Supabase.`);

    // Crear mapa por ID para comparación rápida
    const existingById = new Map(existing.map((p) => [String(p.id), p]));
    
    // Crear set por (Categoría + Nombre) para detectar duplicados por nombre
    const existingNamesByCat = new Map();
    existing.forEach(p => {
      const key = `${normalizeStr(p.category)}:::${normalizeStr(p.name)}`;
      existingNamesByCat.set(key, p);
    });

    // Detectar IDs duplicados en datos locales
    const idCounts = {};
    localProducts.forEach(p => {
      const id = String(p.id);
      idCounts[id] = (idCounts[id] || 0) + 1;
    });
    const duplicateIds = Object.entries(idCounts).filter(([, c]) => c > 1);
    if (duplicateIds.length > 0) {
      console.log(`\n⚠️  ADVERTENCIA: ${duplicateIds.length} IDs duplicados encontrados en datos locales.`);
      console.log("   Estos productos necesitan IDs únicos antes de sincronizar.");
      duplicateIds.forEach(([id, count]) => {
        const names = localProducts.filter(p => String(p.id) === id).map(p => `"${p.name}" (${p.category})`);
        console.log(`   ID "${id}" × ${count}: ${names.join(", ")}`);
      });
      console.log("");
    }

    const toInsert = [];
    const toUpdate = [];
    const skipped = [];
    const seenIds = new Set();

    for (const p of localProducts) {
      const rawId = String(p.id);
      
      // Si el ID ya fue procesado en este ciclo (duplicado local), generar uno nuevo
      let finalId;
      if (seenIds.has(rawId)) {
        finalId = `prod-${normalizeStr(p.category).replace(/\s/g, '_')}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        console.log(`  ⚠️  ID duplicado "${rawId}" → generado "${finalId}" para "${p.name}"`);
      } else {
        finalId = rawId.startsWith("prod-") || rawId.startsWith("chryso-") || rawId.startsWith("custom-")
          ? rawId
          : rawId;
      }
      seenIds.add(finalId);

      const imgs = Array.isArray(p.images)
        ? p.images
        : [p.image || "/placeholder.jpg"];

      const productData = {
        id: finalId,
        name: p.name,
        category: p.category,
        price: Number(p.price) || 0,
        images: imgs,
        desc: p.desc || "",
        stock: p.stock !== undefined ? Number(p.stock) : 10,
        visible: p.visible !== false,
      };

      const existingProduct = existingById.get(finalId);
      
      if (existingProduct) {
        // Producto ya existe por ID — verificar si necesita actualización
        const needsUpdate =
          existingProduct.name !== productData.name ||
          existingProduct.category !== productData.category ||
          existingProduct.price !== productData.price;
        
        if (needsUpdate) {
          toUpdate.push(productData);
        } else {
          skipped.push(productData);
        }
      } else {
        // Verificar si existe por nombre+categoría (evitar duplicación semántica)
        const nameCatKey = `${normalizeStr(p.category)}:::${normalizeStr(p.name)}`;
        if (existingNamesByCat.has(nameCatKey)) {
          skipped.push(productData);
        } else {
          toInsert.push(productData);
          existingNamesByCat.set(nameCatKey, productData);
        }
      }
    }

    console.log(`\n📊 Resumen de sincronización:`);
    console.log(`   ✅ Sin cambios: ${skipped.length}`);
    console.log(`   🆕 Nuevos para insertar: ${toInsert.length}`);
    console.log(`   🔄 Para actualizar: ${toUpdate.length}`);

    if (toInsert.length === 0 && toUpdate.length === 0) {
      console.log("\n✨ Todos tus productos ya están completamente sincronizados en Supabase.");
      return;
    }

    // Insertar nuevos productos usando UPSERT para máxima seguridad
    if (toInsert.length > 0) {
      console.log(`\n⏳ Insertando ${toInsert.length} productos nuevos...`);
      let insertedCount = 0;
      for (const prod of toInsert) {
        try {
          await fetchSupabase("/products", {
            method: "POST",
            headers: { 
              Prefer: "return=minimal",
              "on-conflict": "id",
            },
            body: JSON.stringify(prod),
          });
          insertedCount++;
          process.stdout.write(`\r   Insertados: ${insertedCount}/${toInsert.length}`);
        } catch (insertErr) {
          console.error(`\n   ⚠️ No se pudo insertar "${prod.name}":`, insertErr.message);
        }
      }
      console.log("");
    }

    // Actualizar productos existentes
    if (toUpdate.length > 0) {
      console.log(`\n⏳ Actualizando ${toUpdate.length} productos...`);
      let updatedCount = 0;
      for (const prod of toUpdate) {
        try {
          const { id, ...updates } = prod;
          await fetchSupabase(`/products?id=eq.${encodeURIComponent(id)}`, {
            method: "PATCH",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify(updates),
          });
          updatedCount++;
          process.stdout.write(`\r   Actualizados: ${updatedCount}/${toUpdate.length}`);
        } catch (updateErr) {
          console.error(`\n   ⚠️ No se pudo actualizar "${prod.name}":`, updateErr.message);
        }
      }
      console.log("");
    }

    console.log("\n🎉 ¡Sincronización finalizada con éxito!");
  } catch (err) {
    console.error("\n❌ Error durante la sincronización:", err.message);
    process.exit(1);
  }
}

sync();
