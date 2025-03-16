// OnCourseDisplay.jsx
// Displays competitors currently on the course with same styling as CurrentCompetitor
// Filters out athletes with zero time

import React, { useMemo, useEffect, useRef } from "react";
import { useLayout } from "../core/LayoutManager";
import "../../styles/components/OnCourseDisplay.css";

function OnCourseDisplay({ data, visible }) {
  const { displayType } = useLayout();
  const prevDataRef = useRef([]);

  // Filter out athletes with zero time
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.filter((competitor) => {
      // Check if competitor has a valid time (not zero)
      return (
        competitor.Total &&
        competitor.Total !== "0:00.00" &&
        competitor.Total !== "0.00" &&
        competitor.Total !== "0"
      );
    });
  }, [data]);

  // Emit custom event when an athlete finishes (disappears from on-course)
  useEffect(() => {
    if (!prevDataRef.current || !data) return;

    // Find athletes that were on course before but not now (they finished)
    const previousBibs = new Set(
      prevDataRef.current.map((athlete) => athlete.Bib)
    );
    const currentBibs = new Set(data.map((athlete) => athlete.Bib));

    // Athletes that were on course before but not now
    const finishedAthletes = prevDataRef.current.filter(
      (athlete) => !currentBibs.has(athlete.Bib)
    );

    // If we have athletes that finished, dispatch an event
    if (finishedAthletes.length > 0) {
      // For each finished athlete, dispatch an event
      finishedAthletes.forEach((athlete) => {
        const event = new CustomEvent("athleteFinished", {
          detail: {
            athlete,
            timestamp: new Date().getTime(),
          },
        });
        window.dispatchEvent(event);

        console.log(`Athlete finished: ${athlete.Bib} - ${athlete.Name}`);
      });
    }

    // Update previous data reference
    prevDataRef.current = Array.isArray(data) ? [...data] : [];
  }, [data]);

  // Initialize prevDataRef on first render
  useEffect(() => {
    prevDataRef.current = Array.isArray(data) ? [...data] : [];
  }, []);

  if (!visible || !filteredData || filteredData.length === 0) {
    return null;
  }

  // Format competitor name
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

  // Process gates penalties
  const processGatePenalties = (gates) => {
    if (!gates) return [];

    return gates
      .split(",")
      .map((penalty, index) => {
        if (!penalty || penalty === "0") return null;

        // Determine penalty class (50 second penalty or 2 second penalty)
        const penaltyClass =
          parseInt(penalty, 10) >= 50
            ? "course-penalty-50"
            : "course-penalty-2";

        // Ensure double-digit gate numbers display properly
        const gateNumber = index + 1;

        return (
          <span key={index} className={`course-gate-penalty ${penaltyClass}`}>
            {gateNumber}
          </span>
        );
      })
      .filter(Boolean);
  };

  // Create separate onCourseDisplay components for each competitor
  return (
    <>
      {filteredData.map((competitor, index) => (
        <div
          key={`oncourse-${index}`}
          className={`on-course-display ${displayType}`}
        >
          {/* Tab only for the first competitor */}
          {index === 0 && <div className="course-tab">na trati</div>}

          <div className="course-body">
            <div className="course-row">
              <div className="course-bib">{competitor.Bib}</div>

              <div className="course-name">{formatName(competitor.Name)}</div>

              <div className="course-gates-container">
                {processGatePenalties(competitor.Gates)}
                <div
                  className={`course-pen ${
                    competitor.Pen && competitor.Pen !== "0"
                      ? "has-penalty"
                      : "no-penalty"
                  }`}
                >
                  {competitor.Pen && competitor.Pen !== "0"
                    ? competitor.Pen
                    : "0"}
                </div>
              </div>

              <div className="course-total">{competitor.Total}</div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default OnCourseDisplay;
