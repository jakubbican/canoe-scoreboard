// ScheduleDisplay.jsx
// Displays the competition schedule

import React from "react";
import { useLayout } from "../core/LayoutManager";
import "../../styles/components/ScheduleDisplay.css";

function ScheduleDisplay({ data, visible }) {
  const { displayType } = useLayout();

  // Only log once during development, don't flood the console
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Schedule component initialized with data:", data);
    }
  }, []);

  if (!visible || !data) {
    return null;
  }

  // Ensure data is in the expected format - handle both direct array and nested data object
  const scheduleItems = Array.isArray(data) ? data : [];

  if (scheduleItems.length === 0) {
    return null;
  }

  // Filter out past competitions if specified in the original logic
  // IMPORTANT: Temporarily disabling this filter for testing - show ALL items
  // const futureSchedule = scheduleItems.filter(item => item.Past !== "1");
  const futureSchedule = scheduleItems; // Show all items for testing

  if (futureSchedule.length === 0) {
    return null;
  }

  // Special layout for LED wall - split into columns for better space usage
  if (displayType === "ledwall") {
    // Split schedule items into two columns
    const midpoint = Math.ceil(futureSchedule.length / 2);
    const leftColumn = futureSchedule.slice(0, midpoint);
    const rightColumn = futureSchedule.slice(midpoint);

    return (
      <div className={`schedule-display ${displayType}`}>
        <div className="schedule-header">Competition Schedule</div>

        <div className="schedule-body ledwall-layout">
          <div className="schedule-column">
            <div className="schedule-row header">
              <div className="schedule-col competition">Competition</div>
              <div className="schedule-col boats">Boats</div>
              <div className="schedule-col start-time">Start</div>
            </div>

            {leftColumn.map((item, index) => (
              <div key={`schedule-left-${index}`} className="schedule-row">
                <div className="schedule-col competition">{item.Race}</div>
                <div className="schedule-col boats">{item.Count}</div>
                <div className="schedule-col start-time">{item.StartFirst}</div>
              </div>
            ))}
          </div>

          <div className="schedule-column">
            <div className="schedule-row header">
              <div className="schedule-col competition">Competition</div>
              <div className="schedule-col boats">Boats</div>
              <div className="schedule-col start-time">Start</div>
            </div>

            {rightColumn.map((item, index) => (
              <div key={`schedule-right-${index}`} className="schedule-row">
                <div className="schedule-col competition">{item.Race}</div>
                <div className="schedule-col boats">{item.Count}</div>
                <div className="schedule-col start-time">{item.StartFirst}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="schedule-footer">Czech Canoe Timing</div>
      </div>
    );
  }

  // Standard layout for horizontal and vertical displays
  return (
    <div className={`schedule-display ${displayType}`}>
      <div className="schedule-header">Competition Schedule</div>

      <div className="schedule-body standard-layout">
        <div className="schedule-row header">
          <div className="schedule-col competition">Competition</div>
          <div className="schedule-col boats">Boats</div>
          <div className="schedule-col start-time">First Start</div>
          <div className="schedule-col end-time">Last Start</div>
        </div>

        {futureSchedule.map((item, index) => (
          <div key={`schedule-${index}`} className="schedule-row">
            <div className="schedule-col competition">{item.Race}</div>
            <div className="schedule-col boats">{item.Count}</div>
            <div className="schedule-col start-time">{item.StartFirst}</div>
            <div className="schedule-col end-time">{item.StartLast}</div>
          </div>
        ))}
      </div>

      <div className="schedule-footer">Czech Canoe Timing</div>
    </div>
  );
}

export default ScheduleDisplay;
