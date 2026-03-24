import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 请确保你的图片路径和输出路径正确
const INPUT_IMAGE = path.join(__dirname, '..', 'input', 'portrait.jpg');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'assets', 'portrait.ts');
const DEBUG_DIR = path.join(__dirname, '..', 'debug');

// ==========================================
// 盲文生成器 核心参数调整
// ==========================================

// Threashold

// 建议将宽度调大一些，盲文在 60-80 宽度下细节表现极佳
const WIDTH = 40; 
const CROP_ASPECT = 0.72; 
const CROP_SCALE = 0.74; 
const CROP_Y_OFFSET = -0.10; 

// 盲文模式下，强烈建议使用 dither (抖动) 以产生灰度渐变效果
const MODE: 'dither' | 'binary' = 'dither';

const CONTRAST = 1.25; // 稍微提高对比度，让主体更突出
const BRIGHTNESS = 1;
const THRESHOLD = 160; // 二值化阈值，0-255

// 针对你的照片（深色衣服，浅色背景）：
// 终端通常是黑底白字，设置 INVERT = true 可以让原本暗的地方（如衣服、头发）生成密集的点
const INVERT = false; 

async function generate() {
  console.log(`\n================================`);
  console.log(` BRAILLE PORTRAIT GENERATOR RUNNING `);
  console.log(`================================`);
  console.log(` WIDTH:       ${WIDTH} (Terminal Characters)`);
  console.log(` MODE:        ${MODE}`);
  console.log(` INVERT:      ${INVERT}\n`);

  if (!fs.existsSync(INPUT_IMAGE)) {
    console.error(`❌ Input image not found: ${INPUT_IMAGE}`);
    process.exit(1);
  }

  if (!fs.existsSync(DEBUG_DIR)) {
    fs.mkdirSync(DEBUG_DIR, { recursive: true });
  }

  try {
    // ==========================================
    // STAGE 1a: 手动裁剪 (聚焦面部)
    // ==========================================
    const input = sharp(INPUT_IMAGE);
    const metadata = await input.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to read input image dimensions');
    }

    const sourceWidth = metadata.width;
    const sourceHeight = metadata.height;
    const sourceAspect = sourceWidth / sourceHeight;

    let cropWidth: number, cropHeight: number;

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
      .resize({ width: 800, height: Math.round(800 / CROP_ASPECT), fit: 'fill' })
      .toBuffer();

    // ==========================================
    // STAGE 1b: 准备 2x4 盲文像素矩阵
    // ==========================================
    const targetCharWidth = WIDTH;
    // 终端字体高度通常是宽度的 2 倍 (0.5 aspect)
    const targetCharHeight = Math.round(WIDTH / CROP_ASPECT * 0.5);

    // 盲文需要 2x4 的网格，所以实际分辨率是字符数的 2x4 倍
    const pixelWidth = targetCharWidth * 2;
    const pixelHeight = targetCharHeight * 4;

    buffer = await sharp(buffer)
      .resize({
        width: pixelWidth,
        height: pixelHeight,
        fit: 'fill'
      })
      .greyscale()
      .normalize()
      .sharpen({ sigma: 1.8 })
      .toBuffer();

    // ==========================================
    // STAGE 2: 对比度与亮度调整
    // ==========================================
    if (CONTRAST !== 1.0 || BRIGHTNESS !== 1.0) {
      buffer = await sharp(buffer)
        .linear(CONTRAST, (BRIGHTNESS - 1) * 255)
        .gamma(1.05)
        .toBuffer();
    }

    await sharp(buffer).toFile(path.join(DEBUG_DIR, 'step2-braille-prep.png'));

    // ==========================================
    // STAGE 3: 提取灰度数组 & 抖动/二值化处理
    // ==========================================
    const { data, info } = await sharp(buffer)
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let floatData = new Float32Array(data);

    if (MODE === 'dither') {
      // Floyd-Steinberg Dithering
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
    } else {
      // Binary threshold
      for (let i = 0; i < floatData.length; i++) {
        floatData[i] = floatData[i] > THRESHOLD ? 255 : 0;
      }
    }

    // ==========================================
    // STAGE 4: 盲文字符映射
    // ==========================================
    let asciiArt = '';
    const BRAILLE_BASE = 0x2800; // 盲文 Unicode 起始点
    
    // 盲文点位权重分布 (2x4 矩阵)
    const pixelWeights = [
      [1, 8],
      [2, 16],
      [4, 32],
      [64, 128]
    ];

    // 每次步进 4 行 (y) 和 2 列 (x)
    for (let y = 0; y < info.height; y += 4) {
      let row = '';
      for (let x = 0; x < info.width; x += 2) {
        let brailleVal = 0;

        // 遍历 2x4 内部的像素点
        for (let dy = 0; dy < 4; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const py = y + dy;
            const px = x + dx;
            
            if (px < info.width && py < info.height) {
              const idx = py * info.width + px;
              const p = floatData[idx];
              
              // 决定该点是否点亮。255 是白色，0 是黑色。
              const isDot = INVERT ? (p < THRESHOLD) : (p >= THRESHOLD);; 
              
              if (isDot) {
                brailleVal += pixelWeights[dy][dx];
              }
            }
          }
        }
        
        // 生成对应盲文字符，如果是空格（值为0），直接用标准空格以防终端渲染异常
        if (brailleVal === 0) {
            row += ' ';
        } else {
            row += String.fromCharCode(BRAILLE_BASE + brailleVal);
        }
      }
      asciiArt += row + '\n';
    }

    fs.writeFileSync(path.join(DEBUG_DIR, 'step4-braille-preview.txt'), asciiArt);

    const tsContent = `// Auto-generated Braille Portrait

export const portraitWidth = ${WIDTH};

export const portrait = \`
${asciiArt.trimEnd()}
\`.replace(/^\\n/, '');\n`;
    
    if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
        fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    }
    fs.writeFileSync(OUTPUT_FILE, tsContent);
    
    console.log(`✅ Pipeline executed successfully!`);
    console.log(`--- PORTRAIT PREVIEW ---`);
    console.log(asciiArt);

  } catch (err) {
    console.error("❌ Error generating portrait:", err);
    process.exit(1);
  }
}

generate();