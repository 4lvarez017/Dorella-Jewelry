const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const catalogHtml = await fetchUrl('https://www.beadsmarket.co/joyeria/brazaletes-hombre');
  fs.writeFileSync('catalog_full.html', catalogHtml);
  console.log('Saved catalog_full.html, size:', catalogHtml.length);

  // Look for all img tags or next image URLs or supabase URLs in catalogHtml
  const supabaseImgs = catalogHtml.match(/https:\/\/oepxxlqvfxkwgwjchkzz\.supabase\.co\/storage\/v1\/object\/public\/productos\/[^"'\s]+/g) || [];
  console.log('Unique Supabase product images in catalog HTML:', Array.from(new Set(supabaseImgs)).length);

  // Let's also check if there are other image URLs in the HTML
  const allImgs = catalogHtml.match(/https:\/\/[^"'\s]+\.(?:webp|jpg|jpeg|png)/gi) || [];
  console.log('All image URLs in catalog HTML:', Array.from(new Set(allImgs)).length);

  const items = JSON.parse(fs.readFileSync('beadsmarket_extracted.json', 'utf8'));
  console.log(`Processing ${items.length} items from JSON-LD...`);

  // For any item missing an image, let's fetch its product page or check patterns
  for (let i = 0; i < items.length; i++) {
    const it = items[i].item;
    if (!it.image && it.url) {
      console.log(`Fetching detail for [${i+1}/${items.length}]: ${it.sku} - ${it.name} (${it.url})`);
      try {
        const prodHtml = await fetchUrl(it.url);
        // Find supabase image or other image in prodHtml
        const prodImgs = prodHtml.match(/https:\/\/oepxxlqvfxkwgwjchkzz\.supabase\.co\/storage\/v1\/object\/public\/productos\/[^"'\s<>&]+/g);
        if (prodImgs && prodImgs.length > 0) {
          it.image = prodImgs[0];
          console.log(`  -> Found image: ${it.image}`);
        } else {
          // Check for other image links
          const anyImgs = prodHtml.match(/https:\/\/[^"'\s<>&]+\.(?:webp|jpg|jpeg|png)/gi);
          console.log(`  -> No supabase img. Other imgs:`, anyImgs);
          if (anyImgs && anyImgs.length > 0) {
            // filter out icons/logos
            const valid = anyImgs.filter(u => !u.includes('favicon') && !u.includes('local-envigado'));
            if (valid.length > 0) {
              it.image = valid[0];
              console.log(`  -> Set image to: ${it.image}`);
            }
          }
        }
        // Also check if there is price or description in prodHtml
        const priceMatch = prodHtml.match(/\$\s*([\d\.,]+)/);
        if (priceMatch) {
          it.scrapedPrice = priceMatch[1];
        }
      } catch (err) {
        console.error(`  -> Error fetching ${it.url}:`, err.message);
      }
      // Small delay
      await new Promise(r => setTimeout(r, 200));
    }
  }

  fs.writeFileSync('beadsmarket_full_76.json', JSON.stringify(items, null, 2));
  console.log('Saved beadsmarket_full_76.json!');
}

main().catch(console.error);
