const fs = require('fs');

const unescaped = fs.readFileSync('next_f_unescaped.txt', 'utf8');

// Let's find the section with "categoria":"Brazaletes Hombre"
// Or parse JSON fragments
// Let's find all products that have categoria: "Brazaletes Hombre"
const items76 = JSON.parse(fs.readFileSync('beadsmarket_extracted.json', 'utf8'));
const skus76 = items76.map(i => i.item.sku.toUpperCase());
console.log('Target 76 SKUs:', skus76);

// Let's search for occurrences of each SKU in unescaped
const results = [];

for (const it of items76) {
  const sku = it.item.sku;
  const regex = new RegExp(`\\{[^{}]*"referencia":"${sku}"[^{}]*\\}`, 'i');
  // Since objects can be nested with arrays or sub-objects, let's find the substring starting at "id":"..." and containing "referencia":"${sku}"
  const skuIdx = unescaped.indexOf(`"referencia":"${sku}"`);
  if (skuIdx !== -1) {
    // Find the opening brace of this object
    // Scan backwards
    let openBrace = unescaped.lastIndexOf('{"id":', skuIdx);
    if (openBrace !== -1) {
      // Let's try to extract balanced JSON object starting at openBrace
      let depth = 0;
      let inString = false;
      let escape = false;
      let endObj = -1;
      for (let i = openBrace; i < unescaped.length; i++) {
        const char = unescaped[i];
        if (escape) {
          escape = false;
          continue;
        }
        if (char === '\\') {
          escape = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === '{') depth++;
          else if (char === '}') {
            depth--;
            if (depth === 0) {
              endObj = i + 1;
              break;
            }
          }
        }
      }
      if (endObj !== -1) {
        const objStr = unescaped.substring(openBrace, endObj);
        try {
          const parsed = JSON.parse(objStr);
          results.push({ sku, originalItem: it.item, parsedData: parsed });
        } catch (e) {
          console.log(`Failed to JSON.parse object for ${sku}:`, e.message);
          results.push({ sku, originalItem: it.item, rawSnippet: objStr });
        }
      }
    }
  } else {
    console.log(`SKU not found in RSC text: ${sku}`);
  }
}

console.log(`Found parsed data for ${results.length} / ${items76.length} products`);
fs.writeFileSync('parsed_76_products.json', JSON.stringify(results, null, 2));

// Let's check image URLs and prices found
let withImages = 0;
let withPrices = 0;
results.forEach(r => {
  if (r.parsedData) {
    console.log(`SKU ${r.sku}: nombre="${r.parsedData.nombre}", imagenes=${JSON.stringify(r.parsedData.imagenes || r.parsedData.imagen || r.parsedData.foto || 'NONE')}, precio=${r.parsedData.precio || r.parsedData.precioVenta || r.parsedData.precios || 'NONE'}`);
    if (r.parsedData.imagenes || r.parsedData.imagen || r.parsedData.foto || r.parsedData.fotos || r.originalItem.image) withImages++;
    if (r.parsedData.precio || r.parsedData.precioVenta || r.parsedData.precios) withPrices++;
  }
});

console.log(`With images: ${withImages}/${results.length}, with prices: ${withPrices}/${results.length}`);
