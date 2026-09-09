import { categoryToSlug } from "./storageCategories.js";

// ─── SUPABASE CONFIG ───────────────────────────────────────────────────────────
export const SUPABASE_URL = "https://hszxtkwalgndaovckaug.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzenh0a3dhbGduZGFvdmNrYXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxODU3NTksImV4cCI6MjA5NTc2MTc1OX0.Bjbk9ASl1OjtkaHbh2YsdR1LzCQP1OMSnYQ6RZmcLcs";

const supabaseHeaders = {
  "Content-Type": "application/json",
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

export async function supabaseFetch(path, options = {}) {
  // Usar el access_token de sesión si existe (para operaciones protegidas)
  const session = getStoredSession();
  const authHeader = session?.access_token
    ? `Bearer ${session.access_token}`
    : `Bearer ${SUPABASE_ANON_KEY}`;

  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      ...supabaseHeaders,
      Authorization: authHeader,
      ...options.headers,
    },
  });

  if (!res.ok) {
    // Si la sesión expiró (401), reintentar automáticamente con anon key
    if (res.status === 401 && session?.access_token) {
      storeSession(null);
      const retryRes = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
        ...options,
        headers: {
          ...supabaseHeaders,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          ...options.headers,
        },
      });
      if (!retryRes.ok) throw new Error(await retryRes.text());
      if (retryRes.status === 204 || retryRes.headers.get("content-length") === "0") return null;
      const retryText = await retryRes.text();
      return retryText ? JSON.parse(retryText) : null;
    }
    throw new Error(await res.text());
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const SESSION_KEY = "dorella_supabase_session";

function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function storeSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

export async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.message || "Credenciales incorrectas");
  storeSession(data);
  return data;
}

export async function signOut() {
  const session = getStoredSession();
  if (session?.access_token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}` },
    }).catch(() => {});
  }
  storeSession(null);
  // Borrar también el flag antiguo de compatibilidad
  localStorage.removeItem("dorella_admin_logged_in");
}

export async function getSession() {
  const session = getStoredSession();
  if (!session?.access_token) return null;

  // Verificar que el token sigue siendo válido
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}` },
  });
  if (!res.ok) { storeSession(null); return null; }
  return session;
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
  // Generar nombre de archivo único para evitar colisiones
  const rawExt = file.name ? file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  const ext = rawExt || "jpg";
  const slug = categoryToSlug(category);
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${slug}/${filename}`;

  const session = getStoredSession();
  const authHeader = session?.access_token
    ? `Bearer ${session.access_token}`
    : `Bearer ${SUPABASE_ANON_KEY}`;

  let res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/products/${path}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: authHeader,
        "Content-Type": file.type || "image/jpeg",
      },
      body: file,
    }
  );

  // Si falló por token expirado (401), reintentar automáticamente con anon key
  if (!res.ok && res.status === 401 && session?.access_token) {
    storeSession(null);
    res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/products/${path}`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": file.type || "image/jpeg",
        },
        body: file,
      }
    );
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error al subir imagen: ${err}`);
  }

  // Retornar URL pública del archivo subido
  return `${SUPABASE_URL}/storage/v1/object/public/products/${path}`;
}
