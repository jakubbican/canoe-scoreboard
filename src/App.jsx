// App.jsx
// Updated to include InfoText in the stacked components

import React, { useState, useEffect, useMemo } from 'react';
import { WebSocketProvider, useWebSocket } from './components/core/WebSocketClient';
import { LayoutProvider, useLayout } from './components/core/LayoutManager';
import CurrentCompetitor from './components/display/CurrentCompetitor';
import ResultsList from './components/display/ResultsList';
import Top10Display from './components/display/Top10Display';
import OnCourseDisplay from './components/display/OnCourseDisplay';
import OnStartDisplay from './components/display/OnStartDisplay';
import ScheduleDisplay from './components/display/ScheduleDisplay';
import EventInfo, { InfoText } from './components/display/EventInfo';
import TimeDisplay from './components/display/TimeDisplay';
import Footer from './components/display/Footer';
import ConnectionStatus from './components/ui/ConnectionStatus';
import ConfigPanel from './components/config/ConfigPanel';

// Get WebSocket server URL from URL parameter or default
const getServerUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('server') || 'ws://localhost:8081/';
};

// Determine if we should show the config panel
const shouldShowConfig = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('config') === 'true';
};

function App() {
  // Use initial state to avoid unnecessary state updates
  const [showConfig, setShowConfig] = useState(shouldShowConfig());
  const [serverUrl, setServerUrl] = useState(getServerUrl());
  
  // Handle server URL change
  const handleServerChange = (newUrl) => {
    setServerUrl(newUrl);
    window.location.reload(); // Reload to connect to new server
  };

  // Use a memoized WebSocketProvider to prevent unnecessary reconnections
  const webSocketProvider = useMemo(() => (
    <WebSocketProvider serverUrl={serverUrl}>
      <LayoutProvider>
        <ScoreboardContent />
        {showConfig && (
          <ConfigPanel 
            onClose={() => setShowConfig(false)}
            currentServer={serverUrl}
            onServerChange={handleServerChange}
          />
        )}
        <ConnectionStatus />
      </LayoutProvider>
    </WebSocketProvider>
  ), [serverUrl, showConfig]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Alt+C to toggle config panel
      if (e.altKey && e.key === 'c') {
        setShowConfig(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return webSocketProvider;
}

// This component contains all the display elements of the scoreboard
function ScoreboardContent() {
  const { isVisible } = useLayout();
  const {
    competitorData,
    topResults,
    top10Results,
    scheduleData,
    onCourseData,
    onStartData,
    dayTimeData,
    infoTextData,
    titleData
  } = useWebSocket();

  return (
    <>
      <EventInfo 
        title={titleData.text} 
        infoText={null} // No info text here, it's moved to stacked components
        visibleTitle={isVisible('title')}
        visibleInfo={false} // Always false here
        visibleTopBar={isVisible('topBar')}
      />
      
      <TimeDisplay 
        time={dayTimeData.time} 
        visible={isVisible('dayTime')} 
      />
      
      {/* Flexbox container for vertical stacking - now including InfoText */}
      <div className="stacked-components">
        {/* InfoText is now part of the stacked components */}
        {isVisible('infoText') && (
          <InfoText 
            infoText={infoTextData.text}
            visible={true}
          />
        )}
        
        {isVisible('current') && (
          <CurrentCompetitor 
            data={competitorData} 
            visible={true}
          />
        )}
        
        {isVisible('onCourse') && (
          <OnCourseDisplay 
            data={onCourseData} 
            visible={true}
          />
        )}
        
        {isVisible('top') && (
          <ResultsList 
            data={topResults} 
            visible={true}
            highlightBib={parseInt(topResults.HighlightBib) || 0}
          />
        )}
      </div>
      
      {/* Other components */}
      <Top10Display 
        data={top10Results} 
        visible={isVisible('top10')} 
      />
      
      <OnStartDisplay 
        data={onStartData} 
        visible={isVisible('onStart')} 
      />
      
      <ScheduleDisplay 
        data={scheduleData} 
        visible={isVisible('schedule')} 
      />
      
      <Footer 
        visible={isVisible('footer')} 
        className={!isVisible('footer') ? 'hidden' : ''}
      />
    </>
  );
}

export default App;