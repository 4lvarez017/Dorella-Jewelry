// ─── SUPABASE CONFIG (CONEXION REVISADA) ───────────────────────────────────────
export const SUPABASE_URL = "https://hszxtkwalgndaovckaug.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzenh0a3dhbGduZGFvdmNrYXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxODU3NTksImV4cCI6MjA5NTc2MTc1OX0.Bjbk9ASl1OjtkaHbh2YsdR1LzCQP1OMSnYQ6RZmcLcs";

const supabaseHeaders = {
  "Content-Type": "application/json",
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

export async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: { ...supabaseHeaders, ...options.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  // 204 No Content (PATCH, DELETE) — no tiene body
  if (res.status === 204 || res.headers.get("content-length") === "0") return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── REVIEWS CRUD ────────────────────────────────────────────────────────────
export async function fetchReviews(productId) {
  return supabaseFetch(
    `/reviews?product_id=eq.${encodeURIComponent(productId)}&order=created_at.desc`
  );
}

export async function insertReview({ productId, name, rating, comment }) {
  return supabaseFetch("/reviews", {
    method: "POST",
    headers: { "Prefer": "return=minimal" },
    body: JSON.stringify({ product_id: productId, name, rating, comment }),
  });
}

export async function deleteReview(id) {
  return supabaseFetch(`/reviews?id=eq.${id}`, { method: "DELETE" });
}

export async function fetchAllReviews() {
  return supabaseFetch("/reviews?select=*&order=created_at.desc");
}

/**
 * Sube un archivo de imagen a Supabase Storage dentro de la carpeta
 * correspondiente a la categoría del producto.
 *
 * @param {File}   file      - Archivo de imagen seleccionado por el usuario
 * @param {string} category  - Nombre de la categoría (ej. "Brazaletes Hombre")
 * @returns {Promise<string>} URL pública permanente de la imagen
 */
export async function uploadProductImage(file, category) {
  const { categoryToSlug } = await import("./storageCategories.js");

  // Generar nombre de archivo único para evitar colisiones
  const ext      = file.name.split(".").pop().toLowerCase();
  const slug     = categoryToSlug(category);
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path     = `${slug}/${filename}`;

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/products/${path}`,
    {
      method: "POST",
      headers: {
        apikey:        SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": file.type || "image/jpeg",
      },
      body: file,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error al subir imagen: ${err}`);
  }

  // Retornar URL pública del archivo subido
  return `${SUPABASE_URL}/storage/v1/object/public/products/${path}`;
}
