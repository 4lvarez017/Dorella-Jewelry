-- ═══════════════════════════════════════════════════════════════════════════════
-- DORELLA JEWELRY — MIGRACIÓN RLS: STORAGE (bucket: products)
-- ═══════════════════════════════════════════════════════════════════════════════
-- OBJETIVO:
--   PUBLIC: SELECT (leer imágenes)
--   ADMIN:  INSERT, UPDATE, DELETE
--
-- NOTA: Ejecutar en el SQL Editor de Supabase.
-- El bucket "products" debe existir previamente.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Asegurar que el bucket "products" es público para lectura
UPDATE storage.buckets
SET public = true
WHERE id = 'products';

-- Eliminar políticas existentes de storage
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- Lectura pública de imágenes en el bucket "products"
CREATE POLICY "storage_products_select_public"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'products');

-- Solo admin puede subir imágenes
CREATE POLICY "storage_products_insert_admin"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'products'
    AND auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Solo admin puede actualizar imágenes
CREATE POLICY "storage_products_update_admin"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'products'
    AND auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Solo admin puede eliminar imágenes
CREATE POLICY "storage_products_delete_admin"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'products'
    AND auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
