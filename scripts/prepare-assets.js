// scripts/prepare-assets.js
// A Node.js script to prepare assets for the scoreboard, supporting PNG and BMP formats
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_SOURCE = 'assets-source';
const ASSETS_DEST = 'public/assets';

// Ensure destination directory exists
if (!fs.existsSync(ASSETS_DEST)) {
  fs.mkdirSync(ASSETS_DEST, { recursive: true });
  console.log(`Created directory: ${ASSETS_DEST}`);
}

// Ensure flags directory exists
if (!fs.existsSync(`${ASSETS_DEST}/flags`)) {
  fs.mkdirSync(`${ASSETS_DEST}/flags`, { recursive: true });
  console.log(`Created directory: ${ASSETS_DEST}/flags`);
}

// Copy sample assets if source folder exists
if (fs.existsSync(ASSETS_SOURCE)) {
  console.log('Copying assets from source folder...');
  
  // Read all files from the source directory
  const files = fs.readdirSync(ASSETS_SOURCE);
  
  // Copy each file to the destination directory
  files.forEach(file => {
    const sourcePath = path.join(ASSETS_SOURCE, file);
    const destPath = path.join(ASSETS_DEST, file);
    
    // Skip directories (we handle them separately)
    if (fs.statSync(sourcePath).isDirectory()) {
      return;
    }
    
    // Copy the file
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied: ${file}`);
  });
  
  // Copy flag images if they exist
  const flagsSource = path.join(ASSETS_SOURCE, 'flags');
  if (fs.existsSync(flagsSource)) {
    const flags = fs.readdirSync(flagsSource);
    
    flags.forEach(flag => {
      const sourcePath = path.join(flagsSource, flag);
      const destPath = path.join(ASSETS_DEST, 'flags', flag);
      
      // Skip directories
      if (fs.statSync(sourcePath).isDirectory()) {
        return;
      }
      
      // Copy the flag image
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied flag: ${flag}`);
    });
  }
} else {
  console.log('Assets source directory not found. Creating placeholder assets...');
  
  // Create placeholder logo (PNG)
  if (!fs.existsSync(`${ASSETS_DEST}/logo.png`)) {
    // Copy a default logo if available
    const defaultLogo = path.join(__dirname, '..', 'default-assets', 'logo.png');
    if (fs.existsSync(defaultLogo)) {
      fs.copyFileSync(defaultLogo, `${ASSETS_DEST}/logo.png`);
      console.log('Copied default logo.png');
    } else {
      // Generate a simple 1x1 pixel PNG (minimal valid PNG)
      const minimalPng = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA636460200000010001F5E0455C0000000049454E44AE426082', 'hex');
      fs.writeFileSync(`${ASSETS_DEST}/logo.png`, minimalPng);
      console.log('Created minimal placeholder logo.png');
    }
  }
  
  // Create placeholder footer (PNG)
  if (!fs.existsSync(`${ASSETS_DEST}/footer.png`)) {
    // Copy a default footer if available
    const defaultFooter = path.join(__dirname, '..', 'default-assets', 'footer.png');
    if (fs.existsSync(defaultFooter)) {
      fs.copyFileSync(defaultFooter, `${ASSETS_DEST}/footer.png`);
      console.log('Copied default footer.png');
    } else {
      // Generate a simple 1x1 pixel PNG
      const minimalPng = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA636460200000010001F5E0455C0000000049454E44AE426082', 'hex');
      fs.writeFileSync(`${ASSETS_DEST}/footer.png`, minimalPng);
      console.log('Created minimal placeholder footer.png');
    }
  }
  
  // Create placeholder bib background (PNG)
  if (!fs.existsSync(`${ASSETS_DEST}/bib.png`)) {
    // Copy a default bib if available
    const defaultBib = path.join(__dirname, '..', 'default-assets', 'bib.png');
    if (fs.existsSync(defaultBib)) {
      fs.copyFileSync(defaultBib, `${ASSETS_DEST}/bib.png`);
      console.log('Copied default bib.png');
    } else {
      // Generate a simple 1x1 pixel PNG
      const minimalPng = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA636460200000010001F5E0455C0000000049454E44AE426082', 'hex');
      fs.writeFileSync(`${ASSETS_DEST}/bib.png`, minimalPng);
      console.log('Created minimal placeholder bib.png');
    }
  }
  
  // Create placeholder partners (PNG)
  if (!fs.existsSync(`${ASSETS_DEST}/partners.png`)) {
    // Copy a default partners if available
    const defaultPartners = path.join(__dirname, '..', 'default-assets', 'partners.png');
    if (fs.existsSync(defaultPartners)) {
      fs.copyFileSync(defaultPartners, `${ASSETS_DEST}/partners.png`);
      console.log('Copied default partners.png');
    } else {
      // Generate a simple 1x1 pixel PNG
      const minimalPng = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA636460200000010001F5E0455C0000000049454E44AE426082', 'hex');
      fs.writeFileSync(`${ASSETS_DEST}/partners.png`, minimalPng);
      console.log('Created minimal placeholder partners.png');
    }
  }
  
  // Create placeholder empty flag (BMP)
  if (!fs.existsSync(`${ASSETS_DEST}/flags/empty.bmp`)) {
    // Copy a default empty flag if available
    const defaultFlag = path.join(__dirname, '..', 'default-assets', 'empty.bmp');
    if (fs.existsSync(defaultFlag)) {
      fs.copyFileSync(defaultFlag, `${ASSETS_DEST}/flags/empty.bmp`);
      console.log('Copied default empty.bmp');
    } else {
      // Instead of trying to generate a BMP file (which is complex),
      // Create a text file explaining the missing flag
      fs.writeFileSync(`${ASSETS_DEST}/flags/empty.bmp.txt`, 
        'Please add an empty.bmp file here - this is needed as a fallback when country flags are not found.');
      console.log('Warning: No empty.bmp flag file available. Please add one manually.');
    }
  }
  
  // Create a simple HTML file with instructions for placeholder assets
  const instructionsHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Scoreboard Asset Instructions</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
    h1 { color: #003366; }
    .container { max-width: 800px; margin: 0 auto; }
    .note { background-color: #ffffcc; padding: 10px; border-radius: 5px; }
    code { background-color: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
    ul { margin-left: 20px; }
    li { margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Scoreboard Asset Setup Instructions</h1>
    
    <div class="note">
      <p>You need to provide the following files for the scoreboard to display correctly:</p>
    </div>
    
    <h2>Required Files</h2>
    <ul>
      <li><strong>logo.png</strong> - The main logo displayed in the top bar</li>
      <li><strong>footer.png</strong> - The footer image with sponsor logos</li>
      <li><strong>bib.png</strong> - The background image for competitor bibs</li>
      <li><strong>partners.png</strong> - Partners/sponsors logo image (optional)</li>
      <li><strong>flags/*.bmp</strong> - Country flag BMP files (named as country codes, e.g., CZE.bmp)</li>
      <li><strong>flags/empty.bmp</strong> - A transparent/empty flag for when no country is specified</li>
    </ul>
    
    <h2>How to Add These Files</h2>
    <ol>
      <li>Create a folder named <code>assets-source</code> in the project root</li>
      <li>Create a subfolder named <code>flags</code> inside <code>assets-source</code></li>
      <li>Copy your asset files to these folders</li>
      <li>Run <code>node scripts/prepare-assets.js</code> to process the assets</li>
    </ol>
    
    <p>After adding your assets, rebuild the application with <code>npm run build</code>.</p>
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(`${ASSETS_DEST}/asset-instructions.html`, instructionsHtml);
  console.log('Created asset instructions HTML file');
}

console.log('Asset preparation complete!');