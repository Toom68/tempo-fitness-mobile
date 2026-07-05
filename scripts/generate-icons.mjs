import sharp from "sharp";
import { mkdir } from "fs/promises";
import { join } from "path";

const PUBLIC_DIR = join(process.cwd(), "public");
const ICONS_DIR = join(PUBLIC_DIR, "icons");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="20" fill="#0a0a0a"/>
  <g fill="#fff" transform="translate(50 50)">
    <rect x="-3" y="-25" width="6" height="50" rx="2"/>
    <rect x="-22" y="-18" width="4" height="36" rx="2"/>
    <rect x="18" y="-18" width="4" height="36" rx="2"/>
    <circle cx="-20" cy="-20" r="5"/>
    <circle cx="20" cy="-20" r="5"/>
    <circle cx="-20" cy="20" r="5"/>
    <circle cx="20" cy="20" r="5"/>
  </g>
</svg>`;

// Maskable icon needs safe zone — padding around the logo
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" fill="#0a0a0a"/>
  <g fill="#fff" transform="translate(50 50) scale(0.7)">
    <rect x="-3" y="-25" width="6" height="50" rx="2"/>
    <rect x="-22" y="-18" width="4" height="36" rx="2"/>
    <rect x="18" y="-18" width="4" height="36" rx="2"/>
    <circle cx="-20" cy="-20" r="5"/>
    <circle cx="20" cy="-20" r="5"/>
    <circle cx="-20" cy="20" r="5"/>
    <circle cx="20" cy="20" r="5"/>
  </g>
</svg>`;

const sizes = [192, 512];

async function main() {
  await mkdir(ICONS_DIR, { recursive: true });

  for (const size of sizes) {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(join(ICONS_DIR, `icon-${size}.png`));

    await sharp(Buffer.from(maskableSvg))
      .resize(size, size)
      .png()
      .toFile(join(ICONS_DIR, `maskable-${size}.png`));

    console.log(`Generated ${size}x${size} icons`);
  }

  // Apple touch icon (180x180, no transparency for iOS)
  await sharp(Buffer.from(svg))
    .resize(180, 180)
    .png()
    .toFile(join(PUBLIC_DIR, "apple-touch-icon.png"));

  // Favicon
  await sharp(Buffer.from(svg))
    .resize(32, 32)
    .png()
    .toFile(join(PUBLIC_DIR, "favicon-32.png"));

  console.log("All icons generated successfully");
}

main().catch(console.error);
