# DORELLA JEWELRY — Guía de Configuración de Supabase

## Proyecto

- **URL**: `https://hszxtkwalgndaovckaug.supabase.co`
- **Dashboard**: [Supabase Dashboard](https://supabase.com/dashboard/project/hszxtkwalgndaovckaug)

---

## Paso 1: Ejecutar las migraciones SQL

Ejecutar los scripts SQL en orden desde la consola SQL del dashboard:

1. `supabase/migrations/001_products_rls.sql` — RLS para `products`
2. `supabase/migrations/002_orders_rls.sql` — RLS para `orders`
3. `supabase/migrations/003_reviews_rls.sql` — RLS para `reviews`
4. `supabase/migrations/004_storage_rls.sql` — RLS para Storage
5. `supabase/migrations/005_schema_improvements.sql` — Mejoras de esquema

---

## Paso 2: Asignar rol de administrador

En la consola SQL del dashboard, ejecutar:

```sql
-- Obtener el UUID del usuario admin
SELECT id, email FROM auth.users;

-- Asignar rol admin (reemplazar USER_ID con el UUID real)
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE id = 'USER_ID_DEL_ADMIN';
```

Esto agrega `"role": "admin"` al JWT del usuario, permitiendo que las políticas RLS lo reconozcan como administrador.

---

## Paso 3: Verificar el bucket de Storage

1. Ir a **Storage** en el dashboard
2. Verificar que existe el bucket `products`
3. Si no existe, crearlo con **público = true**
4. Después de ejecutar `004_storage_rls.sql`, verificar que las políticas están activas

---

## Paso 4: Verificar tablas

### Tabla `products`
| Columna | Tipo | Notas |
|---|---|---|
| id | text (PK) | |
| name | text | |
| category | text | |
| price | numeric | |
| images | jsonb | Array de URLs |
| desc | text | |
| stock | integer | |
| visible | boolean | default true |
| created_at | timestamptz | |
| updated_at | timestamptz | Auto-actualizado por trigger |

### Tabla `orders`
| Columna | Tipo | Notas |
|---|---|---|
| id | text (PK) | Formato: `DJ-{timestamp}` |
| customer_name | text | |
| phone | text | |
| address | text | |
| city | text | |
| payment_method | text | |
| items | text (JSON) | Array de items serializado |
| total | numeric | |
| status | text | Pendiente/Enviado/Completado/Cancelado |
| created_at | timestamptz | |

### Tabla `reviews`
| Columna | Tipo | Notas |
|---|---|---|
| id | integer (PK, auto) | |
| product_id | text | |
| name | text | Nombre del reviewer |
| rating | integer | 1-5 |
| comment | text | |
| created_at | timestamptz | |

---

## Verificación de seguridad

Después de aplicar las migraciones, probar desde DevTools del navegador (como usuario anónimo):

```javascript
// Esto DEBE fallar con error de RLS
fetch("https://hszxtkwalgndaovckaug.supabase.co/rest/v1/products", {
  method: "DELETE",
  headers: {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "Content-Type": "application/json"
  }
}).then(r => console.log("Status:", r.status, r.statusText));
// Esperado: 403 o 401
```

---

## Proyecto antiguo (migración de imágenes)

El proyecto antiguo `oepxxlqvfxkwgwjchkzz` contiene 49 imágenes de anillos que están referenciadas en `src/data/products/anillos.js`. Para migrarlas:

1. Verificar si el proyecto antiguo sigue activo
2. Descargar las imágenes desde las URLs del proyecto antiguo
3. Re-subirlas al bucket `products` del proyecto nuevo
4. Actualizar las URLs en la tabla `products` de Supabase
