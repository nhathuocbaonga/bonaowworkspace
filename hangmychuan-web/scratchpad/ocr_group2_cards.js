const fs = require('fs');
const path = require('path');
const { createWorker, PSM } = require('tesseract.js');

const root = path.resolve(__dirname, '..');
const cardsDir = path.join(root, '_nguon', 'hang-nhom-2-cards-v2');
const outputDir = path.join(root, '_nguon', 'hang-nhom-2-card-ocr-v2');
fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  const worker = await createWorker('vie+eng');
  await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
  const cards = fs.readdirSync(cardsDir)
    .filter((name) => /^p\d+-[LR]-\d+\.jpg$/.test(name))
    .sort();

  for (let index = 0; index < cards.length; index += 1) {
    const card = cards[index];
    const target = path.join(outputDir, card.replace(/\.jpg$/, '.txt'));
    if (!fs.existsSync(target) || fs.statSync(target).size < 30) {
      const result = await worker.recognize(path.join(cardsDir, card));
      fs.writeFileSync(target, result.data.text.trim() + '\n', 'utf8');
    }
    if ((index + 1) % 10 === 0 || index + 1 === cards.length) {
      console.log(`${index + 1}/${cards.length}`);
    }
  }

  await worker.terminate();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
