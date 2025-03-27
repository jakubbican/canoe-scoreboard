// OnStartDisplay.jsx
// Displays competitors at the start with configurable assets

import React, { useState, useEffect } from "react";
import { useLayout } from "../core/LayoutManager";
import {
  getConfiguredAssetPath,
  getAssetPath,
  handleImageError,
  getBaseUrl,
} from "../../utils/assetUtils";
import "../../styles/components/OnStartDisplay.css";

function OnStartDisplay({ data, visible }) {
  const { displayType } = useLayout();
  const [bibSrc, setBibSrc] = useState(`${getBaseUrl()}bib.png`);

  // Load bib image from configuration
  useEffect(() => {
    getConfiguredAssetPath("bib")
      .then((path) => {
        setBibSrc(path);
      })
      .catch(() => {
        // Fallback to default path if configuration fails
        setBibSrc(`${getBaseUrl()}bib.png`);
      });
  }, []);

  if (!visible || !data || data.length === 0) {
    return null;
  }

  // Format time to start
  const formatTimeToStart = (seconds) => {
    const stsToMinutes = seconds / 60;

    if (stsToMinutes < 1) {
      return `${seconds} sec`;
    } else if (stsToMinutes < 60) {
      return `${Math.floor(stsToMinutes)} min`;
    } else {
      return `${Math.floor(stsToMinutes / 60)} hrs`;
    }
  };

  return (
    <div className={`on-start-display ${displayType}`}>
      <div className="start-header">Starting Soon</div>

      <div className="start-body">
        {data.map((competitor, index) => (
          <div key={`start-${index}`} className="start-row">
            <div
              className="start-bib"
              style={{
                backgroundImage: `url(${bibSrc})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "100%",
              }}
            >
              {competitor.Bib}
            </div>

            <div className="start-time">
              {formatTimeToStart(competitor.sts)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OnStartDisplay;
