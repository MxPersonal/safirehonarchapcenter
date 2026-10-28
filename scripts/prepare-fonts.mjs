/**
 * Self-host the two free Persian fonts at build time, without a runtime CDN.
 * Sources are pinned to verified upstream commits. Their exact Git blob SHAs
 * are checked to catch accidental or upstream file changes.
 * Licenses are distributed alongside the font binaries (SIL OFL-1.1).
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const FONT_DIR = join(process.cwd(), 'public', 'fonts');
const sources = [
  {
    name: 'Iran Nastaliq',
    repository: 'font-store/font-IranNastaliq',
    revision: '78bdb48a0d951fe309c5818da05c45d443f6685f',
    assets: [
      ['WebFonts/IranNastaliq-Web.woff2', 'iran-nastaliq.woff2', 'e8f680cba9034dd92a1f18e4cfde42fe82bca892'],
      ['LICENSE', 'LICENSE-IranNastaliq.txt', '78e3f84afff07c4562d99b7bbbb2bf1e577dcf00']
    ]
  },
  {
    name: 'Yekan',
    repository: 'DediData/Yekan-Font',
    revision: 'd25d796fd4862d5e9a6426669a603807dfa3805f',
    assets: [
      ['Yekan.woff2', 'yekan.woff2', '846ecc1cc8b8cbb7d277dbf11db3b5f6c17d97d0'],
      ['license.txt', 'LICENSE-Yekan.txt', '9ad4205d3fccd911175f6c2353fb8f1eec01c6f4']
    ]
  }
];

function gitBlobSha(data) {
  return createHash('sha1')
    .update(`blob ${data.length}\0`)
    .update(data)
    .digest('hex');
}
async function ensureAsset(source, asset) {
  const [remotePath, localName, expectedSha] = asset;
  const destination = join(FONT_DIR, localName);
  try {
    const existing = await readFile(destination);
    if (gitBlobSha(existing) === expectedSha) return;
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${remotePath}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Unable to download ${source.name} ${remotePath}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (gitBlobSha(bytes) !== expectedSha) {
    throw new Error(`Hash mismatch for ${source.name} ${remotePath}`);
  }
  await writeFile(destination, bytes);
  console.log(`Font prepared: ${localName}`);
}
await mkdir(FONT_DIR, {recursive: true});
await Promise.all(sources.flatMap(source => source.assets.map(asset => ensureAsset(source, asset))));
