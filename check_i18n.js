// 檢查 ISEdA 網站翻譯完整性：每個 data-i18n 鍵在三種語言都必須存在
const fs = require('fs');
const path = require('path');
const dir = path.dirname(process.argv[1]) || '.';

const langs = ['zh-Hant', 'zh-Hans', 'en'];
const js = fs.readFileSync(path.join(dir, 'lang.js'), 'utf8');

// 依區塊頭尾擷取每種語言的字典
function extractKeys(lang) {
  const start = js.indexOf(`'${lang}': {`);
  if (start < 0) return null;
  const end = js.indexOf('\n  }', start);
  const block = js.slice(start, end);
  const keys = new Set();
  const re = /'([\w.]+)':\s*'/g;
  let m;
  while ((m = re.exec(block))) keys.add(m[1]);
  return keys;
}

const dict = {};
for (const l of langs) {
  dict[l] = extractKeys(l);
  console.log(`${l} 字典鍵數: ${dict[l] ? dict[l].size : '找不到區塊!'}`);
}

// 掃描所有 HTML 用到的鍵
const used = new Set();
for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(dir, f), 'utf8');
  const re = /data-i18n(?:-placeholder|-title)?="([\w.]+)"/g;
  let m;
  while ((m = re.exec(html))) used.add(m[1]);
}

// 比對
let missing = 0;
for (const key of [...used].sort()) {
  for (const l of langs) {
    if (!dict[l] || !dict[l].has(key)) {
      console.log(`❌ 缺少 [${l}]: ${key}`);
      missing++;
    }
  }
}
console.log(`\n使用中的翻譯鍵: ${used.size} | 缺失總數: ${missing}`);
if (missing === 0) console.log('✅ 三種語言翻譯完整！');
