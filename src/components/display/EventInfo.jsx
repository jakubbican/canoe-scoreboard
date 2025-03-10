// EventInfo.jsx
// Fixed category extraction pattern

import React from 'react';
import { useLayout } from '../core/LayoutManager';
import { useWebSocket } from '../core/WebSocketClient';
import '../../styles/components/EventInfo.css';

function EventInfo({ title, infoText, visibleTitle, visibleInfo, visibleTopBar }) {
  const { displayType } = useLayout();
  const { topResults } = useWebSocket();
  
  // Extract category from results if available
  const getCategoryFromResults = () => {
    if (!topResults || !topResults.RaceName) return '';
    
    // Updated pattern to match "K1m", "C1w", etc. at the beginning
    const categoryMatch = topResults.RaceName.match(/^([KC][12].?)\s/i);
    if (categoryMatch) {
      return categoryMatch[1].toUpperCase();
    }
    
    return '';
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
    return title || '';
  };
  
  // Separate rendering function for the top bar and title
  const renderTopContent = () => {
    if (!visibleTopBar && !visibleTitle) return null;
    
    return (
      <>
        {visibleTopBar && (
          <div className={`top-bar ${displayType}`}>
            <div className="logo">
              <img src="/assets/logo.png" alt="Event Logo" />
            </div>
            {displayType !== 'ledwall' && (
              <div className="partners">
                <img src="/assets/partners.png" alt="Partners" />
              </div>
            )}
          </div>
        )}
        
        {visibleTitle && (
          <div className={`event-title ${displayType}`}>
            {formattedTitle()}
          </div>
        )}
      </>
    );
  };
  
  return (
    <>
      {renderTopContent()}
      {/* The info text component will be rendered separately in App.jsx */}
    </>
  );
}

// Export both the main component and the info text renderer
export default EventInfo;
export const InfoText = ({ infoText, visible }) => {
  const { displayType } = useLayout();
  
  if (!visible || !infoText) return null;
  
  // Calculate marquee speed based on text length
  const getMarqueeSpeed = (text) => {
    if (!text) return 10;
    const baseSpeed = Math.min(10, Math.max(5, Math.floor(text.length / 20)));
    return displayType === 'ledwall' ? baseSpeed * 0.7 : baseSpeed;
  };
  
  // Get font size based on display type
  const getMarqueeFontSize = () => {
    switch(displayType) {
      case 'horizontal': return '36px';
      case 'vertical': return '32px';
      case 'ledwall': return '28px';
      default: return '32px';
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
            letterSpacing: '2px',
            height: '100%'
          }}
        >
          {infoText}
        </marquee>
      </div>
    </div>
  );
};