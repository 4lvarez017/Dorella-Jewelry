-- ═══════════════════════════════════════════════════════════════════════════════
-- DORELLA JEWELRY — MIGRACIÓN RLS: REVIEWS
-- ═══════════════════════════════════════════════════════════════════════════════
-- OBJETIVO:
--   PUBLIC: SELECT + INSERT (leer y crear reseñas)
--   ADMIN:  DELETE (moderar reseñas)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Enable read access for all users" ON reviews;
DROP POLICY IF EXISTS "Enable insert for all users" ON reviews;
DROP POLICY IF EXISTS "Enable update for all users" ON reviews;
DROP POLICY IF EXISTS "Enable delete for all users" ON reviews;
DROP POLICY IF EXISTS "Allow public read" ON reviews;
DROP POLICY IF EXISTS "Allow public insert" ON reviews;
DROP POLICY IF EXISTS "Allow public delete" ON reviews;

-- Cualquier usuario puede leer reseñas
CREATE POLICY "reviews_select_public"
  ON reviews
  FOR SELECT
  USING (true);

-- Cualquier usuario puede crear reseñas
CREATE POLICY "reviews_insert_public"
  ON reviews
  FOR INSERT
  WITH CHECK (true);

-- Solo admin puede eliminar reseñas
CREATE POLICY "reviews_delete_admin"
  ON reviews
  FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
