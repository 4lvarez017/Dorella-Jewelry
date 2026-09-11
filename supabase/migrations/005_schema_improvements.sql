-- ═══════════════════════════════════════════════════════════════════════════════
-- DORELLA JEWELRY — MEJORAS DE ESQUEMA
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Agregar columna updated_at a products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Trigger para auto-actualizar updated_at en cada UPDATE
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_products_updated_at ON products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- 3. Constraint de rating en reviews (1-5 estrellas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_rating_check'
  ) THEN
    ALTER TABLE reviews
      ADD CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5);
  END IF;
END $$;

-- 4. Constraint de status en orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_check'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_status_check 
      CHECK (status IN ('Pendiente', 'Enviado', 'Completado', 'Cancelado'));
  END IF;
END $$;

-- 5. Asignar rol de admin al usuario administrador
-- NOTA: Reemplazar 'USER_ID_DEL_ADMIN' con el UUID real del usuario admin.
-- Puedes encontrarlo en: Authentication > Users en el dashboard de Supabase.
--
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
-- WHERE id = 'USER_ID_DEL_ADMIN';
