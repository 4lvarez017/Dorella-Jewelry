const fs = require('fs');

const html = fs.readFileSync('catalog_full.html', 'utf8');

function findOccurrences(target) {
  let pos = 0;
  const indices = [];
  while ((pos = html.indexOf(target, pos)) !== -1) {
    indices.push(pos);
    pos += target.length;
  }
  return indices;
}

console.log('Occurrences of PH056:', findOccurrences('PH056'));
console.log('Occurrences of PH001:', findOccurrences('PH001'));
console.log('Occurrences of PH040:', findOccurrences('PH040'));
console.log('Occurrences of PH054:', findOccurrences('PH054'));

const idxs = findOccurrences('PH056');
idxs.forEach((idx, i) => {
  console.log(`--- Occurrence ${i} at ${idx} ---`);
  console.log(html.substring(Math.max(0, idx - 100), Math.min(html.length, idx + 200)));
});
