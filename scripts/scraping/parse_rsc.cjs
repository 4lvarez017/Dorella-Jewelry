const fs = require('fs');

const raw = fs.readFileSync('next_f_blob.txt', 'utf8');

// Inside raw, it's something like: self.__next_f.push([1, "..."])
// Let's extract the string literal inside self.__next_f.push([1, ...])
const match = raw.match(/self\.__next_f\.push\(\[\d+,\s*([\s\S]*?)\]\)\s*$/);
if (!match) {
  console.log('No match for self.__next_f pattern');
  process.exit(1);
}

let jsonStr = match[1];
// The content is a JSON string literal
let unescaped;
try {
  unescaped = JSON.parse(jsonStr);
} catch (e) {
  console.log('Failed direct JSON.parse of chunk:', e.message);
  // manual unescape or regex search
  unescaped = jsonStr;
}

fs.writeFileSync('next_f_unescaped.txt', unescaped);
console.log('Unescaped length:', unescaped.length);

// Let's search for product objects
// In Next RSC format, objects might be embedded directly or in JSON arrays
// Let's find all objects with "referencia" and "categoria"
const productRegex = /\{"id":"[^"]+","referencia":"([^"]+)","nombre":"([^"]+)"[\s\S]*?"categoria":"Brazaletes Hombre"[\s\S]*?\}(?=,\{"id"|\])/g;

// Or let's find the start of the products array in the RSC payload
const startMarker = '{"id":';
// Let's find all occurrences of "referencia"
const refMatches = [];
const refRegex = /"referencia":"([^"]+)"/g;
let m;
while ((m = refRegex.exec(unescaped)) !== null) {
  refMatches.push(m[1]);
}
console.log('Total referencia matches:', refMatches.length);
console.log('Unique referencia matches:', Array.from(new Set(refMatches)).length);
console.log('Sample referencias:', Array.from(new Set(refMatches)).slice(0, 20));
