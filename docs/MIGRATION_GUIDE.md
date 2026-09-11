# DORELLA JEWELRY — GUÍA DE MIGRACIÓN Y PUESTA EN MARCHA

Esta guía contiene la secuencia exacta de pasos para desplegar las correcciones de seguridad, base de datos y catálogo en Supabase y en producción.

---

## Paso 1: Ejecutar las Migraciones SQL en Supabase

Accede al editor SQL del proyecto activo:
👉 [Supabase SQL Editor - hszxtkwalgndaovckaug](https://supabase.com/dashboard/project/hszxtkwalgndaovckaug/sql)

Ejecuta los archivos SQL en este orden estricto:

1. **`supabase/migrations/001_products_rls.sql`**
   - Habilita RLS en `products`.
   - Anon: Solo SELECT de productos visibles (`visible = true`).
   - Admin: CRUD completo basado en rol en JWT.

2. **`supabase/migrations/002_orders_rls.sql`**
   - Habilita RLS en `orders`.
   - Anon: Solo INSERT (creación de pedidos).
   - Admin: SELECT, UPDATE, DELETE para gestión de pedidos.

3. **`supabase/migrations/003_reviews_rls.sql`**
   - Habilita RLS en `reviews`.
   - Anon: SELECT e INSERT (lectura y publicación de reseñas).
   - Admin: DELETE (moderación de comentarios).

4. **`supabase/migrations/004_storage_rls.sql`**
   - Habilita RLS en el storage de Supabase para el bucket `products`.
   - Anon: Solo lectura (`SELECT`) de imágenes.
   - Admin: Subida, reemplazo y borrado (`INSERT`, `UPDATE`, `DELETE`).

5. **`supabase/migrations/005_schema_improvements.sql`**
   - Agrega columna `updated_at` y trigger automático en `products`.
   - Agrega validación CHECK de calificación 1-5 estrellas en `reviews`.
   - Agrega validación CHECK de estados en `orders`.

6. **`supabase/migrations/006_create_order_rpc.sql`**
   - Crea el procedimiento almacenado `create_order` para validación y descuento atómico de stock.

---

## Paso 2: Asignar el Rol `admin` al Usuario Administrador

1. Ve a [Supabase Dashboard > Authentication > Users](https://supabase.com/dashboard/project/hszxtkwalgndaovckaug/auth/users).
2. Localiza el email de administración (o cópialo). Haz clic para ver su **User UID** (un UUID como `12345678-abcd-...`).
3. Ve a [SQL Editor](https://supabase.com/dashboard/project/hszxtkwalgndaovckaug/sql) y ejecuta:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE id = 'TU_USER_UID_AQUI';
```

4. El usuario ahora tendrá `app_metadata.role = 'admin'` embebido en su JWT al iniciar sesión, lo que le otorga permisos de escritura en la base de datos y en Storage.

---

## Paso 3: Sincronización Idempotente del Catálogo

Para cargar o actualizar el catálogo sin duplicados ni pérdidas:

```bash
node sync_products.js
```

El script:
- Compara los productos existentes en Supabase con los datos locales.
- Actualiza productos existentes si han cambiado nombre, precio o categoría.
- Inserta productos nuevos mediante `UPSERT` (`resolution=merge-duplicates`).
- Resuelve colisiones de IDs duplicados generando identificadores canónicos únicos.

---

## Paso 4: Pruebas de Verificación

Ejecuta las pruebas automáticas para confirmar que la aplicación opera de forma íntegra:

```bash
# 1. Verificar lógica de categorías y ausencia de colisiones
node scripts/test_categories.js

# 2. Verificar protección y permisos RLS de Supabase
node scripts/test_rls.js

# 3. Compilación de producción
npm run build
```
