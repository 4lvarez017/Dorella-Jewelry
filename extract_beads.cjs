const https = require('https');
const fs = require('fs');

const url = 'https://www.beadsmarket.co/joyeria/brazaletes-hombre';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const scripts = data.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
    let found = null;
    for (const script of scripts) {
      try {
        const raw = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
        const obj = JSON.parse(raw);
        if (obj['@type'] === 'CollectionPage' || (obj.mainEntity && obj.mainEntity.itemListElement)) {
          found = obj.mainEntity.itemListElement;
          break;
        }
      } catch (e) {}
    }

    console.log('Found items in JSON-LD:', found ? found.length : 0);
    
    // Also let's inspect the page for any product images / props if Next.js hydration data exists
    const nextDataMatch = data.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    let nextProducts = [];
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        console.log('Found NEXT_DATA');
        fs.writeFileSync('next_data.json', JSON.stringify(nextData, null, 2));
      } catch (e) {
        console.error('Error parsing NEXT_DATA', e);
      }
    }

    if (found) {
      fs.writeFileSync('beadsmarket_extracted.json', JSON.stringify(found, null, 2));
      console.log('Saved beadsmarket_extracted.json');
    }
  });
}).on('error', (err) => {
  console.error('Error fetching URL:', err);
});
