// ResultsList.jsx
// Refactored for the scrollable container with fixed scrolling

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

  // Track previous rank data for animations
  const [prevRanks, setPrevRanks] = useState({});
  const [newEntries, setNewEntries] = useState(new Set());

  // Track if we've scrolled to highlighted item
  const [hasScrolledToHighlight, setHasScrolledToHighlight] = useState(false);

  // Configure auto-scroll settings
  const AUTO_SCROLL_SETTINGS = {
    initialDelay: 1000, // Wait 1 second before starting auto-scroll (reduced for testing)
    pageInterval: 4000, // Scroll one page every 4 seconds
    bottomPauseTime: 2000, // Pause at the bottom for 2 seconds
    userInactivityTimeout: 5000, // Resume auto-scroll after 5 seconds of inactivity
    maxScrollAttempts: 3, // Maximum number of attempts to scroll to top
  };

  // Safe scroll function that only affects the results container
  const safeScrollToItem = (itemElement) => {
    if (!itemElement || !containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const itemRect = itemElement.getBoundingClientRect();

    // Calculate center position
    const targetScrollTop =
      itemElement.offsetTop -
      container.clientHeight / 2 +
      itemElement.offsetHeight / 2;

    // Ensure we stay within bounds
    const maxScroll = container.scrollHeight - container.clientHeight;
    const safeScrollTop = Math.max(0, Math.min(targetScrollTop, maxScroll));

    // Perform the scroll
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

    // Manual scrolling approach - more reliable than utility functions
    const container = containerRef.current;
    const pageHeight = container.clientHeight * 0.9;
    const currentScroll = container.scrollTop;
    const maxScroll = container.scrollHeight - container.clientHeight;

    // Simple but direct approach to scroll down by a page
    container.scrollTop = Math.min(currentScroll + pageHeight, maxScroll);

    // For visual smoothness after the fact
    setTimeout(() => {
      if (container && document.contains(container)) {
        container.style.scrollBehavior = "smooth";
        setTimeout(() => {
          if (container && document.contains(container)) {
            container.style.scrollBehavior = "auto";
          }
        }, 500);
      }
    }, 50);
  };

  // Function to scroll back to top
  const scrollToTop = () => {
    if (containerRef.current) {
      // Direct and simple approach - more reliable
      containerRef.current.scrollTop = 0;

      // Double-check after a short delay to ensure it worked
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = 0;
        }
      }, 50);
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

  // Update position tracking when results change
  useEffect(() => {
    if (!data || !data.list) return;

    // Identify new entries
    const currentBibs = new Set(data.list.map((c) => c.Bib));
    const previousBibs = new Set(
      Object.keys(prevRanks).map((bib) => bib.toString())
    );

    const newBibs = new Set();
    currentBibs.forEach((bib) => {
      if (!previousBibs.has(bib.toString())) {
        newBibs.add(bib);
      }
    });

    setNewEntries(newBibs);

    // Update rank tracking for position change animations
    const newRanks = {};
    data.list.forEach((competitor) => {
      newRanks[competitor.Bib] = parseInt(competitor.Rank, 10) || 999;
    });

    setPrevRanks(newRanks);

    // Clear new entries flag after animation time
    const clearNewEntriesTimer = setTimeout(() => {
      setNewEntries(new Set());
    }, 3000); // Match animation duration

    // Reset highlight scrolling flag when data changes
    setHasScrolledToHighlight(false);

    // Restart auto-scrolling when data changes
    resetAutoScrollTimer();

    return () => clearTimeout(clearNewEntriesTimer);
  }, [data?.list, visible]);

  // Get position change status for animation
  const getPositionChangeClass = (bib) => {
    if (!bib || !prevRanks[bib]) return "";

    // Find current rank
    const competitor = data.list.find((c) => c.Bib === bib);
    if (!competitor) return "";

    const currentRank = parseInt(competitor.Rank, 10) || 999;
    const prevRank = prevRanks[bib];

    if (newEntries.has(bib)) {
      return "new-entry";
    } else if (currentRank < prevRank) {
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
      // This fixes the timing issue between OnCourse removal and results scrolling
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
    const isAtBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 10;

    setAtBottom(isAtBottom);

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

  // Keyboard events to control scrolling
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only process if container is available and visible
      if (!containerRef.current || !visible) return;

      // Handle manual navigation
      if (e.key === "Home") {
        scrollToTop();
        e.preventDefault();
        setIsUserScrolling(true);
        resetAutoScrollTimer();
      } else if (e.key === "End") {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
          e.preventDefault();
          setIsUserScrolling(true);
          resetAutoScrollTimer();
        }
      } else if (e.key === "PageDown") {
        scrollPageDown();
        e.preventDefault();
        setIsUserScrolling(true);
        resetAutoScrollTimer();
      } else if (e.key === "PageUp") {
        if (containerRef.current) {
          const pageHeight = containerRef.current.clientHeight * 0.9;
          containerRef.current.scrollTop -= pageHeight;
          e.preventDefault();
          setIsUserScrolling(true);
          resetAutoScrollTimer();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
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

  // Get category title for the tab
  const getCategoryTitle = () => {
    // Check if we have a category
    const prefix = ""; // categoryInfo ? `${categoryInfo} - ` : '';

    if (data.RaceName) {
      // If there's a race status, add it to the race name
      return data.RaceStatus
        ? `${prefix}Výsledky: ${data.RaceName} - ${data.RaceStatus}`
        : `${prefix}Výsledky: ${data.RaceName}`;
    }

    return categoryInfo ? `${categoryInfo} - Výsledky` : "Výsledky";
  };

  return (
    <div className={`results-list ${displayType}`} ref={resultRef}>
      {/* Tab for Results with category title */}
      <div className="results-tab">{getCategoryTitle()}</div>

      <div className="results-body">
        {data.list.map((competitor, index) => {
          // Check if there are penalties
          const hasPenalties = competitor.Pen && competitor.Pen !== "0";
          const penaltyValue = hasPenalties ? competitor.Pen : "0";

          // Is this the highlighted row?
          const isHighlighted = parseInt(competitor.Bib) === highlightBib;

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
