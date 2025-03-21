// flagsBase64.js
// Contains base64-encoded flag images for better performance and offline usage

/**
 * Map of country codes to base64-encoded flag images
 * This is an auto-generated file - do not edit directly
 * @type {Object<string, string>}
 */
export const flagsBase64 = {
  // Flag data will be inserted here by generation script
};

/**
 * Empty flag base64 data
 * Used as fallback when a country code doesn't match
 * @type {string}
 */
export const emptyFlagBase64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAADICAYAAABS39xVAAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TtUUqgnYQ6ZChOlkQFXGUKhbBQmkrtOpgcumH0KQhSXFxFFwLDn4sVh1cnHV1cBUEwQ8QNzcnRRcp8X9JoUWMB8f9eHfvcfcOEBoVpppd44CqWUY6ERdz+RUx8IogIhhADwISM/VkZiELz/F1Dx9f72I8y/vcn6NPKZgM8InEs0w3LOJ14ulNS+e8TxxmZUkhPiceM+iCxI9cl11+41xyWOCZYSObniMOE4ulDpY7mJUNlXiKOKqoGuULOZcVzluc1UqNte7JXxgqaMsZrtOMIIFFJJGCCBk1bKACCzFaNVJMpGk/7uEfdvwpcsnk2gAjxzyqUCE5fvA/+N2tWZyccJNCcaD7xbY/RoDALtCs2/b3sW03TwD/M3Cltf3VBjDzSXq9rUWPgP5t4OK6rcl7wOUOMPSkS4bkSH6aQrEIvJ/RN+WBwVugd9XtrbWP0wcgS10t3QAHh8BoibLXPN4d7Ozt3zOt/n4ANKpyjnwLQf4AAAAGYktHRADxAFMAOiThi8kAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAHdElNRQflCBwSCiR5rPgyAAAA/UlEQVR42u3BAQEAAACAkP6v7ggKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABiqdQABFOnKDwAAAABJRU5ErkJggg==";

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
