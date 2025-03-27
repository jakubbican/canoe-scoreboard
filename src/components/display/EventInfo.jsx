// EventInfo.jsx
// Displays event title, logos, and scrolling information messages

import React, { useState, useEffect } from "react";
import { useLayout } from "../core/LayoutManager";
import { useWebSocket } from "../core/WebSocketClient";
import {
  getConfiguredAssetPath,
  getAssetPath,
  handleImageError,
  getBaseUrl,
} from "../../utils/assetUtils";
import "../../styles/components/EventInfo.css";

function EventInfo({
  title,
  infoText,
  visibleTitle,
  visibleInfo,
  visibleTopBar,
}) {
  const { displayType } = useLayout();
  const { topResults } = useWebSocket();

  // Extract category from results if available
  const getCategoryFromResults = () => {
    if (!topResults || !topResults.RaceName) return "";

    // Match "K1m", "C1w", etc. at the beginning
    const categoryMatch = topResults.RaceName.match(/^([KC][12].?)\s/i);
    if (categoryMatch) {
      return categoryMatch[1].toUpperCase();
    }

    return "";
  };

  // Format title with category if available
  const formattedTitle = () => {
    const category = getCategoryFromResults();
    if (category && title) {
      // If original title doesn't already include the category
      if (!title.includes(category)) {
        return `${title}: ${category}`;
      }
    }
    return title || "";
  };

  // State for dynamic asset paths
  const [logoSrc, setLogoSrc] = useState(`${getBaseUrl()}logo.png`);
  const [partnersSrc, setPartnersSrc] = useState(`${getBaseUrl()}partners.png`);

  // Load configured asset paths
  useEffect(() => {
    // Load logo
    getConfiguredAssetPath("logo")
      .then((path) => setLogoSrc(path))
      .catch(() => setLogoSrc(`${getBaseUrl()}logo.png`));

    // Load partners
    getConfiguredAssetPath("partners")
      .then((path) => setPartnersSrc(path))
      .catch(() => setPartnersSrc(`${getBaseUrl()}partners.png`));
  }, []);

  // Render the top bar and title
  const renderTopContent = () => {
    if (!visibleTopBar && !visibleTitle) return null;

    return (
      <>
        {visibleTopBar && (
          <div className={`top-bar ${displayType}`}>
            <div className="logo">
              <img
                src={logoSrc}
                alt="Event Logo"
                onError={(e) => handleImageError(e, getAssetPath("logo"))}
              />
            </div>
            <div className="partners">
              <img
                src={partnersSrc}
                alt="Partners"
                onError={(e) => handleImageError(e, getAssetPath("partners"))}
              />
            </div>
          </div>
        )}

        {visibleTitle && (
          <div className={`event-title ${displayType}`}>{formattedTitle()}</div>
        )}
      </>
    );
  };

  return (
    <>
      {renderTopContent()}
      {/* Info text component will be rendered separately in App.jsx */}
    </>
  );
}

// Export both the main component and the info text renderer
export default EventInfo;

// Info text component with marquee animation
export const InfoText = ({ infoText, visible }) => {
  const { displayType } = useLayout();

  if (!visible || !infoText) return null;

  // Calculate marquee speed based on text length
  const getMarqueeSpeed = (text) => {
    if (!text) return 10;
    const baseSpeed = Math.min(10, Math.max(5, Math.floor(text.length / 20)));
    return displayType === "ledwall" ? baseSpeed * 0.7 : baseSpeed;
  };

  // Get font size based on display type
  const getMarqueeFontSize = () => {
    switch (displayType) {
      case "horizontal":
        return "36px";
      case "vertical":
        return "32px";
      case "ledwall":
        return "28px";
      default:
        return "32px";
    }
  };

  return (
    <div className={`info-text ${displayType}`}>
      <div className="info-tab">Info</div>
      <div className={`info-marquee ${displayType}`}>
        <marquee
          scrollamount={getMarqueeSpeed(infoText)}
          behavior="scroll"
          direction="left"
          loop="infinite"
          style={{
            fontSize: getMarqueeFontSize(),
            fontWeight: 800,
            letterSpacing: "2px",
            height: "100%",
          }}
        >
          {infoText}
        </marquee>
      </div>
    </div>
  );
};
