/**
 * Script to convert flag BMP files to base64-encoded strings
 * Generates a JavaScript file with a mapping from country codes to base64 strings
 */

const fs = require('fs');
const path = require('path');

// Paths
const flagsDir = path.resolve(__dirname, '../public/assets/flags');
const outputFile = path.resolve(__dirname, '../src/utils/flagsBase64.js');

// Process flags directory
async function convertFlagsToBase64() {
  try {
    // Read all flag files
    const files = fs.readdirSync(flagsDir);
    
    // Filter for BMP files only
    const flagFiles = files.filter(file => 
      file.endsWith('.bmp') && !file.includes('empty')
    );
    
    // Special handling for empty flag
    const emptyFlagPath = path.join(flagsDir, 'empty.png');
    let emptyFlagBase64 = '';
    
    if (fs.existsSync(emptyFlagPath)) {
      const emptyFlagData = fs.readFileSync(emptyFlagPath);
      emptyFlagBase64 = `data:image/png;base64,${emptyFlagData.toString('base64')}`;
    }
    
    // Process each flag file
    console.log(`Processing ${flagFiles.length} flag files...`);
    
    const flagsMap = {};
    
    for (const file of flagFiles) {
      const filePath = path.join(flagsDir, file);
      const countryCode = path.basename(file, '.bmp').toUpperCase();
      
      // Skip invalid files
      if (countryCode === 'Codes CIO, FIS et ISO' || 
          countryCode === 'empty.bmp') {
        continue;
      }
      
      // Read file and convert to base64
      const fileData = fs.readFileSync(filePath);
      const base64Data = `data:image/bmp;base64,${fileData.toString('base64')}`;
      
      // Add to map
      flagsMap[countryCode] = base64Data;
      
      console.log(`Processed: ${countryCode}`);
    }
    
    // Generate JavaScript output
    const jsContent = `/**
 * Base64-encoded flag images
 * Auto-generated file - do not edit directly
 */

/**
 * Map of country codes to base64-encoded flag images
 * @type {Object<string, string>}
 */
export const flagsBase64 = ${JSON.stringify(flagsMap, null, 2)};

/**
 * Empty flag base64 data
 * @type {string}
 */
export const emptyFlagBase64 = "${emptyFlagBase64 || 'data:image/png;base64,'}";

/**
 * Get base64-encoded flag data for a country code
 * @param {string} countryCode - The country code (e.g., "CZE")
 * @returns {string} - Base64-encoded image data
 */
export function getFlagBase64(countryCode) {
  if (!countryCode) {
    return emptyFlagBase64;
  }
  
  const code = countryCode.toUpperCase();
  return flagsBase64[code] || emptyFlagBase64;
}
`;

    // Write to output file
    fs.writeFileSync(outputFile, jsContent);
    console.log(`Successfully created ${outputFile}`);
    
  } catch (error) {
    console.error('Error processing flags:', error);
  }
}

// Run the conversion
convertFlagsToBase64();