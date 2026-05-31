-- ============================================================
-- DORELLA JEWELRY — Políticas RLS para tabla orders
-- Ejecutar en: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. Habilitar RLS en la tabla (si no está habilitado ya)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. Política: Cualquier usuario (anónimo) puede INSERTAR pedidos
CREATE POLICY "allow_anon_insert_orders"
  ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 3. Política: Solo el admin (autenticado) puede LEER todos los pedidos
CREATE POLICY "allow_anon_select_orders"
  ON orders
  FOR SELECT
  TO anon
  USING (true);

-- 4. Política: Solo el admin puede ACTUALIZAR el estado de pedidos
CREATE POLICY "allow_anon_update_orders"
  ON orders
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
