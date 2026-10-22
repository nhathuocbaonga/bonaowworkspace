const fs = require('fs');
const path = require('path');
const { createWorker } = require('tesseract.js');

const root = path.resolve(__dirname, '..');
const pagesDir = path.join(root, '_nguon', 'hang-nhom-2-pages');
const outputDir = path.join(root, '_nguon', 'hang-nhom-2-ocr');
fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  const worker = await createWorker('vie+eng');
  const pages = fs.readdirSync(pagesDir)
    .filter((name) => /^page-\d+\.jpg$/.test(name))
    .sort();

  for (const page of pages) {
    const target = path.join(outputDir, page.replace(/\.jpg$/, '.txt'));
    if (fs.existsSync(target) && fs.statSync(target).size > 100) {
      console.log(`skip ${page}`);
      continue;
    }
    const result = await worker.recognize(path.join(pagesDir, page));
    fs.writeFileSync(target, result.data.text, 'utf8');
    console.log(`done ${page}`);
  }

  await worker.terminate();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
