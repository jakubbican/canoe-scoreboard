#!/usr/bin/env node
// svg-color-adjuster.cjs - SVG color adjustment script
// Usage: node svg-color-adjuster.cjs input.svg output.svg "#8A2BE2"

const fs = require('fs');
const path = require('path');

// Get command line args
const inputFile = process.argv[2];
const outputFile = process.argv[3];
const color = process.argv[4] || '#8A2BE2'; // Default to purple

if (!inputFile) {
  console.error('Error: Input file is required');
  console.log('Usage: node svg-color-adjuster.cjs input.svg [output.svg] "#8A2BE2"');
  console.log('If output.svg is omitted, the input file will be modified in place');
  process.exit(1);
}

// If output file is not specified, use the input file
const finalOutputFile = outputFile || inputFile;

try {
  // Read SVG file
  console.log(`Reading SVG file: ${inputFile}`);
  let svgContent = fs.readFileSync(inputFile, 'utf8');
  
  // Apply color to the SVG
  console.log(`Adjusting SVG colors to: ${color}`);
  
  // Replace fill colors
  svgContent = svgContent.replace(/fill="([^"]*)"/g, `fill="${color}"`);
  
  // Also handle fill in style attribute
  svgContent = svgContent.replace(/style="([^"]*)fill:([^;]*)(;|")/, `style="$1fill:${color}$3`);
  
  // For SVGs that don't specify fill, add it to the root element
  if (!svgContent.includes(`fill="${color}"`) && !svgContent.includes(`fill:${color}`)) {
    svgContent = svgContent.replace(/<svg/, `<svg fill="${color}"`);
  }
  
  // Write the modified SVG
  fs.writeFileSync(finalOutputFile, svgContent);
  console.log(`SVG color adjusted successfully! Saved to ${finalOutputFile}`);
  
} catch (error) {
  console.error('\nError:', error.message);
  process.exit(1);
}