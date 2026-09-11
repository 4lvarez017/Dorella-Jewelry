-- =============================================================================
-- Migración 009: Limpieza Integral y Preventiva de Duplicados en Todas las Categorías
-- Dorella Jewelry — Auditoría Global y Prevención Permanente
-- =============================================================================

-- PASO 1: Normalización de nombres de categorías (eliminar espacios y capitalizar)
UPDATE products SET category = 'Anillos'           WHERE LOWER(TRIM(category)) = 'anillos';
UPDATE products SET category = 'Aretes'            WHERE LOWER(TRIM(category)) = 'aretes';
UPDATE products SET category = 'Brazaletes Hombre' WHERE LOWER(TRIM(category)) = 'brazaletes hombre';
UPDATE products SET category = 'Brazaletes Mujer'  WHERE LOWER(TRIM(category)) = 'brazaletes mujer';
UPDATE products SET category = 'Brazaletes Niñas'  WHERE LOWER(TRIM(category)) = 'brazaletes niñas' OR LOWER(TRIM(category)) = 'brazaletes ninas';
UPDATE products SET category = 'Brazaletes Niños'  WHERE LOWER(TRIM(category)) = 'brazaletes niños' OR LOWER(TRIM(category)) = 'brazaletes ninos';
UPDATE products SET category = 'Brazaletes Pareja' WHERE LOWER(TRIM(category)) = 'brazaletes pareja';
UPDATE products SET category = 'Cadenas'           WHERE LOWER(TRIM(category)) = 'cadenas';
UPDATE products SET category = 'Conjuntos'         WHERE LOWER(TRIM(category)) = 'conjuntos';
UPDATE products SET category = 'Cruceros'          WHERE LOWER(TRIM(category)) = 'cruceros';
UPDATE products SET category = 'Dijes'             WHERE LOWER(TRIM(category)) = 'dijes';
UPDATE products SET category = 'Herrajes'          WHERE LOWER(TRIM(category)) = 'herrajes';
UPDATE products SET category = 'Pulseras'          WHERE LOWER(TRIM(category)) = 'pulseras';
UPDATE products SET category = 'Rosarios'          WHERE LOWER(TRIM(category)) = 'rosarios';
UPDATE products SET category = 'Tobilleras'        WHERE LOWER(TRIM(category)) = 'tobilleras' OR LOWER(TRIM(category)) = 'tobillera';

-- PASO 2: Eliminación selectiva de los 49 registros duplicados detectados en la auditoría

-- ── Categoría: Anillos (4 duplicados redundantes eliminados) ──
DELETE FROM products
WHERE category = 'Anillos'
  AND (
    name IN ('Anillo Alianza T5', 'Anillo Alianza T5.5', 'Anillo Signal Ajustable', 'Anillo Flicker Ajustable')
    OR id::text IN ('13009', '13100', '13102')
    OR id::text LIKE 'prod-anillos-%'
  )
  -- Proteger siempre los modelos canónicos oficiales
  AND id::text NOT IN ('2', '1', '6', '3')
  AND NOT (images::text LIKE '%/ANILLOS/%');

-- ── Categoría: Aretes (21 duplicados redundantes eliminados) ──
DELETE FROM products
WHERE category = 'Aretes'
  AND (
    name IN ('A Double', 'A Cat Mini', 'A Topo Quadra Crystal 4 mm', 'A Virgen de Guadalupe 9 mm', 'A Topo Rolex 8 mm', 'A Amore Halo 9 mm', 'A Move 12 mm', 'A Corazón Mini', 'A Topo Circonia Corazón NEGRO', 'A Topo Circonia Corazón ROJO', 'A Ojo Turco', 'A Cruz Sagrada Circonias', 'A Osito Teddy', 'A Gypsy', 'A Wave', 'A Cupcake Cristal', 'A Cupcake Verde', 'A Baby Feet', 'A Semi Candonga 3.8 Cms', 'A Candonga Vintage', 'A Ojo Turco')
    OR id::text IN ('30003', '30037', '30038', '30041', '30045', '30046', '30090', '30369', '33023', '34003', '34035', '34067', '34080', '34102', '34107', '34110', '34134', '34139', '34238')
    OR id::text LIKE 'prod-aretes-%'
  )
  -- Proteger siempre los modelos canónicos oficiales
  AND id::text NOT IN ('119', '108', '146', '149', '147', '100', '131', '115', '144', '145', '132', '116', '134', '121', '150', '117', '118', '102', '140', '107')
  AND NOT (images::text LIKE '%/ARETES/%');

-- ── Categoría: Cadenas (12 duplicados redundantes eliminados) ──
DELETE FROM products
WHERE category = 'Cadenas'
  AND (
    name IN ('C Cubana Con Destellos 60 Cm', 'C Espejo Cuadrada 65 Cms', 'C Cubana Sol 65 Cms', 'C Aros 3 mm 65 cms', 'C Franco 45 Cms', 'C Franco 65 Cms', 'C Serpiente 65 Cms', 'C Vintage 1.1 mm 45 Cms', 'C Serpiente  4 mm 65 Cms', 'C Veneciana Gruesa 65 Cms', 'C Lazo 3 mm 65 Cms', 'C 3*1 IT 2.9 mm 65 Cms')
    OR id::text IN ('41413', '42108', '43033', '43058', '43786', '43788', '43833', '44041', '44068', '44768', '44898', '45128')
    OR id::text LIKE 'prod-cadenas-%'
  )
  -- Proteger siempre los modelos canónicos oficiales
  AND id::text NOT IN ('405', '408', '406', '401', '410', '411', '415', '421', '414', '420', '413', '400')
  AND NOT (images::text LIKE '%/CADENAS/%');

-- ── Categoría: Herrajes (7 duplicados redundantes eliminados) ──
DELETE FROM products
WHERE category = 'Herrajes'
  AND (
    name IN ('H Cruz 15 mm', 'H Circonia Redonda Cristal', 'H Charming', 'H Luxo', 'H Lovix', 'H Bola De Fuego 5 mm Cristal', 'H Rondel circonias x 3 4 mm Negro')
    OR id::text IN ('20015', '23255', '23264', '23287', '23343', '24075', '24799')
    OR id::text LIKE 'prod-herrajes-%'
  )
  -- Proteger siempre los modelos canónicos oficiales
  AND id::text NOT IN ('505', '502', '501', '507', '506', '500', '508')
  AND NOT (images::text LIKE '%/HERRAJES/%');

-- ── Categoría: Pulseras (3 duplicados redundantes eliminados) ──
DELETE FROM products
WHERE category = 'Pulseras'
  AND (
    name IN ('P Heart', 'P Franco 20 Cms', 'P Cubana Cruzada 2,4 mm 19.5 Cms')
    OR id::text IN ('50030', '54007', '55207')
    OR id::text LIKE 'prod-pulseras-%'
  )
  -- Proteger siempre los modelos canónicos oficiales
  AND id::text NOT IN ('620', '618', '614')
  AND NOT (images::text LIKE '%/PULSERAS/%');

-- ── Categoría: Rosarios (2 duplicados redundantes eliminados) ──
DELETE FROM products
WHERE category = 'Rosarios'
  AND (
    name IN ('Rosario Hombre 65 cms 4 mm Cristal', 'Rosario Hombre 65 cms 4 mm Verde')
    OR id::text IN ('94034')
    OR id::text LIKE 'prod-rosarios-%'
  )
  -- Proteger siempre los modelos canónicos oficiales
  AND id::text NOT IN ('701', '702')
  AND NOT (images::text LIKE '%/ROSARIOS/%');

-- ── Categoría: Tobilleras (13 duplicados redundantes eliminados) ──
DELETE FROM products
WHERE category = 'Tobilleras'
  AND (
    id::text IN (
      '50029', '52889', '53834', '54004', '54014', '54069',
      '54079', '54094', '54109', '54119', '54294', '54989'
    )
    OR id::text LIKE 'prod-tobilleras-%'
    OR id::text LIKE '54004-%'
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
  AND name NOT IN ('T Tejido Chino 3 Mm 24.5 Cms', 'T Gucci 24 .5 Cms')
  AND id::text NOT IN ('53889', '54039', '800', '801', '802', '803', '804', '805', '806', '807', '808', '809', '810', '811', '812', '813')
  AND NOT (images::text LIKE '%/TOBILLERA/%');

-- PASO 3: Verificación final de integridad y conteo por categoría
SELECT category, COUNT(*) as total_productos, SUM(stock) as stock_total
FROM products
GROUP BY category
ORDER BY category ASC;
