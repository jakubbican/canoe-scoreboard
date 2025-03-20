// ResultsList.jsx
// Modified with layout-specific scroll timing and LED wall highlight time limit

import React, { useMemo, useEffect, useRef, useState } from "react";
import { useLayout } from "../core/LayoutManager";
import { isAtBottom } from "../../utils/scrollUtils";
import "../../styles/components/ResultsList.css";

function ResultsList({
  data,
  visible,
  highlightBib,
  isAutoScrolling: parentAutoScrolling,
}) {
  const { displayType, disableScrolling } = useLayout();
  const resultRef = useRef(null);
  const highlightRef = useRef(null);
  const containerRef = useRef(null);
  const autoScrollTimeoutRef = useRef(null);
  const autoScrollIntervalRef = useRef(null);
  const pageScrollTimeoutRef = useRef(null);
  const highlightScrollTimerRef = useRef(null);

  // Only used for LED wall
  const highlightStartTimeRef = useRef(null);
  const lastHighlightBibRef = useRef(null);

  // State to track scrolling
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(!disableScrolling);

  // Local state to track the effective highlight bib (with time limiting) - only for LED wall
  const [effectiveHighlightBib, setEffectiveHighlightBib] = useState(null);

  // Track previous rank data for animations - only keep position changes
  const [prevRanks, setPrevRanks] = useState({});

  // Track if we've scrolled to highlighted item
  const [hasScrolledToHighlight, setHasScrolledToHighlight] = useState(false);

  // Configure layout-specific auto-scroll settings
  const getAutoScrollSettings = () => {
    // Base settings
    const settings = {
      initialDelay: 3000, // Wait 1 second before starting auto-scroll
      pageInterval: 4000, // Default: Scroll one page every 4 seconds
      bottomPauseTime: 2000, // Pause at the bottom for 2 seconds
      userInactivityTimeout: 5000, // Resume auto-scroll after 5 seconds of inactivity
      maxScrollAttempts: 3, // Maximum number of attempts to scroll to top
      highlightViewTime: 5000, // Time to view highlighted item before returning to top (LED Wall)
      maxHighlightDuration: 5000, // Maximum time to keep a highlight active on LED wall
    };

    // Layout-specific overrides
    if (displayType === "vertical") {
      // Vertical layout: stay longer on each page, more time at bottom
      settings.pageInterval = 12000; // 8 seconds per page
      settings.bottomPauseTime = 8000; // 4 seconds at bottom
    } else if (displayType === "ledwall") {
      // LED Wall: quicker scrolling
      settings.pageInterval = 3000; // 3 seconds per page
      settings.bottomPauseTime = 1500; // 1.5 seconds at bottom
    } else if (displayType === "horizontal") {
      // Horizontal: default settings
      settings.pageInterval = 8000; // 4 seconds per page
      settings.bottomPauseTime = 2000; // 2 seconds at bottom
    }

    return settings;
  };

  // Get settings based on current layout
  const AUTO_SCROLL_SETTINGS = useMemo(
    () => getAutoScrollSettings(),
    [displayType]
  );

  // Check if someone is in current/on-course - assuming these properties exist in the data
  const isAthleteCurrent = useMemo(() => {
    return (
      data?.CurrentCompetitorActive === "1" || data?.OnCourseActive === "1"
    );
  }, [data]);

  // Handle highlightBib changes with time limiting - ONLY FOR LED WALL
  useEffect(() => {
    // Only apply the time limiting logic for LED wall
    if (displayType === "ledwall") {
      // Handle new highlight bib coming in
      if (highlightBib) {
        const now = Date.now();

        // Check if this is a new highlight or continuing one
        if (highlightBib !== lastHighlightBibRef.current) {
          // New highlight, reset the timer
          console.log(`[Scroll] New LED Wall highlight: ${highlightBib}`);
          highlightStartTimeRef.current = now;
          lastHighlightBibRef.current = highlightBib;
          setEffectiveHighlightBib(highlightBib);
          setHasScrolledToHighlight(false);
        } else {
          // Continuing highlight, check duration
          const elapsedTime = now - (highlightStartTimeRef.current || 0);

          if (elapsedTime < AUTO_SCROLL_SETTINGS.maxHighlightDuration) {
            // Still within time limit, keep highlight
            if (!effectiveHighlightBib) {
              setEffectiveHighlightBib(highlightBib);
            }
          } else {
            // Exceeded time limit, clear highlight
            if (effectiveHighlightBib) {
              console.log(
                `[Scroll] LED Wall highlight timeout: ${highlightBib} after ${Math.round(
                  elapsedTime / 1000
                )}s`
              );
              setEffectiveHighlightBib(null);

              // After clearing the highlight, scroll back to top

              scrollToTop();

              // Reset highlight state
              setHasScrolledToHighlight(false);

              // Check if we should restart auto-scrolling
              if (!isAthleteCurrent) {
                startPageAutoScroll();
              }
            }
          }
        }
      } else {
        // No highlight bib from server, clear our state
        lastHighlightBibRef.current = null;
        highlightStartTimeRef.current = null;
        setEffectiveHighlightBib(null);
      }
    } else {
      // For non-LED wall layouts, just use the highlightBib directly
      // Reset highlight scrolling flag when highlightBib changes
      if (highlightBib !== effectiveHighlightBib) {
        setHasScrolledToHighlight(false);
      }
      setEffectiveHighlightBib(highlightBib);
    }
  }, [
    highlightBib,
    displayType,
    isAthleteCurrent,
    AUTO_SCROLL_SETTINGS.maxHighlightDuration,
  ]);

  // Safe scroll function that only affects the results container
  const safeScrollToItem = (itemElement) => {
    if (!itemElement || !containerRef.current || disableScrolling) return;

    // Stop propagation to the window
    const container = containerRef.current;

    // Calculate center position
    const targetScrollTop =
      itemElement.offsetTop -
      container.clientHeight / 2 +
      itemElement.offsetHeight / 2;

    // Ensure we stay within bounds
    const maxScroll = container.scrollHeight - container.clientHeight;
    const safeScrollTop = Math.max(0, Math.min(targetScrollTop, maxScroll));

    // Perform the scroll only on the container, not the window
    container.scrollTo({
      top: safeScrollTop,
      behavior: "smooth",
    });

    // Reset the auto-scroll timer whenever we manually scroll
    resetAutoScrollTimer();
    setIsUserScrolling(true);

    // Reset user scrolling flag after a while
    setTimeout(() => {
      setIsUserScrolling(false);
    }, 1000);
  };

  // Handle page scroll
  const handlePageScroll = () => {
    if (
      !containerRef.current ||
      isUserScrolling ||
      !scrollEnabled ||
      disableScrolling
    )
      return;

    // Use the utility function to check if we're at the bottom
    if (isAtBottom(containerRef.current, 20)) {
      setAtBottom(true);

      // Wait at the bottom for a moment before scrolling back to top
      // Use the layout-specific bottom pause time
      clearTimeout(pageScrollTimeoutRef.current);
      pageScrollTimeoutRef.current = setTimeout(() => {
        scrollToTop();
        setAtBottom(false);
      }, AUTO_SCROLL_SETTINGS.bottomPauseTime);
      return;
    }

    // Get all rows
    const rows = containerRef.current.querySelectorAll(".result-row");
    if (!rows || rows.length === 0) return;

    // Find the first visible row
    const visibleRowIndex = findFirstVisibleRowIndex(
      containerRef.current,
      rows
    );

    // Calculate how many rows fit in the viewport
    const rowHeight = rows[0].offsetHeight;
    const containerHeight = containerRef.current.clientHeight;
    const rowsPerPage = Math.floor((containerHeight * 0.9) / rowHeight);

    // Calculate the next row to scroll to
    const nextRowIndex = Math.min(
      visibleRowIndex + rowsPerPage,
      rows.length - 1
    );

    // Scroll only the container, not the window
    if (rows[nextRowIndex]) {
      // Use scrollTop instead of scrollIntoView to prevent window scrolling
      const targetTop = rows[nextRowIndex].offsetTop;
      containerRef.current.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    }
  };

  // Find the index of the first visible row
  const findFirstVisibleRowIndex = (container, rows) => {
    const containerTop = container.scrollTop;

    for (let i = 0; i < rows.length; i++) {
      const rowTop = rows[i].offsetTop;
      // If this row starts at or below the current scroll position and is the first such row
      if (rowTop >= containerTop - 10) {
        return i;
      }
    }
    return 0; // Default to first row
  };

  // Function to scroll back to top
  const scrollToTop = () => {
    if (containerRef.current && !disableScrolling) {
      // Use scrollTo instead of scrollIntoView to prevent window scrolling
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      // Reset auto-scroll timers when returning to top
      resetAutoScrollTimer();
    }
  };

  // Start page-by-page auto-scrolling
  const startPageAutoScroll = () => {
    if (isAutoScrolling || isUserScrolling || disableScrolling) return;

    // For LED Wall, check if we should disable auto-scrolling
    if (displayType === "ledwall" && isAthleteCurrent) {
      console.log(
        "[Scroll] Disabled auto-scroll: athlete in current/on-course"
      );
      stopAutoScroll();
      scrollToTop();
      return;
    }

    setIsAutoScrolling(true);
    console.log(
      `[Scroll] Starting auto-scroll: ${displayType} layout, ${AUTO_SCROLL_SETTINGS.pageInterval}ms interval`
    );

    // First, handle any existing state - if at bottom, go to top
    if (containerRef.current && isAtBottom(containerRef.current)) {
      scrollToTop();
      setTimeout(startAutoScrollCycle, 500);
    } else {
      startAutoScrollCycle();
    }
  };

  // Start the actual auto-scroll cycle (extracted to separate function)
  const startAutoScrollCycle = () => {
    // Clear any existing timers
    clearTimeout(autoScrollTimeoutRef.current);
    clearInterval(autoScrollIntervalRef.current);

    // Initial delay before starting to scroll
    autoScrollTimeoutRef.current = setTimeout(() => {
      // Immediately do a scroll to see movement
      if (containerRef.current && !isUserScrolling && scrollEnabled) {
        handlePageScroll();
      }

      // Set up interval for page-by-page scrolling using layout-specific interval
      autoScrollIntervalRef.current = setInterval(() => {
        if (!isUserScrolling && containerRef.current && scrollEnabled) {
          // Do actual scrolling work here
          handlePageScroll();
        }
      }, AUTO_SCROLL_SETTINGS.pageInterval);
    }, AUTO_SCROLL_SETTINGS.initialDelay);
  };

  // Stop auto-scrolling
  const stopAutoScroll = () => {
    if (!isAutoScrolling) return;

    setIsAutoScrolling(false);
    clearTimeout(autoScrollTimeoutRef.current);
    clearInterval(autoScrollIntervalRef.current);
    clearTimeout(pageScrollTimeoutRef.current);
  };

  // Reset auto-scroll timer
  const resetAutoScrollTimer = () => {
    // First stop the current auto-scroll cycle
    stopAutoScroll();

    // After user inactivity, restart auto-scrolling
    clearTimeout(autoScrollTimeoutRef.current);
    autoScrollTimeoutRef.current = setTimeout(() => {
      if (visible && data?.list?.length > 0) {
        // If already at bottom, scroll to top first
        if (containerRef.current && isAtBottom(containerRef.current)) {
          scrollToTop();
          // Wait for scroll to complete before starting the auto-scroll cycle
          setTimeout(() => {
            startPageAutoScroll();
          }, 1000);
        } else {
          startPageAutoScroll();
        }
      }
    }, AUTO_SCROLL_SETTINGS.userInactivityTimeout);
  };

  // Handle layout-specific scrolling when highlight changes
  const handleHighlightScroll = () => {
    if (!effectiveHighlightBib || !highlightRef.current) return;

    clearTimeout(highlightScrollTimerRef.current);

    // Different behavior based on layout type
    if (displayType === "ledwall") {
      console.log(
        `[Scroll] Scrolling to highlighted athlete: ${effectiveHighlightBib}`
      );

      // Scroll to the highlighted row
      safeScrollToItem(highlightRef.current);
      setHasScrolledToHighlight(true);

      // After viewing period, scroll back to top and resume normal behavior
      highlightScrollTimerRef.current = setTimeout(() => {
        console.log("[Scroll] Returning to top after highlight view");
        scrollToTop();

        // Check if we should restart auto-scrolling
        if (!isAthleteCurrent) {
          startPageAutoScroll();
        }
      }, AUTO_SCROLL_SETTINGS.highlightViewTime);
    } else {
      // For horizontal and vertical layouts, just mark as scrolled without actually scrolling
      setHasScrolledToHighlight(true);
    }
  };

  // Clean up timeouts and intervals on unmount
  useEffect(() => {
    return () => {
      stopAutoScroll();
      clearTimeout(highlightScrollTimerRef.current);
    };
  }, []);

  // Update position tracking when results change - simplified to remove new entry animations
  useEffect(() => {
    if (!data || !data.list) return;

    // Update rank tracking for position change animations only
    const newRanks = {};
    data.list.forEach((competitor) => {
      newRanks[competitor.Bib] = parseInt(competitor.Rank, 10) || 999;
    });

    // Update for position changes
    setPrevRanks(newRanks);

    // Restart auto-scrolling when data changes
    resetAutoScrollTimer();
  }, [data?.list, visible]);

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

  // Handle highlight changes with layout-specific behavior
  useEffect(() => {
    if (effectiveHighlightBib && !hasScrolledToHighlight) {
      // Small delay to ensure component has rendered
      setTimeout(() => {
        handleHighlightScroll();
      }, 300);
    }
  }, [effectiveHighlightBib, displayType, hasScrolledToHighlight]);

  // Update scrollEnabled state when disableScrolling changes
  useEffect(() => {
    setScrollEnabled(!disableScrolling && !isAthleteCurrent);

    if (disableScrolling) {
      stopAutoScroll();
    } else if (
      visible &&
      !isAthleteCurrent &&
      !hasScrolledToHighlight &&
      !effectiveHighlightBib
    ) {
      resetAutoScrollTimer();
    }
  }, [disableScrolling, isAthleteCurrent, visible, effectiveHighlightBib]);

  // Update scrollEnabled state when athlete current status changes
  useEffect(() => {
    if (displayType === "ledwall") {
      // For LED Wall, disable scrolling when someone is in current/on-course
      setScrollEnabled(!isAthleteCurrent);

      if (isAthleteCurrent) {
        console.log(
          "[Scroll] LED Wall: Disabled - athlete in current/on-course"
        );
        stopAutoScroll();
        scrollToTop();
      } else if (visible && !hasScrolledToHighlight && !effectiveHighlightBib) {
        console.log(
          "[Scroll] LED Wall: Enabled - no athlete in current/on-course"
        );
        resetAutoScrollTimer();
      }
    } else {
      // For horizontal and vertical, always allow scrolling
      setScrollEnabled(true);
    }
  }, [isAthleteCurrent, displayType, visible, effectiveHighlightBib]);

  // Handle scroll events
  const handleScroll = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const isAtBottomValue =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 10;

    setAtBottom(isAtBottomValue);

    // If user is scrolling, pause auto-scroll
    setIsUserScrolling(true);
    resetAutoScrollTimer();

    // Reset user scrolling after a short delay
    setTimeout(() => {
      setIsUserScrolling(false);
    }, 1000);
  };

  // Access container element and store reference
  useEffect(() => {
    // Get the parent scrollable container
    const container = document.getElementById("results-scroll-container");
    if (container) {
      containerRef.current = container;

      // Add scroll event listener
      container.addEventListener("scroll", handleScroll);

      // Start auto-scrolling if visible and has data
      if (visible && data?.list?.length > 0 && scrollEnabled) {
        // For LED wall, don't start auto-scroll if there's an effective highlight
        if (displayType === "ledwall" && effectiveHighlightBib) {
          // Don't start auto-scroll
        } else {
          console.log(`[Scroll] Starting auto-scroll for ${displayType}`);
          startPageAutoScroll();
        }
      }

      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [visible, data?.list, scrollEnabled, effectiveHighlightBib, displayType]);

  // Add a listener for the custom startAutoScroll event
  useEffect(() => {
    const handleStartAutoScroll = () => {
      // For LED wall, don't start auto-scroll if there's an effective highlight
      if (displayType === "ledwall" && effectiveHighlightBib) {
        return;
      }

      if (
        visible &&
        data?.list?.length > 0 &&
        !isAutoScrolling &&
        !isUserScrolling &&
        scrollEnabled
      ) {
        console.log(`[Scroll] Event triggered auto-scroll: ${displayType}`);
        startPageAutoScroll();
      }
    };

    // Listen for the startAutoScroll event from App.jsx
    window.addEventListener("startAutoScroll", handleStartAutoScroll);

    return () => {
      window.removeEventListener("startAutoScroll", handleStartAutoScroll);
    };
  }, [
    visible,
    data,
    isAutoScrolling,
    isUserScrolling,
    scrollEnabled,
    effectiveHighlightBib,
    displayType,
  ]);

  // Handle visibility changes
  useEffect(() => {
    if (visible && data?.list?.length > 0 && scrollEnabled) {
      // For LED wall, don't reset auto-scroll timer if there's an effective highlight
      if (displayType === "ledwall" && effectiveHighlightBib) {
        // Don't reset auto-scroll timer
      } else {
        resetAutoScrollTimer();
      }
    } else {
      stopAutoScroll();
    }
  }, [visible, scrollEnabled, effectiveHighlightBib, displayType]);

  // Handle data updates without restarting auto-scroll completely
  useEffect(() => {
    // If data changes, don't restart the auto-scroll cycle completely
    // Just make sure scroll-to-top happens if we were at the bottom
    if (data?.list?.length > 0 && isAutoScrolling && atBottom) {
      console.log("[Scroll] Bottom reached, returning to top");
      // Scroll to top but preserve the auto-scrolling state
      clearTimeout(pageScrollTimeoutRef.current);
      pageScrollTimeoutRef.current = setTimeout(() => {
        scrollToTop();
        setAtBottom(false);
      }, 500); // Short delay before scrolling back to top
    }
  }, [data?.list]);

  // Keyboard events to control scrolling - Fixed to prevent window scrolling
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only process if container is available and visible
      if (!containerRef.current || !visible) return;

      // For key events we want to stop the default scrolling behavior
      let shouldPreventDefault = false;
      let targetPosition = null;

      // Get all rows
      const rows = containerRef.current.querySelectorAll(".result-row");
      if (!rows || rows.length === 0) return;

      // Handle manual navigation
      if (e.key === "Home") {
        targetPosition = 0;
        shouldPreventDefault = true;
      } else if (e.key === "End") {
        targetPosition = containerRef.current.scrollHeight;
        shouldPreventDefault = true;
      } else if (e.key === "PageDown") {
        // Find the first visible row
        const visibleRowIndex = findFirstVisibleRowIndex(
          containerRef.current,
          rows
        );

        // Calculate how many rows fit in the viewport
        const rowHeight = rows[0].offsetHeight;
        const containerHeight = containerRef.current.clientHeight;
        const rowsPerPage = Math.floor((containerHeight * 0.9) / rowHeight);

        // Calculate the next row to scroll to
        const nextRowIndex = Math.min(
          visibleRowIndex + rowsPerPage,
          rows.length - 1
        );

        // Get the position to scroll to
        if (rows[nextRowIndex]) {
          targetPosition = rows[nextRowIndex].offsetTop;
          shouldPreventDefault = true;
        }
      } else if (e.key === "PageUp") {
        // Find the first visible row
        const visibleRowIndex = findFirstVisibleRowIndex(
          containerRef.current,
          rows
        );

        // Calculate how many rows fit in the viewport
        const rowHeight = rows[0].offsetHeight;
        const containerHeight = containerRef.current.clientHeight;
        const rowsPerPage = Math.floor((containerHeight * 0.9) / rowHeight);

        // Calculate the previous row to scroll to
        const prevRowIndex = Math.max(0, visibleRowIndex - rowsPerPage);

        // Get the position to scroll to
        if (rows[prevRowIndex]) {
          targetPosition = rows[prevRowIndex].offsetTop;
          shouldPreventDefault = true;
        }
      }

      // If we found a target position, scroll to it and prevent default
      if (targetPosition !== null) {
        // Scroll only the container, not the window
        containerRef.current.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        setIsUserScrolling(true);
        resetAutoScrollTimer();

        // Reset the user scrolling state after a while
        setTimeout(() => {
          setIsUserScrolling(false);
        }, 1000);

        // Prevent the default scrolling behavior of the window
        if (shouldPreventDefault) {
          e.preventDefault();
        }
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown, { passive: false });

    // Cleanup
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, isUserScrolling]);

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
        isAutoScrolling && !disableScrolling ? "auto-scrolling" : ""
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

          // Get position change class - no longer includes new-entry class
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
