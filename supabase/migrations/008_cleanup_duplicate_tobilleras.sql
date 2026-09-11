-- =============================================================================
-- Migración 008: Limpieza de Tobilleras Duplicadas y Normalización
-- Dorella Jewelry — Prevención de colisión y duplicación de catálogo
-- =============================================================================

-- 1. Normalizar espacios y capitalización de la categoría en productos de tobilleras
UPDATE products
SET category = 'Tobilleras'
WHERE LOWER(TRIM(category)) IN ('tobillera', 'tobilleras');

-- 2. Eliminar los 13 registros duplicados redundantes de tobilleras
--    (conservando los 14 modelos canónicos oficiales con imágenes locales
--     y los 2 modelos únicos: 'T Tejido Chino 3 Mm 24.5 Cms' y 'T Gucci 24 .5 Cms')
DELETE FROM products
WHERE category = 'Tobilleras'
  AND (
    -- Eliminación por ID original o slugs generados por sync
    id::text IN (
      '50029', '52889', '53834', '54004', '54014', '54069',
      '54079', '54094', '54109', '54119', '54294', '54989'
    )
    OR id::text LIKE 'prod-tobilleras-%'
    OR id::text LIKE '54004-%'
    -- Eliminación por nombre exacto de la copia redundante
    OR name IN (
      'T Coeur',
      'T Tejido Chino 2mm 25 cm',
      'Tobillera Serpiente 25 cm',
      'T Circonias Cristal Unisex 22 Cms + Extensor',
      'T Circonias Verde Unisex 22 Cms + Extensor',
      'T Circonia bicolor  24.5cm',
      'T Circonia bicolor 24.5cm',
      'T Ojo Turco Multicolor 23 Cms + 2 Cms  Extensor',
      'T Ojo Turco Multicolor 23 Cms + 2 Cms Extensor',
      'T Blue Dream 23 Cms + Extensor',
      'T Romantic 23 Cms + Extensor',
      'T Sweet Lemon 23 Cms + Extensor',
      'T Perla 23 Cms + Extensor',
      'T Escalera Delg. Plana Lisa 24.5cm',
      'T Militar Delg 1.1 Mm 24 Cms'
    )
  )
  -- NUNCA eliminar los 2 modelos únicos que no tienen duplicado canónico
  AND name NOT IN (
    'T Tejido Chino 3 Mm 24.5 Cms',
    'T Gucci 24 .5 Cms'
  )
  AND id::text NOT IN ('53889', '54039')
  -- NUNCA eliminar los 14 modelos canónicos oficiales (IDs 800 a 813)
  AND id::text NOT IN (
    '800', '801', '802', '803', '804', '805', '806',
    '807', '808', '809', '810', '811', '812', '813'
  );

-- 3. Confirmar conteo de tobilleras resultantes
SELECT id, name, category, price, stock 
FROM products 
WHERE category = 'Tobilleras'
ORDER BY name ASC;
