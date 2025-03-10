// TimeDisplay.jsx
// Displays the competition time

import React from 'react';
import { useLayout } from '../core/LayoutManager';
import '../../styles/components/TimeDisplay.css';

function TimeDisplay({ time, visible }) {
  const { displayType } = useLayout();
  
  if (!visible || !time) {
    return null;
  }
  
  return (
    <div className={`time-display ${displayType}`}>
      {time}
    </div>
  );
}

export default TimeDisplay;