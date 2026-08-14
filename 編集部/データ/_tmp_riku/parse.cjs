const fs = require('fs');
const path = require('path');

function parseSharedStrings(dir) {
  const p = path.join(dir, 'xl', 'sharedStrings.xml');
  if (!fs.existsSync(p)) return [];
  const xml = fs.readFileSync(p, 'utf8');
  const items = [];
  const re = /<si>([\s\S]*?)<\/si>/g;
  let m;
  while ((m = re.exec(xml))) {
    const chunk = m[1];
    const texts = [...chunk.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(x => x[1]);
    let s = texts.join('');
    s = s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'");
    items.push(s);
  }
  return items;
}

function colToIndex(col) {
  let idx = 0;
  for (let i = 0; i < col.length; i++) {
    idx = idx * 26 + (col.charCodeAt(i) - 64);
  }
  return idx - 1;
}

function parseSheet(dir, sheetFile, sharedStrings) {
  const p = path.join(dir, 'xl', 'worksheets', sheetFile);
  const xml = fs.readFileSync(p, 'utf8');
  const rows = [];
  const rowRe = /<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  let rm;
  while ((rm = rowRe.exec(xml))) {
    const rowXml = rm[2];
    const cellRe = /<c[^>]*r="([A-Z]+)(\d+)"[^>]*?(?:\st="([^"]*)")?[^>]*>(?:<f[^>]*>[\s\S]*?<\/f>)?(?:<v>([\s\S]*?)<\/v>)?<\/c>|<c[^>]*r="([A-Z]+)(\d+)"[^>]*\/>/g;
    // simpler: capture all <c ...>...</c> or self-closing
    const cells = [];
    const cRe = /<c\s+([^>]*)\/>|<c\s+([^>]*)>([\s\S]*?)<\/c>/g;
    let cm;
    while ((cm = cRe.exec(rowXml))) {
      const attrs = cm[1] || cm[2];
      const inner = cm[3] || '';
      const rAttr = /r="([A-Z]+)(\d+)"/.exec(attrs);
      const tAttr = /t="([^"]*)"/.exec(attrs);
      const col = rAttr ? rAttr[1] : null;
      const vMatch = /<v>([\s\S]*?)<\/v>/.exec(inner);
      let val = vMatch ? vMatch[1] : '';
      if (tAttr && tAttr[1] === 's' && val !== '') {
        val = sharedStrings[parseInt(val, 10)];
      } else if (tAttr && tAttr[1] === 'inlineStr') {
        const isMatch = /<t[^>]*>([\s\S]*?)<\/t>/.exec(inner);
        val = isMatch ? isMatch[1] : '';
      }
      cells[colToIndex(col)] = val;
    }
    rows.push(cells);
  }
  return rows;
}

const dir = process.argv[2];
const sheetFile = process.argv[3] || 'sheet1.xml';
const ss = parseSharedStrings(dir);
const rows = parseSheet(dir, sheetFile, ss);
for (const row of rows) {
  console.log(JSON.stringify(row));
}
