// App.jsx
// Refactored with new layout structure: fixed header, scrollable results, fixed footer

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  WebSocketProvider,
  useWebSocket,
} from "./components/core/WebSocketClient";
import { LayoutProvider, useLayout } from "./components/core/LayoutManager";
import { preloadConfiguredAssets } from "./utils/assetUtils";
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

  // State to track current competitor for highlighting in results
  const [currentCompetitorBib, setCurrentCompetitorBib] = useState(null);
  const [transitioningFromCourse, setTransitioningFromCourse] = useState(false);

  // Refs for tracking user interaction
  const userActivityTimeoutRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Track whether we're in auto-scroll mode
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // Track previous onCourse athletes to detect transitions
  const prevOnCourseRef = useRef([]);

  // Update the highlight bib when a competitor finishes
  useEffect(() => {
    // When competitorData changes, check if it's different from the current highlight
    if (competitorData && competitorData.Bib) {
      const competitorBib = parseInt(competitorData.Bib);

      // Check if this competitor just moved from onCourse to current
      const wasOnCourse = prevOnCourseRef.current.some(
        (athlete) => athlete.Bib === competitorData.Bib
      );

      if (wasOnCourse) {
        setTransitioningFromCourse(true);
        // Reset after a short delay to allow animations to complete
        setTimeout(() => {
          setTransitioningFromCourse(false);
        }, 1000);
      }

      // Update the current competitor bib
      setCurrentCompetitorBib(competitorBib);
    }
  }, [competitorData]);

  // Update the previous onCourse list for reference
  useEffect(() => {
    if (onCourseData && Array.isArray(onCourseData)) {
      prevOnCourseRef.current = [...onCourseData];
    }
  }, [onCourseData]);

  // Handle scroll events to update header shadow effect
  const handleScroll = (e) => {
    if (!resultsContainerRef.current) return;

    const scrollTop = resultsContainerRef.current.scrollTop;
    setScrollPosition(scrollTop);

    // Reset auto-scroll timer on user scroll
    resetUserActivityTimer();
  };

  // Reset user activity timer
  const resetUserActivityTimer = () => {
    if (userActivityTimeoutRef.current) {
      clearTimeout(userActivityTimeoutRef.current);
    }

    // Restart the auto-scroll timer after inactivity period
    userActivityTimeoutRef.current = setTimeout(() => {
      // Don't auto-scroll if config panel is open
      if (!document.querySelector(".config-panel")) {
        console.log("Triggering auto-scroll start");
        setIsAutoScrolling(true);

        // Dispatch a custom event to notify the ResultsList that it should start scrolling
        const autoScrollEvent = new CustomEvent("startAutoScroll");
        window.dispatchEvent(autoScrollEvent);
      }
    }, 5000); // 5 seconds inactivity period
  };

  // Setup event listeners for user activity
  useEffect(() => {
    // Track user activity to pause auto-scrolling
    const handleUserActivity = () => {
      setIsAutoScrolling(false);
      resetUserActivityTimer();
    };

    // Add event listeners for common user interactions
    window.addEventListener("click", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("wheel", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);

    // Initialize the results container ref
    resultsContainerRef.current = document.getElementById(
      "results-scroll-container"
    );

    // Add scroll event listener to the results container
    if (resultsContainerRef.current) {
      resultsContainerRef.current.addEventListener("scroll", handleScroll);
    }

    // Start the initial auto-scroll timer after 3 seconds delay
    setTimeout(() => {
      resetUserActivityTimer();
    }, 3000);

    // Cleanup function
    return () => {
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("wheel", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);

      if (resultsContainerRef.current) {
        resultsContainerRef.current.removeEventListener("scroll", handleScroll);
      }

      if (userActivityTimeoutRef.current) {
        clearTimeout(userActivityTimeoutRef.current);
      }
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

  // Determine which bib to highlight in results
  // This should prioritize:
  // 1. The currently displayed competitor that just transitioned from on-course
  // 2. The topResults.HighlightBib if available
  // 3. The currently displayed competitor
  const getHighlightBib = () => {
    if (transitioningFromCourse && currentCompetitorBib) {
      return currentCompetitorBib;
    }

    if (topResults && topResults.HighlightBib) {
      return parseInt(topResults.HighlightBib);
    }

    return currentCompetitorBib;
  };

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
            highlightBib={getHighlightBib()}
            isAutoScrolling={isAutoScrolling}
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
