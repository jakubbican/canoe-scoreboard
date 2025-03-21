// ConfigPanel.jsx
// Configuration panel with settings for display type, server connection, and scrolling options

import React, { useState } from "react";
import { useLayout } from "../core/LayoutManager";
import "../../styles/components/ConfigPanel.css";

function ConfigPanel({ onClose, onServerChange, currentServer }) {
  const {
    displayType,
    setDisplayType,
    config,
    setCustomConfig,
    disableScrolling,
    setDisableScrolling,
  } = useLayout();

  // State for form inputs
  const [serverUrl, setServerUrl] = useState(currentServer);
  const [customWidth, setCustomWidth] = useState(config.width);
  const [customHeight, setCustomHeight] = useState(config.height);
  const [selectedDisplayType, setSelectedDisplayType] = useState(displayType);
  const [showTypeOptions, setShowTypeOptions] = useState(false);
  const [scrollingDisabled, setScrollingDisabled] = useState(disableScrolling);

  // Handle form submission and apply settings
  const handleSubmit = (e) => {
    e.preventDefault();

    // Update display type
    setDisplayType(selectedDisplayType);

    // Update scrolling setting
    setDisableScrolling(scrollingDisabled);

    // Update server URL if changed
    if (serverUrl !== currentServer) {
      onServerChange(serverUrl);
    }

    // Update custom dimensions if needed
    if (selectedDisplayType === "custom") {
      setCustomConfig({
        width: parseInt(customWidth),
        height: parseInt(customHeight),
      });
    }

    // Save to URL parameters for easy sharing/bookmarking
    const url = new URL(window.location.href);
    url.searchParams.set("type", selectedDisplayType);
    url.searchParams.set("server", serverUrl);
    url.searchParams.set("disableScroll", scrollingDisabled.toString());

    if (selectedDisplayType === "custom") {
      url.searchParams.set("width", customWidth);
      url.searchParams.set("height", customHeight);
    } else {
      url.searchParams.delete("width");
      url.searchParams.delete("height");
    }

    window.history.replaceState({}, "", url.toString());
  };

  // Get display type name for the dropdown menu
  const getDisplayTypeName = (type) => {
    switch (type) {
      case "horizontal":
        return "Horizontal (1920×1080)";
      case "vertical":
        return "Vertical (1080×1920)";
      case "ledwall":
        return "LED Wall (768×384)";
      case "custom":
        return "Custom Size";
      default:
        return type;
    }
  };

  // Handle display type selection
  const handleSelectType = (type) => {
    setSelectedDisplayType(type);
    setShowTypeOptions(false);
  };

  // Perform a hard refresh to clear cache
  const handleHardRefresh = () => {
    window.location.reload(true);
  };

  return (
    <div className="config-panel">
      <h2>Scoreboard Config</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="serverUrl">WebSocket Server:</label>
          <input
            type="text"
            id="serverUrl"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="ws://localhost:8081/"
          />
        </div>

        <div className="form-group">
          <label>Display Type:</label>

          {/* Custom dropdown for better visibility on LED wall */}
          <div className="custom-select">
            <div
              className="selected-option"
              onClick={() => setShowTypeOptions(!showTypeOptions)}
            >
              {getDisplayTypeName(selectedDisplayType)}
            </div>

            {showTypeOptions && (
              <div className="select-options">
                <div
                  className={`option ${
                    selectedDisplayType === "horizontal" ? "selected" : ""
                  }`}
                  onClick={() => handleSelectType("horizontal")}
                >
                  Horizontal (1920×1080)
                </div>
                <div
                  className={`option ${
                    selectedDisplayType === "vertical" ? "selected" : ""
                  }`}
                  onClick={() => handleSelectType("vertical")}
                >
                  Vertical (1080×1920)
                </div>
                <div
                  className={`option ${
                    selectedDisplayType === "ledwall" ? "selected" : ""
                  }`}
                  onClick={() => handleSelectType("ledwall")}
                >
                  LED Wall (768×384)
                </div>
                <div
                  className={`option ${
                    selectedDisplayType === "custom" ? "selected" : ""
                  }`}
                  onClick={() => handleSelectType("custom")}
                >
                  Custom Size
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedDisplayType === "custom" && (
          <>
            <div className="form-group">
              <label htmlFor="customWidth">Width (px):</label>
              <input
                type="number"
                id="customWidth"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                min="320"
                max="3840"
              />
            </div>

            <div className="form-group">
              <label htmlFor="customHeight">Height (px):</label>
              <input
                type="number"
                id="customHeight"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                min="240"
                max="2160"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={scrollingDisabled}
              onChange={(e) => setScrollingDisabled(e.target.checked)}
            />
            Disable Auto-Scrolling
          </label>
          <div className="option-description">
            Prevents results from automatically scrolling
          </div>
        </div>

        <div className="form-group buttons">
          <button type="submit">Apply</button>
          <button type="button" onClick={onClose}>
            Close
          </button>
          <button type="button" onClick={handleHardRefresh}>
            Hard Refresh
          </button>
        </div>
      </form>

      <div className="keyboard-shortcuts">
        <p>Press Alt+C to toggle config panel</p>
      </div>
    </div>
  );
}

export default ConfigPanel;
