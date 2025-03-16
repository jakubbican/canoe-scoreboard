// LayoutManager.jsx
// Updated to handle the new layout structure

import React, { createContext, useContext, useState, useEffect } from "react";
import { useWebSocket } from "./WebSocketClient";

// Default configuration for different display types
const DISPLAY_CONFIGS = {
  horizontal: {
    width: 1920,
    height: 1080,
    className: "layout-horizontal",
    fontScale: 1.0,
    cssVariables: {
      "--header-size": "48px",
      "--body-size": "32px",
      "--small-size": "24px",
      "--spacing-unit": "10px",
      "--results-grid": "120px 80px 1fr 80px 70px 120px 120px",
      "--row-height": "80px",
      "--top-bar-height": "80px",
      "--info-text-height": "50px",
      "--competitor-height": "80px",
      "--oncourse-height": "80px",
      "--results-margin-top": "10px",
      "--scrollbar-width": "8px",
      "--header-shadow-color": "rgba(0, 0, 0, 0.3)",
      "--header-components-margin-top":
        "100px" /* Offset for horizontal layout */,
      "--results-top-padding": "15px",
      "--results-top-margin": "15px",
    },
  },
  vertical: {
    width: 1080,
    height: 1920,
    className: "layout-vertical",
    fontScale: 1.1,
    cssVariables: {
      "--header-size": "56px",
      "--body-size": "44px",
      "--small-size": "32px",
      "--spacing-unit": "12px",
      "--results-grid": "70px 50px 1fr 120px 70px 140px 100px",
      "--row-height": "48px",
      "--top-bar-height": "100px",
      "--info-text-height": "60px",
      "--competitor-height": "90px",
      "--oncourse-height": "90px",
      "--results-margin-top": "10px",
      "--scrollbar-width": "10px",
      "--header-shadow-color": "rgba(0, 0, 0, 0.3)",
      "--header-components-margin-top":
        "140px" /* Increased offset for vertical layout */,
      "--results-top-padding": "15px",
      "--results-top-margin": "20px",
    },
  },
  ledwall: {
    width: 768,
    height: 384,
    className: "layout-ledwall",
    fontScale: 0.7,
    cssVariables: {
      "--header-size": "28px",
      "--body-size": "20px",
      "--small-size": "16px",
      "--spacing-unit": "6px",
      "--results-grid": "60px 40px 1fr 80px 60px 100px 80px",
      "--row-height": "40px",
      "--top-bar-height": "60px",
      "--info-text-height": "40px",
      "--competitor-height": "60px",
      "--oncourse-height": "60px",
      "--results-margin-top": "5px",
      "--scrollbar-width": "6px",
      "--header-shadow-color": "rgba(0, 0, 0, 0.5)", // stronger shadow for LED walls
      "--header-components-margin-top": "60px" /* Offset for LED wall */,
      "--results-top-padding": "5px",
      "--results-top-margin": "5px",
    },
  },
  custom: {
    width: 1280,
    height: 720,
    className: "layout-custom",
    fontScale: 0.9,
    cssVariables: {
      "--header-size": "32px",
      "--body-size": "24px",
      "--small-size": "18px",
      "--spacing-unit": "8px",
      "--results-grid": "90px 60px 1fr 80px 60px 110px 100px",
      "--row-height": "60px",
      "--top-bar-height": "80px",
      "--info-text-height": "50px",
      "--competitor-height": "80px",
      "--oncourse-height": "80px",
      "--results-margin-top": "10px",
      "--scrollbar-width": "8px",
      "--header-shadow-color": "rgba(0, 0, 0, 0.3)",
      "--header-components-margin-top": "90px" /* Offset for custom layout */,
      "--results-top-padding": "10px",
      "--results-top-margin": "10px",
    },
  },
};

// Create context to share layout configuration
const LayoutContext = createContext({
  displayType: "horizontal",
  config: DISPLAY_CONFIGS.horizontal,
  setDisplayType: () => {},
  setCustomConfig: () => {},
  isVisible: () => false,
  scale: 1,
});

/**
 * Get URL parameters synchronously
 * This is a more reliable way to get URL parameters than using useState and useEffect
 */
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    type: params.get("type") || "horizontal",
    width: parseInt(params.get("width"), 10) || null,
    height: parseInt(params.get("height"), 10) || null,
    server: params.get("server") || null,
  };
}

/**
 * Layout Provider Component
 * Manages the display configuration and scaling
 */
export function LayoutProvider({
  children,
  initialDisplayType = "horizontal",
}) {
  // Get parameters directly from URL
  const urlParams = getUrlParams();
  console.log("URL params detected:", urlParams);

  // Set initial display type from URL parameter or default
  const [displayType, setDisplayType] = useState(
    urlParams.type || initialDisplayType
  );
  console.log("Using display type:", displayType);

  // Set custom config if width and height are provided in URL
  const initialCustomConfig =
    urlParams.width && urlParams.height
      ? {
          ...DISPLAY_CONFIGS.custom,
          width: urlParams.width,
          height: urlParams.height,
        }
      : null;

  const [customConfig, setCustomConfig] = useState(initialCustomConfig);
  const [scale, setScale] = useState(1);
  const { controlState } = useWebSocket();

  // Validate display type
  useEffect(() => {
    if (!DISPLAY_CONFIGS[displayType] && displayType !== "custom") {
      console.warn(
        `Invalid display type "${displayType}". Falling back to horizontal.`
      );
      setDisplayType("horizontal");
    }
  }, [displayType]);

  // Get the active configuration
  const config =
    customConfig || DISPLAY_CONFIGS[displayType] || DISPLAY_CONFIGS.horizontal;

  // Function to determine if a component should be visible based on control state
  const isVisible = (componentName) => {
    const controlMap = {
      current: "displayCurrent",
      top: "displayTop",
      top10: "displayTop10",
      infoText: "displayInfoText",
      schedule: "displaySchedule",
      dayTime: "displayDayTime",
      title: "displayTitle",
      topBar: "displayTopBar",
      footer: "displayFooter",
      onCourse: "displayOnCourse",
      onStart: "displayOnStart",
    };

    const controlProperty = controlMap[componentName];
    return controlProperty ? controlState[controlProperty] : false;
  };

  // Handle window resizing to scale the layout appropriately
  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Calculate scaling factors for width and height
      const widthScale = windowWidth / config.width;
      const heightScale = windowHeight / config.height;

      // Use the smaller scale to ensure everything fits on screen
      const newScale = Math.min(widthScale, heightScale);

      setScale(newScale);

      // Apply CSS variables for the current display type
      Object.entries(config.cssVariables).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    };

    // Set initial scale
    handleResize();

    // Update on window resize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [config, config.width, config.height]);

  // Allow updating custom configuration
  const updateCustomConfig = (newConfig) => {
    setCustomConfig({
      ...DISPLAY_CONFIGS.custom,
      ...newConfig,
      cssVariables: {
        ...DISPLAY_CONFIGS.custom.cssVariables,
        ...(newConfig.cssVariables || {}),
      },
    });
  };

  // Context value to be provided to children
  const contextValue = {
    displayType,
    config,
    setDisplayType,
    setCustomConfig: updateCustomConfig,
    isVisible,
    scale,
  };

  // For debugging purposes
  console.log("Active layout config:", {
    type: displayType,
    width: config.width,
    height: config.height,
    className: config.className,
    scale: scale,
  });

  return (
    <LayoutContext.Provider value={contextValue}>
      <div
        className={`scoreboard-layout ${config.className}`}
        style={{
          width: `${config.width}px`,
          height: `${config.height}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </LayoutContext.Provider>
  );
}

// Custom hook to use layout context
export function useLayout() {
  return useContext(LayoutContext);
}
