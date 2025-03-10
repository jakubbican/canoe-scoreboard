#!/usr/bin/env node
// improved-svg-to-png.cjs - SVG to PNG converter with better path handling
// Usage: node improved-svg-to-png.cjs input.svg output.png "#8A2BE2"

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');

// Get command line args
const inputFile = process.argv[2];
const outputFile = process.argv[3];
const color = process.argv[4] || '#8A2BE2'; // Default to purple

if (!inputFile || !outputFile) {
  console.error('Error: Input and output files are required');
  console.log('Usage: node improved-svg-to-png.cjs input.svg output.png "#8A2BE2"');
  process.exit(1);
}

// Possible ImageMagick paths on Windows
const possibleImageMagickPaths = [
  'C:\\Program Files\\ImageMagick\\convert.exe',
  'C:\\Program Files (x86)\\ImageMagick\\convert.exe',
  'C:\\Program Files\\ImageMagick-7.1.1-Q16-HDRI\\convert.exe', // Update version as needed
  'C:\\Program Files\\ImageMagick-7.1.1-Q16\\convert.exe'
];

// Possible Inkscape paths on Windows
const possibleInkscapePaths = [
  'C:\\Program Files\\Inkscape\\bin\\inkscape.exe',
  'C:\\Program Files\\Inkscape\\inkscape.exe',
  'C:\\Program Files (x86)\\Inkscape\\bin\\inkscape.exe',
  'C:\\Program Files (x86)\\Inkscape\\inkscape.exe'
];

// Find executable path
function findExecutable(name, possiblePaths) {
  // First try in system PATH
  try {
    if (name === 'convert') {
      execSync('where convert', { stdio: 'ignore' });
      return 'convert';
    } else {
      execSync('where inkscape', { stdio: 'ignore' });
      return 'inkscape';
    }
  } catch (e) {
    // Not in PATH, check specific locations
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        return possiblePath;
      }
    }
  }
  return null;
}

try {
  // Read SVG file
  console.log(`Reading SVG file: ${inputFile}`);
  let svgContent = fs.readFileSync(inputFile, 'utf8');
  
  // Apply color to the SVG
  console.log(`Applying color: ${color}`);
  // Replace fill colors
  svgContent = svgContent.replace(/fill="([^"]*)"/g, `fill="${color}"`);
  
  // Also handle fill in style attribute
  svgContent = svgContent.replace(/style="([^"]*)fill:([^;]*)(;|")/, `style="$1fill:${color}$3`);
  
  // For SVGs that don't specify fill, add it to the root element
  if (!svgContent.includes(`fill="${color}"`) && !svgContent.includes(`fill:${color}`)) {
    svgContent = svgContent.replace(/<svg/, `<svg fill="${color}"`);
  }
  
  // Create temp file with modified SVG
  const tempFile = path.join(process.cwd(), 'temp_modified.svg');
  fs.writeFileSync(tempFile, svgContent);
  console.log(`Created temporary SVG file: ${tempFile}`);
  
  // Try Inkscape first
  const inkscapePath = findExecutable('inkscape', possibleInkscapePaths);
  
  if (inkscapePath) {
    console.log(`Using Inkscape at: ${inkscapePath}`);
    try {
      const cmd = `"${inkscapePath}" --export-filename="${outputFile}" "${tempFile}"`;
      console.log(`Running command: ${cmd}`);
      execSync(cmd, { stdio: 'inherit' });
      console.log(`Conversion successful using Inkscape! Saved to ${outputFile}`);
    } catch (error) {
      console.error(`Inkscape error: ${error.message}`);
      throw error; // Let the ImageMagick path handle it
    }
  } else {
    // Try ImageMagick
    const convertPath = findExecutable('convert', possibleImageMagickPaths);
    
    if (convertPath) {
      console.log(`Using ImageMagick at: ${convertPath}`);
      try {
        const cmd = `"${convertPath}" "${tempFile}" "${outputFile}"`;
        console.log(`Running command: ${cmd}`);
        execSync(cmd, { stdio: 'inherit' });
        console.log(`Conversion successful using ImageMagick! Saved to ${outputFile}`);
      } catch (error) {
        console.error(`ImageMagick error: ${error.message}`);
        throw error;
      }
    } else {
      throw new Error('Neither Inkscape nor ImageMagick could be found');
    }
  }
  
  // Clean up temp file
  fs.unlinkSync(tempFile);
  console.log('Temporary file removed');
  
} catch (error) {
  console.error('\nError:', error.message);
  console.log('\nPlease ensure you have either Inkscape or ImageMagick installed:');
  console.log('- Inkscape: https://inkscape.org/release');
  console.log('- ImageMagick: https://imagemagick.org/script/download.php');
  
  console.log('\nOn Windows, make sure to:');
  console.log('1. Add the installation directory to your PATH environment variable');
  console.log('2. Or specify the full path to the executable in this script');
  
  process.exit(1);
}