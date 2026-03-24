import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_IMAGE = path.join(__dirname, '..', 'input', 'portrait.jpg');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'assets', 'portrait.ts');
const DEBUG_DIR = path.join(__dirname, '..', 'debug');

const EMPTY_CHAR = ' ';
const CHARSET_BLOCK = " ░▒▓█";
const CHARSET_ASCII = " .'`^,:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const CHARSET_BINARY = " █";

// ==========================================
// PORTRAIT GENERATOR TUNING PARAMETERS
// ==========================================

const WIDTH = 40;
const CROP_ASPECT = 0.72; // Physical width/height ratio of the final portrait frame
const CROP_POSITION = 'center'; // kept for fallback / logging
const CROP_SCALE = 0.74; // < 1.0 zooms in on the portrait
const CROP_Y_OFFSET = -0.10; // negative moves crop upward to prioritize face over torso

const MODE: 'grayscale' | 'high-contrast' | 'binary' | 'dither' | 'dot-negative' = 'dot-negative';

const CONTRAST = 1.22;
const BRIGHTNESS = 0.98;
const THRESHOLD = 120;
const INVERT = false;
const DOT_THRESHOLD = 145; // lower = more dots, stronger Zach-like background matrix
const DOT_CHAR = '•';

async function generate() {
  console.log(`\n================================`);
  console.log(` PORTRAIT GENERATOR RUNNING `);
  console.log(`================================`);
  console.log(` WIDTH:       ${WIDTH}`);
  console.log(` CROP_ASPECT: ${CROP_ASPECT}`);
  console.log(` CROP_POS:    ${CROP_POSITION}`);
  console.log(` CROP_SCALE:  ${CROP_SCALE}`);
  console.log(` CROP_Y_OFF:  ${CROP_Y_OFFSET}`);
  console.log(` MODE:        ${MODE}`);
  console.log(` CONTRAST:    ${CONTRAST}`);
  console.log(` BRIGHTNESS:  ${BRIGHTNESS}`);
  console.log(` THRESHOLD:   ${THRESHOLD}`);
  console.log(` DOT_THRESH:  ${DOT_THRESHOLD}`);
  console.log(` CHARSET:     "${CHARSET_ASCII}"\n`);

  if (!fs.existsSync(INPUT_IMAGE)) {
    console.error(`❌ Input image not found: ${INPUT_IMAGE}`);
    process.exit(1);
  }

  if (!fs.existsSync(DEBUG_DIR)) {
    fs.mkdirSync(DEBUG_DIR, { recursive: true });
  }

  try {
    // ==========================================
    // STAGE 1a: Manual Portrait Crop (face-focused)
    // ==========================================
    const input = sharp(INPUT_IMAGE);
    const metadata = await input.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to read input image dimensions');
    }

    const sourceWidth = metadata.width;
    const sourceHeight = metadata.height;
    const sourceAspect = sourceWidth / sourceHeight;

    let cropWidth: number;
    let cropHeight: number;

    if (sourceAspect > CROP_ASPECT) {
      cropHeight = Math.round(sourceHeight * CROP_SCALE);
      cropWidth = Math.round(cropHeight * CROP_ASPECT);
    } else {
      cropWidth = Math.round(sourceWidth * CROP_SCALE);
      cropHeight = Math.round(cropWidth / CROP_ASPECT);
    }

    cropWidth = Math.min(cropWidth, sourceWidth);
    cropHeight = Math.min(cropHeight, sourceHeight);

    const left = Math.max(0, Math.round((sourceWidth - cropWidth) / 2));
    const topBase = Math.round((sourceHeight - cropHeight) / 2);
    const topShift = Math.round(sourceHeight * CROP_Y_OFFSET);
    const top = Math.max(0, Math.min(sourceHeight - cropHeight, topBase + topShift));

    let buffer = await input
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .resize({
        width: 800,
        height: Math.round(800 / CROP_ASPECT),
        fit: 'fill'
      })
      .toBuffer();

    await sharp(buffer).toFile(path.join(DEBUG_DIR, 'step1a-cropped.png'));

    // ==========================================
    // STAGE 1b: Terminal Squish & Grayscale
    // ==========================================
    // Since terminal fonts are ~twice as tall as they are wide (~0.5 aspect),
    // we squish the image so that the terminal "unsqueeze" makes it look right.
    const charsHeight = Math.round(WIDTH / CROP_ASPECT * 0.5);
    buffer = await sharp(buffer)
      .resize({
        width: WIDTH,
        height: charsHeight,
        fit: 'fill' // SQUISH mode, not cover!
      })
      .greyscale()
      .toBuffer();

    await sharp(buffer).toFile(path.join(DEBUG_DIR, 'step1b-squished-grayscale.png'));

    // ==========================================
    // STAGE 2: Auto-Normalize & Sharpen 
    // ==========================================
    buffer = await sharp(buffer)
      .normalize()
      .sharpen({ sigma: 1.8 })
      .toBuffer();

    await sharp(buffer).toFile(path.join(DEBUG_DIR, 'step2-normalized.png'));

    // ==========================================
    // STAGE 3: Contrast / Brightness
    // ==========================================
    if (CONTRAST !== 1.0 || BRIGHTNESS !== 1.0) {
      buffer = await sharp(buffer)
        .linear(CONTRAST, (BRIGHTNESS - 1) * 255)
        .toBuffer();
    }
    
    buffer = await sharp(buffer)
      .gamma(1.05)
      .toBuffer();

    await sharp(buffer).toFile(path.join(DEBUG_DIR, 'step3-contrast.png'));

    // ==========================================
    // STAGE 4: Array Extraction & Filtering Mapping
    // ==========================================
    const { data, info } = await sharp(buffer)
      .greyscale() // FORCE 1 channel for raw pixel extraction!
      .raw()
      .toBuffer({ resolveWithObject: true });
      
    // Validate we actually have a 1D pixel mapping
    if (info.channels !== 1) {
      throw new Error(`Expected 1 channel, got ${info.channels}`);
    }

    let floatData = new Float32Array(data);

    if (MODE === 'dither') {
      for (let y = 0; y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
          const idx = y * info.width + x;
          const oldPixel = floatData[idx];
          const newPixel = oldPixel > THRESHOLD ? 255 : 0;
          floatData[idx] = newPixel;
          const quantError = oldPixel - newPixel;
          
          if (x + 1 < info.width) floatData[idx + 1] += quantError * (7 / 16);
          if (x - 1 >= 0 && y + 1 < info.height) floatData[idx + info.width - 1] += quantError * (3 / 16);
          if (y + 1 < info.height) floatData[idx + info.width] += quantError * (5 / 16);
          if (x + 1 < info.width && y + 1 < info.height) floatData[idx + info.width + 1] += quantError * (1 / 16);
        }
      }
    } else if (MODE === 'binary') {
      for (let i = 0; i < floatData.length; i++) {
        floatData[i] = floatData[i] > THRESHOLD ? 255 : 0;
      }
    } else if (MODE === 'high-contrast') {
      for (let i = 0; i < floatData.length; i++) {
        const val = floatData[i];
        floatData[i] = val < 80 ? 0 : val > 175 ? 255 : val;
      }
    } else if (MODE === 'dot-negative') {
      for (let i = 0; i < floatData.length; i++) {
        const val = floatData[i];
        // Slight tonal shaping so the portrait becomes a cleaner cutout
        floatData[i] = Math.max(0, Math.min(255, Math.pow(val / 255, 1.08) * 255));
      }
    }

    // ==========================================
    // STAGE 5: ASCII Mapping & Output
    // ==========================================
    let asciiArt = '';
    const charLen = CHARSET_ASCII.length - 1;

    for (let y = 0; y < info.height; y++) {
      let row = '';
      for (let x = 0; x < info.width; x++) {
        const idx = y * info.width + x;
        let p = floatData[idx];

        p = Math.max(0, Math.min(255, p));

        if (MODE === 'dot-negative') {
          // Zach-like negative dot matrix:
          // bright background -> dots, darker portrait -> empty cutout
          row += p >= DOT_THRESHOLD ? DOT_CHAR : EMPTY_CHAR;
          continue;
        }

        let ratio = p / 255;

        // Map darker pixels to denser characters for dark-background terminal rendering
        if (!INVERT) {
          ratio = 1 - ratio;
        }

        // Slightly boost midtones so facial features survive better in ASCII
        ratio = Math.pow(ratio, 0.9);

        const charIdx = Math.round(ratio * charLen);
        row += CHARSET_ASCII[charIdx];
      }
      asciiArt += row + '\n';
    }

    fs.writeFileSync(path.join(DEBUG_DIR, 'step4-preview.txt'), asciiArt);

    const tsContent = `// Auto-generated by scripts/generate-portrait.ts

export const portraitWidth = ${WIDTH};

export const portrait = \`
${asciiArt.trimEnd()}
\`.replace(/^\\n/, '');\n`;
    
    if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
        fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    }
    fs.writeFileSync(OUTPUT_FILE, tsContent);
    console.log(`✅ Pipeline executed successfully!`);
    console.log(`=> Exported artifacts to /debug/ folder.`);
    console.log(`=> Configured for framing aspect: ${CROP_ASPECT}\n`);
    console.log(`--- PORTRAIT PREVIEW ---`);
    console.log(asciiArt);

  } catch (err) {
    console.error("❌ Error generating portrait:", err);
    process.exit(1);
  }
}

generate();