import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generate() {
  const iconSvg = fs.readFileSync('public/icon.svg');
  const maskableSvg = fs.readFileSync('public/icon-maskable.svg');

  // 192x192 PNG
  await sharp(iconSvg)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');
  console.log('Generated public/pwa-192x192.png');

  // 512x512 PNG
  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');
  console.log('Generated public/pwa-512x512.png');

  // 512x512 Maskable PNG
  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-maskable-512x512.png');
  console.log('Generated public/pwa-maskable-512x512.png');

  // 180x180 Apple Touch Icon
  await sharp(iconSvg)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('Generated public/apple-touch-icon.png');

  // 32x32 Favicon PNG
  await sharp(iconSvg)
    .resize(32, 32)
    .png()
    .toFile('public/favicon.png');
  console.log('Generated public/favicon.png');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
