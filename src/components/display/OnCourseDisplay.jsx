// OnCourseDisplay.jsx
// Displays competitors currently on the course, filtering out athletes with zero time

import React, { useMemo, useEffect, useRef } from "react";
import { useLayout } from "../core/LayoutManager";
import { formatName, formatGatePenaltyData } from "../../utils/formatUtils";
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

  // Create separate onCourseDisplay components for each competitor
  return (
    <>
      {filteredData.map((competitor, index) => (
        <div
          key={`oncourse-${index}`}
          className={`on-course-display ${displayType}`}
        >
          <div className="course-body">
            <div className="course-row">
              <div className="course-bib">{competitor.Bib}</div>

              <div className="course-name">{formatName(competitor.Name)}</div>

              <div className="course-gates-container">
                {formatGatePenaltyData(competitor.Gates).map((penalty) => (
                  <span
                    key={penalty.gateNumber - 1}
                    className={`course-gate-penalty course-${penalty.penaltyClass}`}
                  >
                    {penalty.gateNumber}
                  </span>
                ))}
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
