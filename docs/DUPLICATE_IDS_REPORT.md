# DORELLA JEWELRY — REPORTE DE IDS DUPLICADOS Y RESOLUCIÓN

## 1. Resumen Ejecutivo

Durante la auditoría integral se detectaron **37 identificadores numéricos compartidos** entre 115 productos en los archivos estáticos de datos (`src/data/products/*.js`).

Estos duplicados se dividen en dos naturalezas con diferente impacto:
1. **Duplicados inter-categoría (10 casos)**: Dos productos de categorías completamente distintas compartían el mismo ID (ej. Aretes y Brazaletes Hombre). Este fenómeno era la **causa raíz directa de la mezcla de componentes en pantalla y el bug visual "Anillos / Aretes muestra Brazaletes"**, dado que React utilizaba `key={p.id}`. Al cambiar de categoría o filtrar, el algoritmo de reconciliación de React reutilizaba el elemento del DOM anterior pensando que era la misma entidad.
2. **Duplicados intra-categoría (27 casos)**: Variantes de un mismo modelo o lote (por ejemplo, Dijes de letras del alfabeto con el mismo código de referencia de catálogo, ej. ref `26360` repetido 21 veces para las letras A-Z).

---

## 2. Inventario Detallado de IDs Duplicados

### 2.1 Duplicados Inter-Categoría (Críticos)

| ID | Repeticiones | Categorías en conflicto | Archivos involucrados |
|---|---|---|---|
| **20004** | 2 | Brazaletes Pareja, Dijes | `brazaletes_pareja.js`, `dijes.js` |
| **23219** | 2 | Brazaletes Pareja, Dijes | `brazaletes_pareja.js`, `dijes.js` |
| **23315** | 2 | Brazaletes Pareja, Dijes | `brazaletes_pareja.js`, `dijes.js` |
| **30037** | 2 | Aretes, Brazaletes Mujer | `aretes.js`, `brazaletes_mujer.js` |
| **34044** | 2 | Aretes, Brazaletes Mujer | `aretes.js`, `brazaletes_mujer.js` |
| **34173** | 2 | Aretes, Brazaletes Mujer | `aretes.js`, `brazaletes_mujer.js` |
| **34188** | 2 | Aretes, Brazaletes Hombre | `aretes.js`, `brazaletes_hombre.js` |
| **34214** | 2 | Aretes, Brazaletes Hombre | `aretes.js`, `brazaletes_hombre.js` |
| **34259** | 2 | Aretes, Brazaletes Mujer | `aretes.js`, `brazaletes_mujer.js` |
| **166634** | 2 | Brazaletes Hombre, Brazaletes Pareja | `brazaletes_hombre.js`, `brazaletes_pareja.js` |

### 2.2 Duplicados Intra-Categoría (Variantes de Catálogo)

| ID | Repeticiones | Categoría | Detalle de Productos |
|---|---|---|---|
| **26360** | 21 | Dijes | D Letras A, B, C, D, E, F, G, H, I, J, K, N, O, P, Q, R, T, U, V, W, X, Y, Z |
| **23370** | 13 | Dijes | D Letra C, E, F, I, L, N, O, P, R, S, T, V, Y |
| **25360** | 11 | Dijes | D Letras E, H, N, O, P, R, T, U, V, W, Z |
| **24360** | 4 | Dijes | D Letras E, N, P, R |
| **23130** | 3 | Dijes | D Serpiente Cristal, D Serpiente Negra, D Serpiente Verde |
| **23216** | 3 | Dijes | D Murrey Brightness, D Blue Brightness, D Green Brightness |
| **24800** | 3 | Herrajes | H Rondel circonias 5mm (Cristal, Negro, Verde) |
| **33021** | 3 | Aretes | A Topo Circon Cuadrado (Negro, Rojo, Rosa) |
| **33023** | 3 | Aretes | A Topo Circonia Corazón (Negro, Rojo, Rosa) |
| **50003** | 3 | Pulseras | P Hilo Laminado 15 Cms + Extensor |
| **23068** | 2 | Dijes | D Letra G, D Letra H |
| **23069** | 2 | Dijes | D Cruz circonias, D Cruz lisa |
| **23147** | 2 | Dijes | D Trébol verde, D Trébol negro |
| **23182** | 2 | Dijes | D Corazón nácar, D Corazón rosa |
| **23189** | 2 | Dijes | D Medalla San Benito plata/oro |
| **23217** | 2 | Dijes | D Sol nacarado, D Luna circonias |
| **23319** | 2 | Dijes | D Ancla marino, D Timón |
| **23360** | 2 | Dijes | D Letras especiales |
| **23555** | 2 | Cruceros | C San Benito plateado, dorado |
| **24555** | 2 | Cruceros | C Virgen Milagrosa 2 tamaños |
| **24799** | 2 | Herrajes | H Separador microcirconias (2 colores) |
| **27649** | 2 | Brazaletes Pareja | BP Distancia blanco/negro |
| **33022** | 2 | Aretes | A Circonia Redonda (Negro, Cristal) |
| **34107** | 2 | Aretes | A Candonga circonias (Oro, Plata) |
| **34276** | 2 | Aretes | A Topos gota (Cristal, Esmeralda) |
| **54004** | 2 | Tobilleras | T Bolitas laminadas |
| **94034** | 2 | Rosarios | R Rosario perlado oro/plata |

---

## 3. Soluciones Implementadas

### A. A Nivel Frontend (React Reconciliation)
En todos los componentes de listado (`CatalogSection.jsx`, `ProductosTab.jsx`, `InventarioTab.jsx`):
```jsx
// ANTES (Causaba el bug visual por colisión de claves)
<ProductCard key={p.id} ... />

// AHORA (Clave compuesta única que aísla por categoría e ID)
<ProductCard key={`${p.id}-${p.category}`} ... />
```
Esto garantiza que nunca exista una colisión en el árbol virtual del DOM entre productos de categorías diferentes.

### B. A Nivel Filtros de Categoría
En `CatalogSection.jsx` e `InventarioTab.jsx`:
```jsx
// ANTES (startsWith permitía que prefijos compartidos mezclaran productos)
visible.filter(p => (p.category || "").startsWith(activeCategory));

// AHORA (Coincidencia exacta estricta)
visible.filter(p => (p.category || "") === activeCategory);
```

### C. A Nivel Sincronización con Supabase (`sync_products.js`)
El script de sincronización (`sync_products.js`):
1. Detecta si un ID ya fue visto durante la carga de productos locales.
2. Si encuentra un ID duplicado, genera automáticamente un ID canónico determinista y seguro:
   `prod-${category_slug}-${timestamp}-${hash}`
3. Utiliza la directiva PostgREST `Prefer: resolution=merge-duplicates` (UPSERT) para evitar errores de clave primaria y no sobrescribir arbitrariamente productos existentes.
