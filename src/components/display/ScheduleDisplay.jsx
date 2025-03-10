// ScheduleDisplay.jsx
// Displays the competition schedule

import React from 'react';
import { useLayout } from '../core/LayoutManager';
import '../../styles/components/ScheduleDisplay.css';

function ScheduleDisplay({ data, visible }) {
  const { displayType } = useLayout();
  
  if (!visible || !data || data.length === 0) {
    return null;
  }

  // Filter out past competitions if specified in the original logic
  const futureSchedule = data.filter(item => item.Past !== "1");
  
  if (futureSchedule.length === 0) {
    return null;
  }

  return (
    <div className={`schedule-display ${displayType}`}>
      <div className="schedule-header">
        Competition Schedule
      </div>
      
      <div className="schedule-body">
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
      
      <div className="schedule-footer">
        Czech Canoe Timing
      </div>
    </div>
  );
}

export default ScheduleDisplay;