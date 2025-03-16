// ResultsList.jsx
// Refactored for the scrollable container with fixed scrolling

import React, { useMemo, useEffect, useRef, useState } from "react";
import { useLayout } from "../core/LayoutManager";
import "../../styles/components/ResultsList.css";

function ResultsList({ data, visible, highlightBib }) {
  const { displayType } = useLayout();
  const resultRef = useRef(null);
  const highlightRef = useRef(null);
  const containerRef = useRef(null);
  const autoScrollTimeoutRef = useRef(null);

  // Track previous rank data for animations
  const [prevRanks, setPrevRanks] = useState({});
  const [newEntries, setNewEntries] = useState(new Set());

  // Track if we've scrolled to highlighted item
  const [hasScrolledToHighlight, setHasScrolledToHighlight] = useState(false);

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
  };

  // Function to scroll back to top
  const scrollToTop = () => {
    if (containerRef.current) {
      // First use smooth scrolling for visual effect
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      // Then ensure we reach absolute top with an immediate scroll after animation
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = 0;
        }
      }, 500); // Wait for smooth scroll to complete
    }
  };

  // Reset auto-scroll timer
  const resetAutoScrollTimer = () => {
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
    }

    autoScrollTimeoutRef.current = setTimeout(() => {
      scrollToTop();
    }, 8000); // 8 seconds
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
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

    return () => clearTimeout(clearNewEntriesTimer);
  }, [data?.list]);

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

  // Access container element and store reference
  useEffect(() => {
    // Get the parent scrollable container
    const container = document.getElementById("results-scroll-container");
    if (container) {
      containerRef.current = container;
      // Initialize auto-scroll timer
      resetAutoScrollTimer();
    }
  }, []);

  // Reset timer when user manually scrolls
  useEffect(() => {
    const handleScroll = () => {
      resetAutoScrollTimer();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

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

  let resultsToShow = data.list;

  return (
    <div className={`results-list ${displayType}`} ref={resultRef}>
      {/* Tab for Results with category title */}
      <div className="results-tab">{getCategoryTitle()}</div>

      <div className="results-body">
        {resultsToShow.map((competitor, index) => {
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
