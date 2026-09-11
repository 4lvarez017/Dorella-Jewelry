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
    // Si la sesión expiró (401) y estábamos usando un token de sesión:
    // NO reintentar con anon key — eso sería una degradación de permisos peligrosa.
    // Limpiar la sesión inválida y propagar el error para forzar re-login.
    if (res.status === 401 && session?.access_token) {
      storeSession(null);
      const errorText = await res.text();
      throw new Error(`Sesión expirada. Por favor inicia sesión nuevamente. (${errorText})`);
    }
    const errorText = await res.text();
    throw new Error(errorText);
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

/**
 * Verifica si la sesión actual tiene el rol de administrador.
 * Comprueba app_metadata.role === 'admin' en el JWT decodificado.
 */
export function isAdminSession() {
  const session = getStoredSession();
  if (!session?.access_token) return false;

  try {
    // Decodificar el payload del JWT (base64url)
    const payload = session.access_token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded?.app_metadata?.role === 'admin';
  } catch {
    return false;
  }
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
  // Verificar que hay sesión activa — NO subir como anon
  const session = getStoredSession();
  if (!session?.access_token) {
    throw new Error("Debes iniciar sesión para subir imágenes. Tu sesión puede haber expirado.");
  }

  // Generar nombre de archivo único para evitar colisiones
  const rawExt = file.name ? file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  const ext = rawExt || "jpg";
  const slug = categoryToSlug(category);
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${slug}/${filename}`;

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/products/${path}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": file.type || "image/jpeg",
      },
      body: file,
    }
  );

  if (!res.ok) {
    if (res.status === 401) {
      storeSession(null);
      throw new Error("Sesión expirada. Por favor inicia sesión nuevamente para subir imágenes.");
    }
    const err = await res.text();
    throw new Error(`Error al subir imagen: ${err}`);
  }

  // Retornar URL pública del archivo subido
  return `${SUPABASE_URL}/storage/v1/object/public/products/${path}`;
}
