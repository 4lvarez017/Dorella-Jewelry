# DORELLA JEWELRY — CONFIGURACIÓN DE STORAGE (SUPABASE)

## 1. Bucket `products`

Dorella Jewelry utiliza un bucket llamado `products` para almacenar las fotos de los productos subidas desde el panel de administración.

- **Nombre del bucket**: `products`
- **Público**: `true` (las imágenes deben poder verse libremente por cualquier cliente)
- **Tamaño máximo por archivo**: `5MB`
- **MIME Types permitidos**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

---

## 2. Creación del Bucket (si aún no existe)

1. Ingresa a [Supabase Dashboard > Storage](https://supabase.com/dashboard/project/hszxtkwalgndaovckaug/storage/buckets).
2. Haz clic en **"New bucket"**.
3. Configura:
   - **Name**: `products`
   - **Public bucket**: ACTÍVALO (verde)
   - **File size limit**: `5242880` (5 MB)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
4. Haz clic en **Save bucket**.

---

## 3. Políticas de Seguridad (RLS) para Storage

Las políticas de acceso están definidas en el archivo [004_storage_rls.sql](file:///c:/Users/User/Desktop/Dorella%20Jewelry/DORELLA-JS/dorella-jewelry/supabase/migrations/004_storage_rls.sql).

Resumen de permisos:
- **Público (anon)**: Solo puede leer (`SELECT`) imágenes del bucket `products`.
- **Admin autenticado**: Puede subir (`INSERT`), actualizar (`UPDATE`) y borrar (`DELETE`) imágenes.
- **Prevención de abuso**: Ningún usuario anónimo puede saturar el almacenamiento de Supabase con archivos arbitrarios.

---

## 4. Estructura de Rutas de Imágenes

Al subir imágenes desde el panel administrativo (`src/lib/supabase.js:uploadProductImage`), las fotos se organizan por categoría:
```
products/
  ├── anillos/
  │    └── 1782586565475-gajcc3.webp
  ├── aretes/
  │    └── ...
  ├── brazaletes-hombre/
  └── ...
```
La función `categoryToSlug` normaliza automáticamente los nombres con tildes y espacios.
