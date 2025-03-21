// assetUtils.js
// Utility functions for asset loading, configuration and fallback management

// Import the base64-encoded flags
import { getFlagBase64, emptyFlagBase64 } from "./flagsBase64";

// Cache for config data
let configCache = null;
let configLoadPromise = null;

/**
 * Load asset configuration from JSON
 * @returns {Promise<Object>} - Asset configuration object
 */
export function loadAssetConfig() {
  if (configCache) {
    return Promise.resolve(configCache);
  }

  if (configLoadPromise) {
    return configLoadPromise;
  }

  configLoadPromise = fetch("/assets/config.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to load asset config: ${response.status} ${response.statusText}`
        );
      }
      return response.json();
    })
    .then((config) => {
      configCache = config;
      return config;
    })
    .catch((error) => {
      console.error("Error loading asset configuration:", error);
      // Return default empty config on error
      return { assets: {}, settings: {} };
    });

  return configLoadPromise;
}

/**
 * Get flag image path or base64 data with fallback
 * @param {string} countryCode - The country code (e.g., "CZE")
 * @param {boolean} useBase64 - Whether to use base64 encoding (default: true)
 * @returns {string} - Path or base64 data for the flag image
 */
export function getFlagPath(countryCode, useBase64 = true) {
  if (!countryCode) {
    return useBase64 ? emptyFlagBase64 : "/assets/flags/empty.png";
  }

  if (useBase64) {
    try {
      // Try to use the base64 version if available
      return getFlagBase64(countryCode);
    } catch (e) {
      console.warn("Base64 flags not available, falling back to file paths");
      // Fall back to file paths if base64 is not available
      useBase64 = false;
    }
  }

  // Use file path as fallback
  return `/assets/flags/${countryCode.toLowerCase()}.bmp`;
}

/**
 * Get asset path from configuration
 * @param {string} assetKey - The asset key in config (e.g., "logo")
 * @returns {Promise<string>} - Promise resolving to the asset path
 */
export function getConfiguredAssetPath(assetKey) {
  return loadAssetConfig().then((config) => {
    if (config.assets && config.assets[assetKey]) {
      const asset = config.assets[assetKey];
      return `/assets/${asset.path}`;
    }

    throw new Error(`Asset not found in configuration: ${assetKey}`);
  });
}

/**
 * Get asset path with fallback
 * @param {string} assetName - The asset name (e.g., "logo")
 * @param {string} extension - File extension (e.g., "png")
 * @param {string} fallback - Fallback asset name
 * @returns {string} - Path to the asset
 */
export function getAssetPath(assetName, extension = "png", fallback = null) {
  if (!assetName) {
    return fallback ? `/assets/${fallback}.${extension}` : null;
  }

  return `/assets/${assetName}.${extension}`;
}

/**
 * Preload an asset to ensure it's in the browser cache
 * @param {string} src - The asset path or URL
 * @returns {Promise<string>} - Promise resolving to the src when loaded
 */
export function preloadAsset(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
}

/**
 * Preload assets defined in configuration
 * @returns {Promise<Array>} - Promise resolving when all assets are preloaded
 */
export function preloadConfiguredAssets() {
  return loadAssetConfig().then((config) => {
    if (!config.settings || !config.settings.preloadAssets) {
      return [];
    }

    const assetPromises = [];

    if (config.assets) {
      Object.keys(config.assets).forEach((key) => {
        const asset = config.assets[key];
        const assetPath = `/assets/${asset.path}`;
        assetPromises.push(preloadAsset(assetPath));
      });
    }

    return Promise.all(assetPromises);
  });
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
