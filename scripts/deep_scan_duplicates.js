import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const productsDir = path.resolve("src/data/products");
const files = fs.readdirSync(productsDir).filter(f => f.endsWith(".js"));

async function scan() {
  let all = [];
  for (const file of files) {
    const mod = await import(pathToFileURL(path.join(productsDir, file)).href);
    for (const k of Object.keys(mod)) {
      if (Array.isArray(mod[k])) {
        all.push(...mod[k].map(item => ({ ...item, _file: file })));
      }
    }
  }

  function clean(s) {
    return (s || "")
      .toLowerCase()
      .replace(/^(t|a|p|c|d|h|r|bp|bm|bh)\s+/i, "")
      .replace(/\b(cms|cm|mm)\b/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  const byCat = {};
  for (const item of all) {
    const c = item.category || "Unknown";
    if (!byCat[c]) byCat[c] = {};
    const key = clean(item.name);
    if (!byCat[c][key]) byCat[c][key] = [];
    byCat[c][key].push(item);
  }

  const summary = {};
  let totalDups = 0;
  for (const [cat, keys] of Object.entries(byCat)) {
    for (const [k, list] of Object.entries(keys)) {
      const hasLocal = list.some(i => (i.image || "").startsWith("/"));
      const hasRemote = list.some(i => (i.image || "").startsWith("http"));
      if (hasLocal && hasRemote) {
        if (!summary[cat]) summary[cat] = [];
        summary[cat].push({
          key: k,
          local: list.filter(i => (i.image || "").startsWith("/")).map(i => ({ id: i.id, name: i.name, file: i._file })),
          remote: list.filter(i => (i.image || "").startsWith("http")).map(i => ({ id: i.id, name: i.name, file: i._file }))
        });
        totalDups += list.filter(i => (i.image || "").startsWith("http")).length;
      }
    }
  }

  console.log(`\n🚨 TOTAL DE DUPLICADOS REMOTOS REDUNDANTES DETECTADOS: ${totalDups}`);
  for (const [cat, list] of Object.entries(summary)) {
    console.log(`\n=== CATEGORIA: "${cat}" (${list.length} modelos duplicados) ===`);
    for (const item of list) {
      console.log(`  - Local:  [${item.local.map(l => `${l.id}: "${l.name}" (${l.file})`).join(", ")}]`);
      console.log(`    Remoto: [${item.remote.map(r => `${r.id}: "${r.name}" (${r.file})`).join(", ")}]`);
    }
  }
}

scan().catch(console.error);
