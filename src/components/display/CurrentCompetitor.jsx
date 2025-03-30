// CurrentCompetitor.jsx
// Displays the current competitor's data with animation on competitor change

import React, { useEffect, useRef, useState } from "react";
import { useLayout } from "../core/LayoutManager";
import { formatName, formatGatePenaltyData } from "../../utils/formatUtils";
import "../../styles/components/CurrentCompetitor.css";

function CurrentCompetitor({ data, visible }) {
  const { displayType } = useLayout();
  const prevDataRef = useRef(null);
  const [isNewCompetitor, setIsNewCompetitor] = useState(false);
  const animationTimerRef = useRef(null);

  // Check if this is a new competitor and handle animations
  useEffect(() => {
    // Only run this check when data changes and is valid
    if (!data || !data.Bib) return;

    // Check if this is a new competitor compared to previous data
    if (prevDataRef.current && prevDataRef.current.Bib !== data.Bib) {
      setIsNewCompetitor(true);

      // Reset the flag after animation duration
      setTimeout(() => {
        setIsNewCompetitor(false);
      }, 3000);

      // Emit a custom event indicating a new current competitor
      const newCompEvent = new CustomEvent("athleteFinished", {
        detail: {
          athlete: prevDataRef.current,
          timestamp: new Date().getTime(),
        },
      });
      window.dispatchEvent(newCompEvent);
    }

    // Update previous data reference
    prevDataRef.current = { ...data };

    // Cleanup
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [data]);

  // Initialize prevDataRef on first render
  useEffect(() => {
    if (data && data.Bib) {
      prevDataRef.current = { ...data };
    }
  }, []);

  if (!visible || !data || !data.Bib) {
    return null;
  }

  // Process gates penalties if available
  const gatesPenalties = formatGatePenaltyData(data.Gates).map((penalty) => (
    <span
      key={penalty.gateNumber - 1}
      className={`gate-penalty ${penalty.penaltyClass}`}
    >
      {penalty.gateNumber}
    </span>
  ));

  // Check if there are penalties
  const hasPenalties = data.Pen && data.Pen !== "0";
  const penaltyValue = hasPenalties ? data.Pen : "0";

  // Add animation classes based on state
  const competitorClasses = [
    "current-competitor",
    displayType,
    isNewCompetitor ? "new-competitor" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={competitorClasses}>
      <div className="competitor-row">
        <div className="competitor-bib">{data.Bib}</div>

        <div className="competitor-name">{formatName(data.Name)}</div>

        <div className="competitor-gates-container">
          {gatesPenalties}
          <div
            className={`competitor-pen ${
              hasPenalties ? "has-penalty" : "no-penalty"
            }`}
          >
            {penaltyValue}
          </div>
        </div>

        <div className="competitor-total">{data.Total}</div>
      </div>
    </div>
  );
}

export default CurrentCompetitor;
