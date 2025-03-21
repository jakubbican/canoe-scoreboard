// ResultsList.jsx
// Optimized with improved ScrollManager for smoother autoscrolling

import React, { useMemo, useEffect, useRef, useState } from "react";
import { useLayout } from "../core/LayoutManager";
import {
  ResultsScrollManager,
  getScrollSettingsForLayout,
} from "../../utils/ScrollManager";
import "../../styles/components/ResultsList.css";

function ResultsList({ data, visible, highlightBib }) {
  const { displayType, disableScrolling } = useLayout();
  const resultRef = useRef(null);
  const highlightRef = useRef(null);
  const containerRef = useRef(null);

  // Scroll manager reference
  const scrollManagerRef = useRef(null);

  // State to track if we've initialized auto-scrolling
  const hasInitializedRef = useRef(false);

  // State to track the effective highlight bib (with time limiting)
  const [effectiveHighlightBib, setEffectiveHighlightBib] = useState(null);

  // State to track scroll phase for UI feedback
  const [scrollPhase, setScrollPhase] = useState("IDLE");

  // Track previous rank data for animations
  const [prevRanks, setPrevRanks] = useState({});

  // Reference for pending data
  const pendingDataRef = useRef(null);

  // Only used for LED wall
  const highlightStartTimeRef = useRef(null);
  const lastHighlightBibRef = useRef(null);

  // Track when we've received data - this is key for initialization
  const hasDataRef = useRef(false);

  // Track when we've already processed a highlight
  const [hasProcessedHighlight, setHasProcessedHighlight] = useState(false);

  // Check if someone is in current/on-course
  const isAthleteCurrent = useMemo(() => {
    return (
      data?.CurrentCompetitorActive === "1" || data?.OnCourseActive === "1"
    );
  }, [data]);

  // Initialize ScrollManager with layout-specific settings
  useEffect(() => {
    // Clean up any existing scroll manager
    if (scrollManagerRef.current) {
      scrollManagerRef.current.destroy();
    }

    // Get settings based on layout type
    const scrollSettings = getScrollSettingsForLayout(displayType);

    // Create new scroll manager with proper settings and phase change callback
    scrollManagerRef.current = new ResultsScrollManager({
      ...scrollSettings,
      displayType,
      onPhaseChange: (newPhase) => {
        setScrollPhase(newPhase);
      },
    });

    // Enable debug mode in development environment
    if (process.env.NODE_ENV === "development") {
      scrollManagerRef.current.debug = true;
    }

    // Reset initialization flag when manager is recreated
    hasInitializedRef.current = false;

    return () => {
      if (scrollManagerRef.current) {
        scrollManagerRef.current.destroy();
        scrollManagerRef.current = null;
      }
    };
  }, [displayType]);

  // Setup container reference - run immediately
  useEffect(() => {
    // Get the container reference as soon as possible
    const container = document.getElementById("results-scroll-container");
    if (container && scrollManagerRef.current) {
      containerRef.current = container;
      scrollManagerRef.current.setContainer(container);
      console.log("[Scroll] Container reference established");

      // Try to initialize scrolling if we already have data
      initializeScrollingIfReady();
    }
  }, []);

  // Function to initialize scrolling when all conditions are met
  const initializeScrollingIfReady = () => {
    // Skip if already initialized
    if (hasInitializedRef.current) return;

    // Make sure we have all requirements for scrolling
    if (!scrollManagerRef.current) {
      console.log("[Scroll] Cannot initialize: scroll manager not created");
      return;
    }

    // Make sure we have a container
    if (!containerRef.current) {
      const container = document.getElementById("results-scroll-container");
      if (container) {
        containerRef.current = container;
        scrollManagerRef.current.setContainer(container);
        console.log(
          "[Scroll] Container reference established during initialization"
        );
      } else {
        console.log("[Scroll] Cannot initialize: container not found");
        return;
      }
    }

    // Check for required conditions
    if (!visible) {
      console.log("[Scroll] Cannot initialize: component not visible");
      return;
    }

    if (disableScrolling) {
      console.log("[Scroll] Cannot initialize: scrolling disabled");
      return;
    }

    // Skip if no data yet - this is key!
    if (!hasDataRef.current) {
      console.log("[Scroll] Cannot initialize: no data yet");
      return;
    }

    // Special logic for LED wall - don't auto-scroll if athlete on course
    if (displayType === "ledwall" && isAthleteCurrent) {
      console.log(
        "[Scroll] Not initializing scrolling: LED wall with athlete on course"
      );
      // Still mark as initialized to prevent repeated attempts
      hasInitializedRef.current = true;
      return;
    }

    // Finally, all conditions satisfied - start scrolling with a small delay
    setTimeout(() => {
      // One last check before starting
      if (scrollManagerRef.current && scrollPhase === "IDLE") {
        // For LEDWALL, only start if there's no athlete on course
        if (displayType === "ledwall" && isAthleteCurrent) {
          console.log(
            "[Scroll] Skipping auto-scroll initialization: athlete appeared on course"
          );
          hasInitializedRef.current = true;
          return;
        }

        console.log("[Scroll] Initializing auto-scroll");
        scrollManagerRef.current.start();
        hasInitializedRef.current = true;
      }
    }, 1000); // 1 second delay for UI to stabilize
  };

  // Key function to handle data arrival and initialize scrolling
  useEffect(() => {
    if (!data || !data.list) return;

    // Update our data tracking flag
    hasDataRef.current = data.list.length > 0;

    // Log when we receive data
    console.log(`[Scroll] Received ${data.list.length} result items`);

    // Get positions for animation tracking
    const newRanks = {};
    data.list.forEach((competitor) => {
      newRanks[competitor.Bib] = parseInt(competitor.Rank, 10) || 999;
    });

    // Check with scroll manager if it's safe to update now
    const canUpdateImmediately =
      !scrollManagerRef.current?.handleDataUpdate ||
      scrollManagerRef.current.handleDataUpdate();

    if (canUpdateImmediately) {
      // Update position tracking immediately
      setPrevRanks(newRanks);
    } else {
      // Store for later application
      pendingDataRef.current = newRanks;
    }

    // Try to initialize scrolling now that we have data
    initializeScrollingIfReady();
  }, [data?.list]);

  // Handle visibility and scrolling state changes - ONLY FOR VERTICAL/HORIZONTAL
  useEffect(() => {
    if (!scrollManagerRef.current) return;

    // Skip for LEDWALL - we handle that in the state machine
    if (displayType === "ledwall") return;

    // For VERTICAL and HORIZONTAL layouts only

    // Determine if scrolling should be enabled
    const shouldEnableScroll = visible && !disableScrolling;

    if (!shouldEnableScroll) {
      // When not visible or scrolling is disabled by switch
      scrollManagerRef.current.disable();
      return;
    }

    scrollManagerRef.current.enable();

    // Always scroll regardless of athlete status in vertical/horizontal layouts
    if (scrollPhase === "IDLE" && hasDataRef.current) {
      console.log(
        `[Scroll] ${displayType}: starting scroll regardless of athlete status`
      );
      if (!hasInitializedRef.current) {
        initializeScrollingIfReady();
      } else {
        scrollManagerRef.current.start();
      }
    }
  }, [visible, disableScrolling, displayType, scrollPhase]);

  // Handle highlightBib changes
  useEffect(() => {
    // Skip if nothing to do
    if (!scrollManagerRef.current || displayType !== "ledwall") return;

    // Skip if scrolling disabled
    if (disableScrolling) return;

    // Only process when we have a new highlight
    if (highlightBib && highlightBib !== lastHighlightBibRef.current) {
      console.log(`[Scroll] New highlight detected: ${highlightBib}`);

      // Update our reference
      lastHighlightBibRef.current = highlightBib;
      setEffectiveHighlightBib(highlightBib);

      // Stop any active scrolling
      scrollManagerRef.current.stop();

      // Wait for the element to render
      setTimeout(() => {
        const highlightElement = document.querySelector(
          ".result-row.highlight"
        );
        if (highlightElement) {
          console.log(`[Scroll] Found highlight element, scrolling to it`);

          // Get the container
          const container = document.getElementById("results-scroll-container");
          if (container) {
            // Calculate center position
            const targetScrollTop =
              highlightElement.offsetTop -
              container.clientHeight / 2 +
              highlightElement.offsetHeight / 2;

            // Ensure we're within bounds
            const maxScroll = container.scrollHeight - container.clientHeight;
            const safeScrollTop = Math.max(
              0,
              Math.min(targetScrollTop, maxScroll)
            );

            // Scroll to highlighted element
            container.scrollTo({
              top: safeScrollTop,
              behavior: "smooth",
            });

            // Set a single timeout to return to top after 5 seconds
            console.log(`[Scroll] Setting highlight timeout for EXACTLY 5s`);

            // Clear any existing timeout first
            if (highlightTimeoutRef.current) {
              clearTimeout(highlightTimeoutRef.current);
            }

            highlightTimeoutRef.current = setTimeout(() => {
              console.log(
                `[Scroll] Highlight timeout complete, returning to top`
              );

              // Clear references
              lastHighlightBibRef.current = null;
              setEffectiveHighlightBib(null);

              // Return to top
              container.scrollTo({
                top: 0,
                behavior: "smooth",
              });

              // Clear the timeout reference
              highlightTimeoutRef.current = null;
            }, 5000);
          }
        }
      }, 100);
    }
  }, [highlightBib, displayType, disableScrolling]);

  // Use a simpler React state to control LEDWALL scrolling behavior
  const [ledwallScrollState, setLedwallScrollState] = useState("IDLE"); // IDLE, HIGHLIGHT_ACTIVE, ATHLETE_ACTIVE

  // Highlight timeout ref
  const highlightTimeoutRef = useRef(null);

  // LED wall scrolling state machine
  useEffect(() => {
    // Only for LED wall
    if (displayType !== "ledwall" || !scrollManagerRef.current) return;

    // If scrolling is disabled by the switch, override all other behavior
    if (disableScrolling) {
      console.log("[Scroll] LED Wall: Scrolling disabled by switch");
      scrollManagerRef.current.disable();
      return;
    }

    // Clear any existing timeout to prevent conflicts
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }

    // Handle state transitions
    switch (ledwallScrollState) {
      case "IDLE":
        // In IDLE state, check for highlights or athletes
        if (highlightBib && !hasProcessedHighlight) {
          // Transition to HIGHLIGHT_ACTIVE
          console.log(
            `[Scroll] LED Wall: Highlight appeared, showing bib ${highlightBib}`
          );
          setLedwallScrollState("HIGHLIGHT_ACTIVE");
        } else if (isAthleteCurrent) {
          // Transition to ATHLETE_ACTIVE
          console.log("[Scroll] LED Wall: Athlete on course, showing top");
          scrollManagerRef.current.stop();
          scrollManagerRef.current.scrollToTop();
          setLedwallScrollState("ATHLETE_ACTIVE");
        } else if (data && data.list && data.list.length > 0 && visible) {
          // Start auto-scrolling if component visible and not currently scrolling
          if (scrollPhase === "IDLE") {
            console.log("[Scroll] LED Wall: Starting auto-scroll");
            scrollManagerRef.current.start();
          }
        }
        break;

      case "HIGHLIGHT_ACTIVE":
        // Process highlight
        if (!highlightBib) {
          // Highlight disappeared before timeout
          console.log(
            "[Scroll] LED Wall: Highlight removed, but keeping view for minimum time"
          );
        }

        // Ensure we've scrolled to the highlight
        if (highlightRef.current && !hasProcessedHighlight) {
          setHasProcessedHighlight(true);
          console.log(
            `[Scroll] LED Wall: Scrolling to highlighted athlete bib ${effectiveHighlightBib}`
          );

          // Stop any scrolling and go to highlight
          scrollManagerRef.current.stop();

          // Calculate position that centers the element in the viewport
          const container = document.getElementById("results-scroll-container");
          if (container && highlightRef.current) {
            const targetScrollTop =
              highlightRef.current.offsetTop -
              container.clientHeight / 2 +
              highlightRef.current.offsetHeight / 2;

            // Ensure we're within bounds
            const maxScroll = container.scrollHeight - container.clientHeight;
            const safeScrollTop = Math.max(
              0,
              Math.min(targetScrollTop, maxScroll)
            );

            // Scroll to highlighted element
            container.scrollTo({
              top: safeScrollTop,
              behavior: "smooth",
            });
          }
        }

        // Set timeout to return to appropriate state after 5 seconds
        console.log(
          `[Scroll] LED Wall: Setting highlight timeout for 5s at ${new Date().toISOString()}`
        );
        highlightTimeoutRef.current = setTimeout(() => {
          console.log(
            `[Scroll] LED Wall: Highlight timeout triggered at ${new Date().toISOString()}`
          );

          // FULL RESET of all highlight-related state
          setHasProcessedHighlight(false);
          setEffectiveHighlightBib(null);

          // Also clear refs
          lastHighlightBibRef.current = null;
          highlightStartTimeRef.current = null;

          // Return to top
          if (scrollManagerRef.current) {
            console.log(
              "[Scroll] LED Wall: Timeout complete - returning to top"
            );
            scrollManagerRef.current.scrollToTop();

            // Force a small delay before changing state to ensure top scroll completes
            setTimeout(() => {
              // Transition to appropriate state
              const newState = isAthleteCurrent ? "ATHLETE_ACTIVE" : "IDLE";
              console.log(
                `[Scroll] LED Wall: Changing state to ${newState} after highlight timeout`
              );
              setLedwallScrollState(newState);
            }, 300);
          }
        }, 5000);
        break;

      case "ATHLETE_ACTIVE":
        // In ATHLETE_ACTIVE state
        if (!isAthleteCurrent) {
          // Athlete is gone, return to IDLE
          console.log("[Scroll] LED Wall: Athlete gone, returning to IDLE");
          setLedwallScrollState("IDLE");
        } else if (highlightBib && !hasProcessedHighlight) {
          // New highlight while athlete on course - show the highlight
          console.log(
            "[Scroll] LED Wall: New highlight while athlete on course"
          );
          setLedwallScrollState("HIGHLIGHT_ACTIVE");
        } else {
          // Ensure we're at the top
          scrollManagerRef.current.scrollToTop();
        }
        break;
    }

    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [
    displayType,
    ledwallScrollState,
    highlightBib,
    isAthleteCurrent,
    hasProcessedHighlight,
    disableScrolling,
    visible,
    data,
    scrollPhase,
  ]);

  // Handle highlight changes with scroll to view - ONLY FOR VERTICAL/HORIZONTAL
  useEffect(() => {
    // Skip for LEDWALL - we handle that in the state machine
    if (displayType === "ledwall") return;

    // The rest applies only to vertical/horizontal layouts
    // We don't do anything - highlights are only visual and don't affect scrolling
  }, [effectiveHighlightBib, hasProcessedHighlight, displayType]);

  // Detect when to clear highlights and return to top in LED wall mode
  // Not needed anymore - handled by state machine

  // Apply pending data updates when safe
  useEffect(() => {
    // When scrolling is idle or we're at bottom, apply any pending updates
    if (
      (scrollPhase === "IDLE" || scrollPhase === "PAUSED_AT_BOTTOM") &&
      pendingDataRef.current
    ) {
      console.log("[Scroll] Applying pending data update");
      setPrevRanks(pendingDataRef.current);
      pendingDataRef.current = null;
    }
  }, [scrollPhase]);

  // Get position change status for animation
  const getPositionChangeClass = (bib) => {
    if (!bib || !prevRanks[bib]) return "";

    // Find current rank
    const competitor = data.list.find((c) => c.Bib === bib);
    if (!competitor) return "";

    const currentRank = parseInt(competitor.Rank, 10) || 999;
    const prevRank = prevRanks[bib];

    if (currentRank < prevRank) {
      return "position-up"; // Improved position
    } else if (currentRank > prevRank) {
      return "position-down"; // Lost position
    }

    return "";
  };

  // Extract category from RaceName if available
  const categoryInfo = useMemo(() => {
    if (!data || !data.RaceName) return "";

    // Updated pattern to match "K1m", "C1w", etc. at the beginning
    const categoryMatch = data.RaceName.match(/^([KC][12].?)\s/i);
    if (categoryMatch) {
      return categoryMatch[1].toUpperCase();
    }

    return "";
  }, [data]);

  if (!visible || !data || !data.list || data.list.length === 0) {
    return null;
  }

  // Format the competitor name
  const formatName = (name) => {
    if (!name) return "";

    // Handle double events (e.g. "SMITH John/JONES Mike")
    const nameArr = name.split("/");
    if (nameArr.length < 2) return name;

    // For doubles, just show the family names
    const firstNameArr = nameArr[0].split(" ");
    const secondNameArr = nameArr[1].split(" ");
    return `${firstNameArr[0]}/${secondNameArr[0]}`;
  };

  return (
    <div
      className={`results-list ${displayType} ${
        scrollPhase !== "IDLE" && !disableScrolling ? "auto-scrolling" : ""
      }`}
      ref={resultRef}
    >
      <div className="results-body">
        {data.list.map((competitor, index) => {
          // Check if there are penalties
          const hasPenalties = competitor.Pen && competitor.Pen !== "0";
          const penaltyValue = hasPenalties ? competitor.Pen : "0";

          // Is this the highlighted row?
          const isHighlighted =
            effectiveHighlightBib &&
            parseInt(competitor.Bib) === effectiveHighlightBib;

          // Get position change class
          const positionClass = getPositionChangeClass(competitor.Bib);

          return (
            <div
              key={`${competitor.Bib}-${index}`}
              className={`result-row
                ${isHighlighted ? "highlight" : ""}
                ${positionClass}`}
              ref={isHighlighted ? highlightRef : null}
            >
              <div className="result-rank">
                {competitor.Rank ? `${competitor.Rank}.` : ""}
              </div>

              <div className="result-bib">{competitor.Bib}</div>

              <div className="result-name">{formatName(competitor.Name)}</div>

              {/* Always show penalties - 0 or actual value */}
              <div className="result-pen">{penaltyValue}</div>

              <div className="result-total">{competitor.Total}</div>

              <div className="result-behind">
                {index === 0 ? "" : competitor.Behind}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResultsList;
