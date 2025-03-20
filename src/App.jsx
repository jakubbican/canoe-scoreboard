// App.jsx
// Optimized with simplified scrolling interaction logic

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
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const autoScrollTimerRef = useRef(null);

  // Setup auto-scrolling timer
  useEffect(() => {
    // Only start auto-scrolling if config panel is not open
    if (!document.querySelector(".config-panel") && !disableScrolling) {
      // Start the auto-scroll timer after delay
      autoScrollTimerRef.current = setTimeout(() => {
        console.log("[Scroll] Initiating auto-scroll");
        setIsAutoScrolling(true);

        // Dispatch a custom event to notify the ResultsList that it should start scrolling
        const autoScrollEvent = new CustomEvent("startAutoScroll");
        window.dispatchEvent(autoScrollEvent);
      }, 3000); // 3 seconds initial delay
    }

    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
      }
    };
  }, [disableScrolling]);

  // Handle simple scroll position updates for header shadow
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

  // Prepare data for ResultsList including current/on-course status
  const resultsData = useMemo(() => {
    if (!topResults) return null;

    // Add information about current competitor status
    return {
      ...topResults,
      CurrentCompetitorActive: hasCurrentCompetitor ? "1" : "0",
      OnCourseActive: hasOnCourseCompetitors ? "1" : "0",
    };
  }, [topResults, hasCurrentCompetitor, hasOnCourseCompetitors]);

  // Modified function to get highlight bib with suppression for duplicates
  // Suppresses highlighting if the athlete is already shown in OnCourse display
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
