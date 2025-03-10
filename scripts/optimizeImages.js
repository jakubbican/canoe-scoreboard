// scripts/optimize-images.js
// Script to optimize image assets for better performance
// Run with: node scripts/optimize-images.js
// Requires: npm install sharp --save-dev

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = 'public/assets';
const MAX_WIDTH = {
  'logo.png': 300,
  'footer.png': 1920,
  'bib.png': 80,
  'partners.png': 800
};

// Make sure the output directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Create flags directory if it doesn't exist
const flagsDir = path.join(ASSETS_DIR, 'flags');
if (!fs.existsSync(flagsDir)) {
  fs.mkdirSync(flagsDir, { recursive: true });
}

// Process PNG files
async function processPngFiles() {
  const files = fs.readdirSync(ASSETS_DIR);
  
  for (const file of files) {
    // Skip directories and non-PNG files
    if (fs.statSync(path.join(ASSETS_DIR, file)).isDirectory() || path.extname(file).toLowerCase() !== '.png') {
      continue;
    }
    
    try {
      const inputPath = path.join(ASSETS_DIR, file);
      const outputPath = path.join(ASSETS_DIR, `optimized_${file}`);
      const maxWidth = MAX_WIDTH[file] || 800;
      
      console.log(`Optimizing ${file}...`);
      
      // Process the image: resize if needed, optimize quality
      await sharp(inputPath)
        .resize({ width: maxWidth, withoutEnlargement: true })
        .png({ quality: 85, compressionLevel: 9 })
        .toFile(outputPath);
      
      // Replace original with optimized version
      fs.unlinkSync(inputPath);
      fs.renameSync(outputPath, inputPath);
      
      console.log(`Optimized ${file} successfully!`);
    } catch (error) {
      console.error(`Error optimizing ${file}:`, error);
    }
  }
}

// Process BMP flags (convert to PNG for better performance)
async function processFlagFiles() {
  if (!fs.existsSync(flagsDir)) {
    console.log('Flags directory not found. Skipping flag optimization.');
    return;
  }
  
  const flagFiles = fs.readdirSync(flagsDir);
  
  for (const file of flagFiles) {
    // Skip directories and non-BMP files
    if (fs.statSync(path.join(flagsDir, file)).isDirectory() || path.extname(file).toLowerCase() !== '.bmp') {
      continue;
    }
    
    try {
      const inputPath = path.join(flagsDir, file);
      const outputPath = path.join(flagsDir, `${path.basename(file, '.bmp')}.png`);
      
      console.log(`Converting ${file} to PNG...`);
      
      // Convert BMP to PNG for better performance
      await sharp(inputPath)
        .png({ quality: 90 })
        .toFile(outputPath);
      
      console.log(`Converted ${file} to PNG successfully!`);
    } catch (error) {
      console.error(`Error converting ${file}:`, error);
    }
  }
}

// Run the optimization
(async () => {
  try {
    console.log('Starting image optimization...');
    await processPngFiles();
    // Uncomment the line below if you want to convert BMP flags to PNG
    // await processFlagFiles();
    console.log('Image optimization complete!');
  } catch (error) {
    console.error('Error during image optimization:', error);
  }
})();