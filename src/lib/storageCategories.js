// ─── MAPA CATEGORÍA → CARPETA EN SUPABASE STORAGE ────────────────────────────
export const CATEGORY_SLUG = {
  "Anillos":             "anillos",
  "Aretes":              "aretes",
  "Brazaletes Hombre":   "brazaletes_hombre",
  "Brazaletes Mujer":    "brazaletes_mujer",
  "Brazaletes Niñas":    "brazaletes_ninas",
  "Brazaletes Niños":    "brazaletes_ninos",
  "Brazaletes Pareja":   "brazaletes_pareja",
  "Cadenas":             "cadenas",
  "Conjuntos":           "conjuntos",
  "Cruceros":            "cruceros",
  "Dijes":               "dijes",
  "Herrajes":            "herrajes",
  "Pulseras":            "pulseras",
  "Rosarios":            "rosarios",
};

/**
 * Convierte el nombre de categoría a slug de carpeta.
 * Si no existe en el mapa, genera uno normalizado automáticamente.
 */
export function categoryToSlug(category = "") {
  return (
    CATEGORY_SLUG[category] ||
    category
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")   // quitar tildes
      .replace(/\s+/g, "_")              // espacios → guiones bajos
      .replace(/[^a-z0-9_]/g, "")        // solo alfanumérico + _
  );
}
