const https = require('https');
const fs = require('fs');

const items76 = JSON.parse(fs.readFileSync('beadsmarket_extracted.json', 'utf8'));

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      resolve({ url, status: res.statusCode });
    });
    req.on('error', () => resolve({ url, status: 500 }));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve({ url, status: 408 });
    });
    req.end();
  });
}

async function deepSearch() {
  const missing = [];
  const foundMap = {};

  for (const it of items76) {
    const rawSku = it.item.sku;
    // generate variants
    const numMatch = rawSku.match(/\d+/);
    const num = numMatch ? parseInt(numMatch[0], 10) : null;
    const prefixMatch = rawSku.match(/^[a-zA-Z]+/);
    const prefix = prefixMatch ? prefixMatch[0].toUpperCase() : 'PH';

    const skuVariants = [
      rawSku,
      rawSku.toUpperCase(),
      rawSku.toLowerCase(),
    ];
    if (num !== null) {
      skuVariants.push(`${prefix}${num}`);
      skuVariants.push(`${prefix}${String(num).padStart(3, '0')}`);
      skuVariants.push(`${prefix}${String(num).padStart(2, '0')}`);
      skuVariants.push(`${prefix.toLowerCase()}${num}`);
      skuVariants.push(`${prefix.toLowerCase()}${String(num).padStart(3, '0')}`);
      skuVariants.push(`${prefix.toLowerCase()}${String(num).padStart(2, '0')}`);
    }

    const fileNames = [
      'perfil.webp', 'PERFIL.webp', 'perfil.jpg', 'perfil.png', 'perfil.jpeg',
      '1.webp', '1.jpg', '1.png',
      'foto.webp', 'foto.jpg',
      '01.webp', '01.jpg',
    ];

    const candidates = [];
    for (const sv of Array.from(new Set(skuVariants))) {
      fileNames.forEach(fn => {
        candidates.push(`https://oepxxlqvfxkwgwjchkzz.supabase.co/storage/v1/object/public/productos/${sv}/${fn}`);
      });
      candidates.push(`https://oepxxlqvfxkwgwjchkzz.supabase.co/storage/v1/object/public/productos/${sv}/${sv}.webp`);
      candidates.push(`https://oepxxlqvfxkwgwjchkzz.supabase.co/storage/v1/object/public/productos/${sv}/${sv}.jpg`);
      candidates.push(`https://oepxxlqvfxkwgwjchkzz.supabase.co/storage/v1/object/public/productos/${sv}/${sv}.png`);
      // Also check orolaminado18k.com.co CDN which was used in existing Dorella code!
      candidates.push(`https://orolaminado18k.com.co/img/${sv}/PERFIL.webp`);
      candidates.push(`https://orolaminado18k.com.co/img/${sv}/perfil.webp`);
      candidates.push(`https://orolaminado18k.com.co/img/${sv}/${sv}.webp`);
    }

    let found = null;
    for (const url of Array.from(new Set(candidates))) {
      const res = await checkUrl(url);
      if (res.status === 200) {
        found = url;
        break;
      }
    }

    if (found) {
      console.log(`[FOUND] SKU ${rawSku}: ${found}`);
      foundMap[rawSku] = found;
    } else {
      console.log(`[MISSING] SKU ${rawSku}`);
      missing.push(rawSku);
    }
  }

  console.log(`\nTOTAL FOUND: ${Object.keys(foundMap).length} / ${items76.length}`);
  console.log(`TOTAL MISSING: ${missing.length}`);
  fs.writeFileSync('all_found_images.json', JSON.stringify(foundMap, null, 2));
}

deepSearch().catch(console.error);
