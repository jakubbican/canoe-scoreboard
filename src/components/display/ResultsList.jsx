// ResultsList.jsx
// Fixed category extraction pattern

import React, { useMemo } from "react";
import { useLayout } from "../core/LayoutManager";
import "../../styles/components/ResultsList.css";

function ResultsList({ data, visible, highlightBib }) {
  const { displayType } = useLayout();

  // Extract category from RaceName if available
  const categoryInfo = useMemo(() => {
    if (!data || !data.RaceName) return "";

    // Updated pattern to match "K1m", "C1w", etc. at the beginning
    const categoryMatch = data.RaceName.match(/^([KC][12].?)\s/i);
    if (categoryMatch) {
      return categoryMatch[1].toUpperCase();
    }

    return "";
  }, [data]);

  if (!visible || !data || !data.list || data.list.length === 0) {
    return null;
  }

  // Format the competitor name
  const formatName = (name) => {
    if (!name) return "";

    // Handle double events (e.g. "SMITH John/JONES Mike")
    const nameArr = name.split("/");
    if (nameArr.length < 2) return name;

    // For doubles, just show the family names
    const firstNameArr = nameArr[0].split(" ");
    const secondNameArr = nameArr[1].split(" ");
    return `${firstNameArr[0]}/${secondNameArr[0]}`;
  };

  // Get category title for the tab
  const getCategoryTitle = () => {
    // Check if we have a category
    const prefix = ""; // categoryInfo ? `${categoryInfo} - ` : '';

    if (data.RaceName) {
      // If there's a race status, add it to the race name
      return data.RaceStatus
        ? `${prefix}Výsledky: ${data.RaceName} - ${data.RaceStatus}`
        : `${prefix}Výsledky: ${data.RaceName}`;
    }

    return categoryInfo ? `${categoryInfo} - Výsledky` : "Výsledky";
  };

  let resultsToShow = data.list;

  return (
    <div className={`results-list ${displayType}`}>
      {/* Tab for Results with category title */}
      <div className="results-tab">{getCategoryTitle()}</div>

      <div className="results-body">
        {resultsToShow.map((competitor, index) => {
          // Check if there are penalties
          const hasPenalties = competitor.Pen && competitor.Pen !== "0";
          const penaltyValue = hasPenalties ? competitor.Pen : "0";

          return (
            <div
              key={`${competitor.Bib}-${index}`}
              className={`result-row ${
                parseInt(competitor.Bib) === highlightBib ? "highlight" : ""
              }`}
            >
              <div className="result-rank">
                {competitor.Rank ? `${competitor.Rank}.` : ""}
              </div>

              <div className="result-bib">{competitor.Bib}</div>

              <div className="result-name">{formatName(competitor.Name)}</div>

              {/* Always show penalties - 0 or actual value */}
              <div className="result-pen">{penaltyValue}</div>

              <div className="result-total">{competitor.Total}</div>

              <div className="result-behind">
                {index === 0 ? "" : competitor.Behind}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResultsList;
