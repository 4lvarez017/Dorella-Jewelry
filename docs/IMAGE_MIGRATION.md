# DORELLA JEWELRY — GUÍA Y MIGRACIÓN DE IMÁGENES

## 1. Contexto

Se identificaron **49 productos** en `src/data/products/anillos.js` cuyas imágenes apuntan a un proyecto anterior de Supabase:
`https://oepxxlqvfxkwgwjchkzz.supabase.co/storage/v1/object/public/uploads/productos/...`

Se verificó mediante solicitud HTTP que el bucket antiguo **continúa activo y entregando respuestas 200 OK**. Por lo tanto, los activos multimedia **no se han perdido** y pueden descargarse o migrarse de forma íntegra.

---

## 2. Inventario de las 49 Imágenes

Todas las imágenes corresponden a la categoría **Anillos** (`anillos.js` líneas 111 a 495):

| ID Producto | Nombre del Producto | Nombre de Archivo Antiguo |
|---|---|---|
| `14001` | Anillo 1 Circonia Cristal | `1782586565475-gajcc3.webp` |
| `14002` | Anillo 1 Circonia Cristal | `1782586396846-mqhd2u.webp` |
| `14003` | Anillo 1 Circonia Cristal | `1782586427348-0dvli2.webp` |
| `14004` | Anillo 1 Circonia Cristal | `1782586473034-wpgy28.webp` |
| `14005` | Anillo 1 Circonia Cristal | `1782586896127-u2ye47.webp` |
| `14006` | Anillo 1 Circonia Cristal | `1782586932658-zuqur7.webp` |
| `14007` | Anillo 1 Circonia Cristal | `1782586958339-1oe8se.webp` |
| `14008` | Anillo Ajustable 1 Circonia | `1782578520242-vkm794.webp` |
| `14009` | Anillo Ajustable 1 Circonia | `1782578556280-pwt0nl.webp` |
| `14010` | Anillo Ajustable 2 Corazones Circonias | `1782583102050-4qtc3m.webp` |
| `14011` | Anillo Ajustable 2 Corazones Circonias | `1782583129813-4cggu8.webp` |
| `14012` | Anillo Ajustable 2 Filas Circonias | `1782583167723-0sotks.webp` |
| `14013` | Anillo Ajustable 3 Circonias | `1782583211321-n4nspi.webp` |
| `14014` | Anillo Ajustable 3 Corazones Circonias | `1782583247154-bocqch.webp` |
| `14015` | Anillo Ajustable 3 Corazones Circonias | `1782583285083-dalgkv.webp` |
| `14016` | Anillo Ajustable Arbol De La Vida Circonias | `1782583321348-z02vjj.webp` |
| `14017` | Anillo Ajustable Arbol De La Vida Circonias | `1782583360699-yekhtb.webp` |
| `14018` | Anillo Ajustable Bolitas | `1782585811631-t92s6q.webp` |
| `14019` | Anillo Ajustable Cadena | `1782834950634-y6s49o.webp` |
| `14020` | Anillo Ajustable Cadena | `1782834989285-vgwgex.webp` |
| `14021` | Anillo Ajustable Cadena | `1782835084725-o0scvh.webp` |
| `14022` | Anillo Ajustable Cadena | `1782835116344-d7i6zf.webp` |
| `14023` | Anillo Ajustable Cadena | `1782835180146-jz8n5p.webp` |
| `14024` | Anillo Ajustable Cadena | `1782835785635-81hx3n.webp` |
| `14025` | Anillo Ajustable Cadena | `1782835706330-3hwaht.webp` |
| `14026` | Anillo Ajustable Cadena | `1782835315233-iu8tom.webp` |
| `14027` | Anillo Ajustable Candado | `1782853889800-k8vm8k.webp` |
| `14028` | Anillo Ajustable Candado | `1782834412758-bs7pwr.webp` |
| `14029` | Anillo Ajustable Candado | `1782853903816-mhitd8.webp` |
| `14030` | Anillo Ajustable Candado | `1782834066074-z17461.webp` |
| `14031` | Anillo Ajustable Candado | `1782836673885-piymbo.webp` |
| `14032` | Anillo Ajustable Candado | `1782834037240-bzubyc.webp` |
| `14033` | Anillo Ajustable Carita Feliz | `1782833145996-u00xx0.webp` |
| `14034` | Anillo Ajustable Circulo Circonias | `1782832503819-y8lifb.webp` |
| `14035` | Anillo Ajustable Circulo Circonias | `1782832440347-t8wb8k.webp` |
| `14036` | Anillo Ajustable Clavo Circonias | `1782832117682-ngmg9h.webp` |
| `14037` | Anillo Ajustable Clavo Circonias | `1782831966220-7gfyfj.webp` |
| `14038` | Anillo Ajustable Corazon | `1782831808578-xw18sa.webp` |
| `14039` | Anillo Ajustable Corazon Circonias | `1782831667968-4abkiw.webp` |
| `14040` | Anillo Ajustable Corazon Circonias | `1782831013427-48spzh.webp` |
| `14041` | Anillo Ajustable Corazon Circonias | `1782830985390-jgtyuj.webp` |
| `14042` | Anillo Ajustable Corazon Circonias | `1782830948375-py8i8s.webp` |
| `14043` | Anillo Ajustable Corona Circonias | `1782590293714-c76lmh.webp` |
| `14044` | Anillo Ajustable Corona Circonias | `1782589930665-8bdz5u.webp` |
| `14045` | Anillo Ajustable Corona Circonias | `1782831452817-5b6ek9.webp` |
| `14046` | Anillo Ajustable Cruz | `1782589615565-hfog3p.webp` |
| `14047` | Anillo Ajustable Cruz Circonias | `1782589560095-vb7a3m.webp` |
| `14048` | Anillo Ajustable Cruz Circonias | `1782589525785-ev8ozb.webp` |
| `14049` | Anillo Ajustable Cruz Circonias | `1782588148250-qmzb9z.webp` |

---

## 3. Ejecución de la Migración Automática

Se ha proporcionado un script automatizado en:
`scripts/migrate_images.js`

### Opción A: Descarga Local a `public/ANILLOS/` (Recomendada para respaldo offline)
Ejecuta:
```bash
node scripts/migrate_images.js --mode=download
```
Esto descargará los 49 archivos `.webp` en la carpeta `public/ANILLOS/` y actualizará automáticamente las referencias en `src/data/products/anillos.js` a `/ANILLOS/<archivo>.webp`.

### Opción B: Subida directa al nuevo Storage de Supabase (`products`)
Ejecuta:
```bash
node scripts/migrate_images.js --mode=upload
```
Descargará los buffers y los subirá directamente a:
`https://hszxtkwalgndaovckaug.supabase.co/storage/v1/object/public/products/anillos/<archivo>.webp`
actualizando las URLs en `anillos.js` y en la base de datos Supabase.
