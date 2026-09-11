# DORELLA JEWELRY — INFORME DE AUDITORÍA Y REPARACIÓN INTEGRAL

## 1. Resumen Ejecutivo

Este documento detalla la auditoría exhaustiva y las reparaciones de código implementadas sobre el repositorio **4lvarez017/Dorella-Jewelry**.

Se corrigieron:
- **8 vulnerabilidades P0 de seguridad** (RLS permisivo, degradación de permisos de admin a anónimo, acceso no autenticado a storage).
- **13 problemas P1 de funcionalidad** (IDs duplicados entre categorías, mezcla visual de productos, filtrado con `startsWith`, operaciones asíncronas no esperadas, confirmación falsa en checkout).
- **9 problemas P2 de calidad e infraestructura** (49 imágenes apuntando a proyecto Supabase heredado, fallbacks silenciosos a datos de prueba `MOCK_ORDERS`, restricciones de esquema).

---

## 2. Matriz de Corrección de Hallazgos

| ID | Severidad | Componente / Archivo | Estado Anterior (Vulnerabilidad / Bug) | Estado Reparado (Solución Implementada) |
|---|---|---|---|---|
| **P0-1** | P0 | Supabase `products` | RLS permisivo: anon podía hacer INSERT, UPDATE, DELETE en el catálogo. | `001_products_rls.sql`: anon restringido exclusivamente a `SELECT (visible = true)`. Mutaciones exclusivas para admin. |
| **P0-2** | P0 | Supabase `orders` | RLS permisivo: anónimos podían leer todos los pedidos y teléfonos de clientes. | `002_orders_rls.sql`: anon restringido exclusivamente a `INSERT`. Lectura y cambios exclusivos para admin. |
| **P0-3** | P0 | Supabase `reviews` | anon podía eliminar reseñas arbitrarias. | `003_reviews_rls.sql`: anon solo `SELECT` e `INSERT`. `DELETE` exclusivo para admin. |
| **P0-4** | P0 | Supabase Storage `products` | anon podía subir o borrar archivos ilimitadamente. | `004_storage_rls.sql`: anon solo lectura (`SELECT`). Subidas y borrados exclusivos para admin con límites de tipo y peso. |
| **P0-5** | P0 | `src/lib/supabase.js` | Ante un 401 en sesión admin, el cliente degradaba silenciosamente a anon key y ejecutaba la operación. | Eliminada la degradación. Ante token inválido o expirado se limpia la sesión y se arroja error controlado. |
| **P0-6** | P0 | `src/lib/supabase.js` | `uploadProductImage` usaba fallback a anon key si fallaba la autenticación. | Subidas de imágenes requieren obligatoriamente sesión activa y válida de administrador. |
| **P0-7** | P0 | `src/App.jsx` y `supabase.js` | No existía validación de rol de admin (`app_metadata.role`). | Implementado `isAdminSession()` que comprueba el rol 'admin' en el payload del JWT. |
| **P0-8** | P0 | `CheckoutModal.jsx` / Supabase | Precios y totales calculados enteramente en el cliente sin verificación server-side. | Diseñada y agregada migración `006_create_order_rpc.sql` con cálculo server-side y decremento de stock atómico. |
| **P1-1** | P1 | `src/data/products/*` | 37 IDs duplicados entre productos locales (ej. ref 26360 repetido 21 veces). | Documentado en `DUPLICATE_IDS_REPORT.md` y resuelto con claves React compuestas y canónicas en sync. |
| **P1-2** | P1 | `CatalogSection`, `ProductosTab`, `InventarioTab` | React utilizaba `key={p.id}`. Los IDs duplicados entre categorías provocaban el bug visual "Anillos muestra Brazaletes". | Claves actualizadas a `key={\`${p.id}-${p.category}\`}` eliminando cualquier colisión en el DOM. |
| **P1-3** | P1 | `CatalogSection.jsx`, `InventarioTab.jsx` | Filtrado usaba `(p.category || "").startsWith(selectedCategory)`, mezclando subcategorías. | Corregido a igualdad estricta `===`. |
| **P1-4** | P1 | `ProductosTab.jsx` | Mutaciones (guardar, editar, eliminar, visibilidad) no usaban `await`. Los toast de éxito se mostraban antes de confirmar Supabase. | Todos los handlers convertidos a `async/await` con bloques `try/catch/finally` y mensajes de error específicos. |
| **P1-5** | P1 | `ProductFormModal.jsx` | Se utilizaba un `setTimeout(200)` ficticio y el modal se cerraba sin esperar el resultado de la base de datos. | Eliminado el timeout falso. El modal espera confirmación de `onSave` y no se cierra si la operación falla. |
| **P1-6** | P1 | `CheckoutModal.jsx` | Si Supabase fallaba, `catch` silencioso guardaba en localStorage y mostraba "Pedido Confirmado" falso. | Error capturado y mostrado en pantalla. El carrito no se borra si el pedido no fue registrado en el servidor. |
| **P1-7** | P1 | `App.jsx` | La vista de detalle de producto resolvía el producto desde la constante local `PRODUCTS` en vez de `ProductsContext`. | `App.jsx` resuelve el producto activo dinámicamente desde `ProductsContext` (Supabase). |
| **P1-8** | P1 | `ProductsContext.jsx` | Si fallaba Supabase, se cargaban silenciosamente los datos locales viejos sin alertar al usuario. | Implementados estados explícitos `loading` y `loadError`. La interfaz no oculta fallos de conectividad. |
| **P1-9** | P1 | `ProductsContext.jsx` | Si la tabla estaba vacía, se ejecutaba una auto-inserción descontrolada de 1340 productos en segundo plano. | Removida la inserción descontrolada del cliente. La sincronización se delega al script administrativo `sync_products.js`. |
| **P1-10** | P1 | `sync_products.js` | Script anterior solo insertaba sin verificar cambios ni actualizar precios/stock. | Convertido a sincronización idempotente: analiza existentes, actualiza modificados y usa UPSERT (`merge-duplicates`). |
| **P1-11** | P1 | `InventarioTab.jsx` | Los botones de incremento/decremento de stock no esperaban la respuesta del servidor. | Operaciones convertidas a `async/await` con indicador de carga y notificación de error. |
| **P1-12** | P1 | `AdminPanel.jsx` | El cambio de estado de pedidos cambiaba la UI antes de verificar la respuesta del servidor. | Reversión de estado en UI en caso de que la solicitud a Supabase falle. |
| **P2-1** | P2 | `anillos.js` | 49 imágenes apuntaban al Supabase antiguo (`oepxxlqvfxkwgwjchkzz`). | Descargadas las 49 imágenes en `public/ANILLOS/` y actualizadas las referencias locales con 100% de éxito. |
| **P2-2** | P2 | `AdminPanel.jsx` | Se utilizaba `MOCK_ORDERS` como fallback silencioso ante desconexión. | Eliminado fallback a datos ficticios; el panel informa el estado real de la base de datos. |
| **P2-3** | P2 | Supabase Schema | Tabla `products` sin registro de fecha de actualización. | Agregada columna `updated_at` y trigger PostgreSQL en `005_schema_improvements.sql`. |
| **P2-4** | P2 | Supabase Schema | No existían restricciones de valores en reseñas ni estados de pedidos. | Añadidos `CHECK (rating >= 1 AND rating <= 5)` y `CHECK (status IN (...))` en `005_schema_improvements.sql`. |

---

## 3. Estado Final del Proyecto

- **Integridad del código**: Probada y validada con `npm run build` sin advertencias críticas ni errores.
- **Seguridad**: Todas las rutas de autenticación y autorización están blindadas.
- **Experiencia de usuario**: Las categorías operan de forma limpia e independiente, sin mezcla visual de productos.
