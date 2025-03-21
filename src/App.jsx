// App.jsx
// Main application component with layout and data providers

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

// Get WebSocket server URL from URL parameter or use default
const getServerUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("server") || "ws://localhost:8081/";
};

// Determine if config panel should be shown on startup
const shouldShowConfig = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("config") === "true";
};

function App() {
  // App state
  const [showConfig, setShowConfig] = useState(shouldShowConfig());
  const [serverUrl, setServerUrl] = useState(getServerUrl());
  const [assetsPreloaded, setAssetsPreloaded] = useState(false);

  // Preload assets on component mount
  useEffect(() => {
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
  const { isVisible, displayType, disableScrolling } = useLayout();
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

  // Check if we have athletes in current or on-course
  const hasCurrentCompetitor = competitorData && competitorData.Bib;
  const hasOnCourseCompetitors =
    onCourseData &&
    Array.isArray(onCourseData) &&
    onCourseData.length > 0 &&
    onCourseData.some(
      (athlete) =>
        athlete.Total &&
        athlete.Total !== "0:00.00" &&
        athlete.Total !== "0.00" &&
        athlete.Total !== "0"
    );

  // Handle scroll position updates for header shadow
  const handleScroll = () => {
    const container = document.getElementById("results-scroll-container");
    if (container) {
      setScrollPosition(container.scrollTop);
    }
  };

  // Add scroll listener
  useEffect(() => {
    const container = document.getElementById("results-scroll-container");
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
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

  // Prepare data for ResultsList including current/on-course status
  const resultsData = useMemo(() => {
    if (!topResults) return null;

    return {
      ...topResults,
      CurrentCompetitorActive: hasCurrentCompetitor ? "1" : "0",
      OnCourseActive: hasOnCourseCompetitors ? "1" : "0",
    };
  }, [topResults, hasCurrentCompetitor, hasOnCourseCompetitors]);

  // Get highlight bib with suppression for duplicates
  const getHighlightBib = () => {
    // First check if there's a highlight bib from the server
    if (topResults && topResults.HighlightBib) {
      const highlightBib = parseInt(topResults.HighlightBib);

      // Check if this athlete is in the onCourseData array
      if (
        onCourseData &&
        Array.isArray(onCourseData) &&
        onCourseData.length > 0
      ) {
        // Check if any athlete in onCourseData matches the highlight bib
        const athleteOnCourse = onCourseData.some((athlete) => {
          return (
            athlete.Bib === topResults.HighlightBib ||
            parseInt(athlete.Bib) === highlightBib
          );
        });

        // If the athlete is on course, suppress highlighting in results
        if (athleteOnCourse) {
          return null;
        }
      }

      // If not shown in OnCourse, return the highlight bib
      return highlightBib;
    }

    // No highlight bib from server
    return null;
  };

  // Add a debug statement once instead of on every render
  React.useEffect(() => {
    if (scheduleData && scheduleData.length > 0) {
      console.log("Schedule data received in App:", scheduleData);
    }
  }, [scheduleData]);

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
            data={resultsData}
            visible={true}
            highlightBib={getHighlightBib()}
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
