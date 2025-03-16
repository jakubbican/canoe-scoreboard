// App.jsx
// Refactored with new layout structure: fixed header, scrollable results, fixed footer

import React, { useState, useEffect, useMemo } from "react";
import {
  WebSocketProvider,
  useWebSocket,
} from "./components/core/WebSocketClient";
import { LayoutProvider, useLayout } from "./components/core/LayoutManager";
import { preloadConfiguredAssets } from "./utils/assetUtils";
import { initScrollHandling, createAutoScroll } from "./utils/scrollUtils";
import CurrentCompetitor from "./components/display/CurrentCompetitor";
import ResultsList from "./components/display/ResultsList";
import Top10Display from "./components/display/Top10Display";
import OnCourseDisplay from "./components/display/OnCourseDisplay";
import OnStartDisplay from "./components/display/OnStartDisplay";
import ScheduleDisplay from "./components/display/ScheduleDisplay";
import EventInfo, { InfoText } from "./components/display/EventInfo";
import TimeDisplay from "./components/display/TimeDisplay";
import Footer from "./components/display/Footer";
import ConnectionStatus from "./components/ui/ConnectionStatus";
import ConfigPanel from "./components/config/ConfigPanel";

// Get WebSocket server URL from URL parameter or default
const getServerUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("server") || "ws://localhost:8081/";
};

// Determine if we should show the config panel
const shouldShowConfig = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("config") === "true";
};

function App() {
  // Use initial state to avoid unnecessary state updates
  const [showConfig, setShowConfig] = useState(shouldShowConfig());
  const [serverUrl, setServerUrl] = useState(getServerUrl());
  const [assetsPreloaded, setAssetsPreloaded] = useState(false);

  // Preload configured assets on component mount
  useEffect(() => {
    // Preload assets from configuration
    preloadConfiguredAssets()
      .then(() => {
        console.log("Assets preloaded successfully");
        setAssetsPreloaded(true);
      })
      .catch((error) => {
        console.warn("Asset preloading failed, will load on demand:", error);
        // Still set as true to continue app loading even if preloading fails
        setAssetsPreloaded(true);
      });
  }, []);

  // Handle server URL change
  const handleServerChange = (newUrl) => {
    setServerUrl(newUrl);
    window.location.reload(); // Reload to connect to new server
  };

  // Use a memoized WebSocketProvider to prevent unnecessary reconnections
  const webSocketProvider = useMemo(
    () => (
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
          <ConnectionStatus onClick={() => setShowConfig((prev) => !prev)} />
        </LayoutProvider>
      </WebSocketProvider>
    ),
    [serverUrl, showConfig]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Alt+C to toggle config panel
      if (e.altKey && e.key === "c") {
        setShowConfig((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Show loading indicator while assets are being preloaded
  if (!assetsPreloaded) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Rajdhani, sans-serif",
          fontSize: "24px",
        }}
      >
        Loading assets...
      </div>
    );
  }

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
    titleData,
  } = useWebSocket();

  // State for scroll position in results area
  const [scrollPosition, setScrollPosition] = useState(0);

  // Initialize scroll handling
  useEffect(() => {
    // Initialize scroll handling
    const cleanup = initScrollHandling("results-scroll-container", {
      scrollSpeed: 60,
      pageScrollFactor: 0.9,
      onScroll: (position) => {
        setScrollPosition(position);
      },
    });

    // Setup auto-scroll that activates when no interaction for a while
    const autoScroller = createAutoScroll("results-scroll-container", {
      speed: 20, // Pixels per second
      delay: 10000, // Start after 10 seconds of inactivity
      pauseDelay: 2000, // Pause for 2 seconds at the bottom
      resetDelay: 8000, // Scroll back to top after 8 seconds
    });

    // Start auto-scroll
    autoScroller.start();

    // User interaction resets auto-scroll
    const resetAutoScroll = () => {
      if (autoScroller.isScrolling()) {
        autoScroller.stop();
        autoScroller.start();
      }
    };

    // Add user interaction listeners
    window.addEventListener("click", resetAutoScroll);
    window.addEventListener("keydown", resetAutoScroll);
    window.addEventListener("mousemove", resetAutoScroll);

    return () => {
      cleanup();
      autoScroller.stop();
      window.removeEventListener("click", resetAutoScroll);
      window.removeEventListener("keydown", resetAutoScroll);
      window.removeEventListener("mousemove", resetAutoScroll);
    };
  }, []);

  // Add header shadow when scrolled
  useEffect(() => {
    const header = document.querySelector(".scoreboard-header");
    if (header && scrollPosition > 10) {
      header.classList.add("shadowed");
    } else if (header) {
      header.classList.remove("shadowed");
    }
  }, [scrollPosition]);

  return (
    <div className="scoreboard-container">
      {/* HEADER SECTION - Fixed at top */}
      <div className="scoreboard-header">
        {/* Event info, title, connection status, time display */}
        <div className="header-top">
          <EventInfo
            title={titleData.text}
            infoText={null}
            visibleTitle={isVisible("title")}
            visibleInfo={false}
            visibleTopBar={isVisible("topBar")}
          />

          <TimeDisplay time={dayTimeData.time} visible={isVisible("dayTime")} />
        </div>

        {/* Header components that can be toggled */}
        <div className="header-components">
          {isVisible("infoText") && (
            <InfoText infoText={infoTextData.text} visible={true} />
          )}

          {isVisible("current") && (
            <CurrentCompetitor data={competitorData} visible={true} />
          )}

          {isVisible("onCourse") && (
            <OnCourseDisplay data={onCourseData} visible={true} />
          )}
        </div>
      </div>

      {/* DYNAMIC SECTION - Scrollable results */}
      <div id="results-scroll-container" className="scoreboard-results">
        {isVisible("top") && (
          <ResultsList
            data={topResults}
            visible={true}
            highlightBib={parseInt(topResults.HighlightBib) || 0}
          />
        )}
      </div>

      {/* OTHER FLOATING COMPONENTS */}
      <Top10Display data={top10Results} visible={isVisible("top10")} />
      <OnStartDisplay data={onStartData} visible={isVisible("onStart")} />
      <ScheduleDisplay data={scheduleData} visible={isVisible("schedule")} />

      {/* FOOTER SECTION - Fixed at bottom */}
      <Footer
        visible={isVisible("footer")}
        className={!isVisible("footer") ? "hidden" : ""}
      />
    </div>
  );
}

export default App;
