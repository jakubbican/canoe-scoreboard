// Top10Display.jsx
// Displays the top 10 competitors in a stylized format

import React from "react";
import { useLayout } from "../core/LayoutManager";
import { getFlagPath } from "../../utils/assetUtils";
import "../../styles/components/Top10Display.css";

function Top10Display({ data, visible }) {
  const { displayType } = useLayout();

  if (!visible || !data || !data.list || data.list.length === 0) {
    return null;
  }

  // Format competitor name
  const formatName = (name) => {
    if (!name) return "";

    // Handle double events (e.g., "SMITH John/JONES Mike")
    const nameArr = name.split("/");
    if (nameArr.length < 2) return name;

    // For doubles, show the family names
    const firstNameArr = nameArr[0].split(" ");
    const secondNameArr = nameArr[1].split(" ");
    return `${firstNameArr[0]}/${secondNameArr[0]}`;
  };

  return (
    <div className={`top10-display ${displayType}`}>
      <div className="top10-header">
        <h2>{data.RaceName}</h2>
        <p>Top Rankings</p>
      </div>

      <div className="top10-body">
        {data.list.map((competitor, index) => (
          <div key={`top10-${index}`} className="top10-row">
            <div className="top10-rank">
              {competitor.Rank ? `${competitor.Rank}.` : ""}
            </div>

            <div className="top10-name">{formatName(competitor.Name)}</div>

            <div className="top10-nat">
              {competitor.Nat && (
                <img
                  src={getFlagPath(competitor.Nat, true)}
                  alt={competitor.Nat}
                  onError={(e) => {
                    e.target.src = getFlagPath(null, true);
                  }}
                />
              )}
            </div>

            {competitor.Pen && competitor.Pen !== "0" && (
              <div className="top10-pen">{competitor.Pen}</div>
            )}

            <div className="top10-total">{competitor.Total}</div>

            <div className="top10-behind">
              {index === 0 ? "" : competitor.Behind}
            </div>
          </div>
        ))}
      </div>

      <div className="top10-footer">TIMING CZECH CANOE</div>
    </div>
  );
}

export default Top10Display;
