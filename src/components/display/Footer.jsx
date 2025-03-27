// Footer.jsx
// Displays the footer with sponsor logos

import React, { useState, useEffect } from "react";
import { useLayout } from "../core/LayoutManager";
import {
  getConfiguredAssetPath,
  getAssetPath,
  handleImageError,
  getBaseUrl,
} from "../../utils/assetUtils";
import "../../styles/components/Footer.css";

function Footer({ visible }) {
  const { displayType } = useLayout();
  const [footerSrc, setFooterSrc] = useState(`${getBaseUrl()}footer.png`); // Default fallback

  // Load configured asset path
  useEffect(() => {
    getConfiguredAssetPath("footer")
      .then((path) => {
        setFooterSrc(path);
      })
      .catch(() => {
        // Fallback to default path if configuration fails
        setFooterSrc(`${getBaseUrl()}footer.png`);
      });
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className={`footer ${displayType}`}>
      <div className="footer-content">
        <img
          src={footerSrc}
          alt="Sponsors"
          className="sponsor-logo"
          onError={(e) => handleImageError(e, getAssetPath("footer"))}
        />
      </div>
    </div>
  );
}

export default Footer;
