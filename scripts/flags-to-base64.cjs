/**
 * Script to convert BMP flag files to base64 strings
 * This reduces HTTP requests by embedding flags directly in the JS bundle
 *
 * Usage: node scripts/flags-to-base64.cjs
 */

const fs = require('fs');
const path = require('path');

// Paths
const flagsDir = path.join(__dirname, '../public/assets/flags');
const outputFile = path.join(__dirname, '../src/utils/flagsBase64.js');
const backupFile = path.join(__dirname, '../src/utils/flags-base64-backup.js');

// Check if flags directory exists
if (!fs.existsSync(flagsDir)) {
  console.error(`Error: Flags directory not found at ${flagsDir}`);
  console.log('Run "node scripts/prepare-assets.js" first to set up asset directories');
  process.exit(1);
}

// Read all BMP files from flags directory
console.log('Reading flag files from', flagsDir);
const flags = {};
let flagCount = 0;

try {
  // Read directory contents
  const files = fs.readdirSync(flagsDir);

  // Process each BMP file
  files.forEach(file => {
    if (path.extname(file).toLowerCase() === '.bmp') {
      const countryCode = path.basename(file, '.bmp').toUpperCase();
      const filePath = path.join(flagsDir, file);

      // Read file and convert to base64
      const fileData = fs.readFileSync(filePath);
      const base64Data = `data:image/bmp;base64,${fileData.toString('base64')}`;

      // Add to flags object
      flags[countryCode] = base64Data;
      flagCount++;
    }
  });

  if (flagCount === 0) {
    console.log('No BMP flag files found. Creating empty flags object.');
  } else {
    console.log(`Processed ${flagCount} flag files.`);
  }

  // Backup existing flags file if it exists and has content
  if (fs.existsSync(outputFile)) {
    const currentContent = fs.readFileSync(outputFile, 'utf8');
    if (currentContent.includes('export const flagsBase64 = {') &&
        currentContent.includes('}') &&
        currentContent.length > 500) {
      console.log(`Backing up existing flags data to ${backupFile}`);
      fs.writeFileSync(backupFile, currentContent, 'utf8');
    }
  }

  // Generate output file
  const outputContent = `/**
 * Base64-encoded flag images
 * Auto-generated file - do not edit directly
 */

/**
 * Map of country codes to base64-encoded flag images
 * @type {Object<string, string>}
 */
export const flagsBase64 = ${JSON.stringify(flags, null, 2)};

/**
 * Empty flag base64 data
 * @type {string}
 */
export const emptyFlagBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAADICAYAAABS39xVAAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TtUUqgnYQ6ZChOlkQFXGUKhbBQmkrtOpgcumH0KQhSXFxFFwLDn4sVh1cnHV1cBUEwQ8QNzcnRRcp8X9JoUWMB8f9eHfvcfcOEBoVpppd44CqWUY6ERdz+RUx8IogIhhADwISM/VkZiELz/F1Dx9f72I8y/vcn6NPKZgM8InEs0w3LOJ14ulNS+e8TxxmZUkhPiceM+iCxI9cl11+41xyWOCZYSObniMOE4ulDpY7mJUNlXiKOKqoGuULOZcVzluc1UqNte7JXxgqaMsZrtOMIIFFJJGCCBk1bKACCzFaNVJMpGk/7uEfdvwpcsnk2gAjxzyqUCE5fvA/+N2tWZyccJNCcaD7xbY/RoDALtCs2/b3sW03TwD/M3Cltf3VBjDzSXq9rUWPgP5t4OK6rcl7wOUOMPSkS4bkSH6aQrEIvJ/RN+WBwVugd9XtrbWP0wcgS10t3QAHh8BoibLXPN4d7Ozt3zOt/n4ANKpyjnwLQf4AAAAGYktHRADxAFMAOiThi8kAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAHdElNRQflCBwSCiR5rPgyAAAA/UlEQVR42u3BAQEAAACAkP6v7ggKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABiqdQABFOnKDwAAAABJRU5ErkJggg==";

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

  // Write output file
  fs.writeFileSync(outputFile, outputContent, 'utf8');
  console.log(`Generated ${outputFile} with ${flagCount} flags.`);

  console.log('\nDone! Rebuild the application with "npm run build" to include the encoded flags.');

} catch (error) {
  console.error('Error processing flag files:', error);
  process.exit(1);
}
