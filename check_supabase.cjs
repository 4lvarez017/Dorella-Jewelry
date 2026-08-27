const https = require('https');
const fs = require('fs');

const items76 = JSON.parse(fs.readFileSync('beadsmarket_extracted.json', 'utf8'));

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      resolve({ url, status: res.statusCode });
    });
    req.on('error', () => resolve({ url, status: 500 }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ url, status: 408 });
    });
    req.end();
  });
}

async function testAll() {
  console.log('Testing Supabase URLs for all 76 items...');
  const results = [];
  for (const it of items76) {
    const sku = it.item.sku;
    const candidates = [
      `https://oepxxlqvfxkwgwjchkzz.supabase.co/storage/v1/object/public/productos/${sku}/perfil.webp`,
      `https://oepxxlqvfxkwgwjchkzz.supabase.co/storage/v1/object/public/productos/${sku.toUpperCase()}/perfil.webp`,
      `https://oepxxlqvfxkwgwjchkzz.supabase.co/storage/v1/object/public/productos/${sku.toLowerCase()}/perfil.webp`,
      `https://oepxxlqvfxkwgwjchkzz.supabase.co/storage/v1/object/public/productos/${sku}/PERFIL.webp`,
      `https://oepxxlqvfxkwgwjchkzz.supabase.co/storage/v1/object/public/productos/${sku.toUpperCase()}/PERFIL.webp`,
      `https://oepxxlqvfxkwgwjchkzz.supabase.co/storage/v1/object/public/productos/${sku}/${sku}.webp`,
      `https://oepxxlqvfxkwgwjchkzz.supabase.co/storage/v1/object/public/productos/${sku.toUpperCase()}/${sku.toUpperCase()}.webp`,
    ];

    let foundUrl = null;
    for (const url of Array.from(new Set(candidates))) {
      const res = await checkUrl(url);
      if (res.status === 200) {
        foundUrl = url;
        break;
      }
    }

    console.log(`SKU ${sku}: ${foundUrl ? 'FOUND -> ' + foundUrl : 'NOT FOUND'}`);
    results.push({
      sku,
      name: it.item.name,
      foundUrl,
      item: it.item
    });
  }

  const foundCount = results.filter(r => r.foundUrl).length;
  console.log(`\nFound images for ${foundCount} / ${items76.length} products on Supabase`);
  fs.writeFileSync('supabase_images_check.json', JSON.stringify(results, null, 2));
}

testAll().catch(console.error);
