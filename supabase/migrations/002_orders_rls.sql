-- ═══════════════════════════════════════════════════════════════════════════════
-- DORELLA JEWELRY — MIGRACIÓN RLS: ORDERS
-- ═══════════════════════════════════════════════════════════════════════════════
-- OBJETIVO:
--   ANON:  Solo INSERT (crear pedido al checkout)
--   ADMIN: SELECT, UPDATE, DELETE
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON orders;
DROP POLICY IF EXISTS "Enable update for all users" ON orders;
DROP POLICY IF EXISTS "Enable delete for all users" ON orders;
DROP POLICY IF EXISTS "Allow public read" ON orders;
DROP POLICY IF EXISTS "Allow public insert" ON orders;
DROP POLICY IF EXISTS "Allow public update" ON orders;
DROP POLICY IF EXISTS "Allow public delete" ON orders;

-- Clientes (anon) pueden crear pedidos
CREATE POLICY "orders_insert_public"
  ON orders
  FOR INSERT
  WITH CHECK (true);

-- Admin puede leer todos los pedidos
CREATE POLICY "orders_select_admin"
  ON orders
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Admin puede actualizar estado de pedidos
CREATE POLICY "orders_update_admin"
  ON orders
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Admin puede eliminar pedidos
CREATE POLICY "orders_delete_admin"
  ON orders
  FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
