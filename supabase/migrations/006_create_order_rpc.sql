-- ═══════════════════════════════════════════════════════════════════════════════
-- DORELLA JEWELRY — FUNCIÓN RPC: CREATE_ORDER
-- ═══════════════════════════════════════════════════════════════════════════════
-- Ejecutar en la consola SQL del Dashboard de Supabase:
-- https://supabase.com/dashboard/project/hszxtkwalgndaovckaug/sql
--
-- OBJETIVO:
--   1. Validar existencia y stock de cada producto atómicamente
--   2. Calcular el total server-side evitando manipulación de precios
--   3. Descontar stock de productos comprados
--   4. Crear el pedido en la tabla orders
--   5. Revertir toda la transacción si falta stock o producto no existe
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.create_order(
  p_order_id TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_city TEXT,
  p_customer_address TEXT,
  p_customer_notes TEXT DEFAULT '',
  p_payment_method TEXT DEFAULT 'WhatsApp',
  p_items JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Permite descontar stock e insertar pedido de forma atómica
AS $$
DECLARE
  v_item JSONB;
  v_prod_id TEXT;
  v_qty INT;
  v_current_stock INT;
  v_price NUMERIC;
  v_calc_total NUMERIC := 0;
  v_order JSONB;
BEGIN
  -- 1. Validar que la orden tenga items
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'El pedido debe contener al menos un producto.';
  END IF;

  -- 2. Validar stock y existencia de cada producto
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_prod_id := v_item->>'product_id';
    IF v_prod_id IS NULL THEN
      v_prod_id := v_item->>'id';
    END IF;
    v_qty := COALESCE((v_item->>'qty')::INT, 1);

    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'La cantidad solicitada para el producto % debe ser mayor a 0', v_prod_id;
    END IF;

    -- Bloquear fila para actualización atómica y verificar stock
    SELECT stock, price INTO v_current_stock, v_price
    FROM products
    WHERE id = v_prod_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto % no encontrado en el catálogo.', v_prod_id;
    END IF;

    IF v_current_stock < v_qty THEN
      RAISE EXCEPTION 'Stock insuficiente para el producto %. Disponible: %, solicitado: %',
        v_prod_id, v_current_stock, v_qty;
    END IF;

    -- Acumular total con precio real de la base de datos
    v_calc_total := v_calc_total + (v_price * v_qty);

    -- Descontar stock
    UPDATE products
    SET stock = stock - v_qty
    WHERE id = v_prod_id;
  END LOOP;

  -- 3. Insertar pedido con total validado server-side
  INSERT INTO orders (
    id,
    customer_name,
    customer_phone,
    customer_city,
    customer_address,
    customer_notes,
    payment_method,
    items,
    total,
    status,
    created_at
  ) VALUES (
    COALESCE(p_order_id, 'DJ-' || floor(extract(epoch from now()) * 1000)::text),
    p_customer_name,
    p_customer_phone,
    p_customer_city,
    p_customer_address,
    COALESCE(p_customer_notes, ''),
    p_payment_method,
    p_items,
    v_calc_total,
    'Pendiente',
    now()
  )
  RETURNING to_jsonb(orders.*) INTO v_order;

  RETURN jsonb_build_object(
    'success', true,
    'order', v_order
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Ante cualquier error, PostgreSQL revierte automáticamente los cambios
    RAISE;
END;
$$;

-- Otorgar permiso de ejecución para anon y authenticated
GRANT EXECUTE ON FUNCTION public.create_order TO anon, authenticated;
