const fs = require('fs');

const html = fs.readFileSync('catalog_full.html', 'utf8');

// Let's inspect around occurrence 3
const idx = html.indexOf('\"referencia\":\"PH056\"');
console.log('Found at:', idx);
// Let's search backwards for the start of the JSON array or object
let start = html.lastIndexOf('[{', idx);
let end = html.indexOf('}]', idx) + 2;

console.log('start:', start, 'end:', end);

// Let's extract script tags or JSON blobs in the page
// Specifically Next.js RSC / page data
const scriptContents = html.match(/self\.__next_f\.push\(\[[\s\S]*?\]\)/g) || [];
console.log('Found self.__next_f pushes:', scriptContents.length);

let allProducts = [];
for (const sc of scriptContents) {
  if (sc.includes('referencia') && sc.includes('Brazaletes Hombre')) {
    console.log('Found push with Brazaletes Hombre, length:', sc.length);
    fs.writeFileSync('next_f_blob.txt', sc);
  }
}
