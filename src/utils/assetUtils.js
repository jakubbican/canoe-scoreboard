// src/utils/assetUtils.js
// Utility functions for working with assets

/**
 * Get flag image path with fallback to empty flag
 * @param {string} countryCode - The country code (e.g., "CZE")
 * @returns {string} - Path to the flag image
 */
export function getFlagPath(countryCode) {
  if (!countryCode) {
    return '/assets/flags/empty.bmp';
  }
  
  return `/assets/flags/${countryCode.toLowerCase()}.bmp`;
}

/**
 * Get asset path with fallback
 * @param {string} assetName - The asset name (e.g., "logo")
 * @param {string} extension - File extension (e.g., "png")
 * @param {string} fallback - Fallback asset name
 * @returns {string} - Path to the asset
 */
export function getAssetPath(assetName, extension = 'png', fallback = null) {
  if (!assetName) {
    return fallback ? `/assets/${fallback}.${extension}` : null;
  }
  
  return `/assets/${assetName}.${extension}`;
}

/**
 * Handle image loading errors
 * @param {Event} event - The error event
 * @param {string} fallbackSrc - Fallback image source
 */
export function handleImageError(event, fallbackSrc) {
  if (event.target && fallbackSrc) {
    event.target.src = fallbackSrc;
  }
}