-- ═══════════════════════════════════════════════════════════════════════════════
-- DORELLA JEWELRY — MIGRACIÓN RLS: PRODUCTS
-- ═══════════════════════════════════════════════════════════════════════════════
-- Ejecutar en la consola SQL del Dashboard de Supabase
-- https://supabase.com/dashboard/project/hszxtkwalgndaovckaug/sql
--
-- OBJETIVO: Restringir el acceso a products
--   ANON:  Solo SELECT (visible = true) 
--   ADMIN: CRUD completo
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Habilitar RLS (probablemente ya está habilitado)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar las políticas permisivas existentes
-- (Ajustar los nombres si difieren; estos son los nombres comunes auto-generados)
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for all users" ON products;
DROP POLICY IF EXISTS "Enable update for all users" ON products;
DROP POLICY IF EXISTS "Enable delete for all users" ON products;
DROP POLICY IF EXISTS "Allow public read" ON products;
DROP POLICY IF EXISTS "Allow public insert" ON products;
DROP POLICY IF EXISTS "Allow public update" ON products;
DROP POLICY IF EXISTS "Allow public delete" ON products;

-- 3. Política de LECTURA pública: solo productos visibles
CREATE POLICY "products_select_public"
  ON products
  FOR SELECT
  USING (visible = true);

-- 4. Política de LECTURA admin: ver todos los productos (incluyendo ocultos)
CREATE POLICY "products_select_admin"
  ON products
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 5. Política de INSERT admin
CREATE POLICY "products_insert_admin"
  ON products
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 6. Política de UPDATE admin
CREATE POLICY "products_update_admin"
  ON products
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 7. Política de DELETE admin
CREATE POLICY "products_delete_admin"
  ON products
  FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
