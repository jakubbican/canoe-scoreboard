// ResultsList.jsx
// Modified to prevent whole page scrolling when scrolling results

import React, { useMemo, useEffect, useRef, useState } from "react";
import { useLayout } from "../core/LayoutManager";
import { isAtBottom } from "../../utils/scrollUtils";
import "../../styles/components/ResultsList.css";

function ResultsList({ data, visible, highlightBib }) {
  const { displayType } = useLayout();
  const resultRef = useRef(null);
  const highlightRef = useRef(null);
  const containerRef = useRef(null);
  const autoScrollTimeoutRef = useRef(null);
  const autoScrollIntervalRef = useRef(null);
  const pageScrollTimeoutRef = useRef(null);

  // State to track scrolling
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  // Track previous rank data for animations - only keep position changes
  const [prevRanks, setPrevRanks] = useState({});

  // Track if we've scrolled to highlighted item
  const [hasScrolledToHighlight, setHasScrolledToHighlight] = useState(false);

  // Configure auto-scroll settings
  const AUTO_SCROLL_SETTINGS = {
    initialDelay: 1000, // Wait 1 second before starting auto-scroll
    pageInterval: 4000, // Scroll one page every 4 seconds
    bottomPauseTime: 2000, // Pause at the bottom for 2 seconds
    userInactivityTimeout: 5000, // Resume auto-scroll after 5 seconds of inactivity
    maxScrollAttempts: 3, // Maximum number of attempts to scroll to top
  };

  // Safe scroll function that only affects the results container
  const safeScrollToItem = (itemElement) => {
    if (!itemElement || !containerRef.current) return;

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
    if (!containerRef.current || isUserScrolling) return;

    // Use the utility function to check if we're at the bottom
    if (isAtBottom(containerRef.current, 20)) {
      setAtBottom(true);

      // Wait at the bottom for a moment
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
    if (containerRef.current) {
      // Use scrollTo instead of scrollIntoView to prevent window scrolling
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Start page-by-page auto-scrolling
  const startPageAutoScroll = () => {
    if (isAutoScrolling || isUserScrolling) return;

    setIsAutoScrolling(true);
    console.log("Starting auto-scroll");

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
      console.log("Beginning auto-scroll cycle");

      // Immediately do a scroll to see movement
      if (containerRef.current && !isUserScrolling) {
        handlePageScroll();
      }

      // Set up interval for page-by-page scrolling
      autoScrollIntervalRef.current = setInterval(() => {
        if (!isUserScrolling && containerRef.current) {
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

  // Clean up timeouts and intervals on unmount
  useEffect(() => {
    return () => {
      stopAutoScroll();
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

    // Reset highlight scrolling flag when data changes
    setHasScrolledToHighlight(false);

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

  // Scroll to highlighted row when it changes
  useEffect(() => {
    if (highlightBib && highlightRef.current && !hasScrolledToHighlight) {
      // Use a small delay to ensure the component has fully updated
      const scrollTimer = setTimeout(() => {
        // Use our safe scroll function instead of scrollIntoView
        safeScrollToItem(highlightRef.current);
        setHasScrolledToHighlight(true);
      }, 300); // 300ms delay allows for state updates to complete

      return () => clearTimeout(scrollTimer);
    }
  }, [highlightBib, data?.list, hasScrolledToHighlight]);

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
      if (visible && data?.list?.length > 0) {
        console.log("Starting page auto-scroll");
        startPageAutoScroll();
      }

      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [visible, data?.list]);

  // Add a listener for the custom startAutoScroll event
  useEffect(() => {
    const handleStartAutoScroll = () => {
      console.log("Received startAutoScroll event");
      if (
        visible &&
        data?.list?.length > 0 &&
        !isAutoScrolling &&
        !isUserScrolling
      ) {
        console.log("Starting auto-scroll from event");
        startPageAutoScroll();
      }
    };

    // Listen for the startAutoScroll event from App.jsx
    window.addEventListener("startAutoScroll", handleStartAutoScroll);

    return () => {
      window.removeEventListener("startAutoScroll", handleStartAutoScroll);
    };
  }, [visible, data, isAutoScrolling, isUserScrolling]);

  // Handle visibility changes
  useEffect(() => {
    if (visible && data?.list?.length > 0) {
      resetAutoScrollTimer();
    } else {
      stopAutoScroll();
    }
  }, [visible]);

  // Handle data updates without restarting auto-scroll completely
  useEffect(() => {
    // If data changes, don't restart the auto-scroll cycle completely
    // Just make sure scroll-to-top happens if we were at the bottom
    if (data?.list?.length > 0 && isAutoScrolling && atBottom) {
      console.log("Data updated while at bottom, scrolling back to top");
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
    <div className={`results-list ${displayType}`} ref={resultRef}>
      <div className="results-body">
        {data.list.map((competitor, index) => {
          // Check if there are penalties
          const hasPenalties = competitor.Pen && competitor.Pen !== "0";
          const penaltyValue = hasPenalties ? competitor.Pen : "0";

          // Is this the highlighted row?
          const isHighlighted = parseInt(competitor.Bib) === highlightBib;

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
