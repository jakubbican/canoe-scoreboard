// scrollUtils.js
// Simplified utilities for handling scrolling in the results container
// Removed excessive user interaction handling for smoother autoscrolling

/**
 * Initializes scroll handling for the results container - simplified version
 * @param {string} containerId - The ID of the scrollable container
 * @param {object} options - Scroll options
 * @param {function} options.onScroll - Callback for scroll events
 * @param {boolean} options.enabled - Whether scrolling is enabled (default: true)
 * @returns {function} Cleanup function to remove event listeners
 */
export function initScrollHandling(containerId, options = {}) {
  const { onScroll = null, enabled = true } = options;

  // Significantly simplified keyboard handling for essential functions only
  const handleKeyDown = (e) => {
    if (!enabled) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    // Only handle Home and End keys for basic navigation
    if (e.key === "Home") {
      // Scroll to top
      container.scrollTop = 0;
      e.preventDefault();

      // Call onScroll callback if provided
      if (onScroll && typeof onScroll === "function") {
        onScroll(container.scrollTop);
      }
    } else if (e.key === "End") {
      // Scroll to bottom
      container.scrollTop = container.scrollHeight;
      e.preventDefault();

      // Call onScroll callback if provided
      if (onScroll && typeof onScroll === "function") {
        onScroll(container.scrollTop);
      }
    }
  };

  // Only attach event listeners if enabled
  if (enabled) {
    window.addEventListener("keydown", handleKeyDown);

    // Return cleanup function
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }

  // Return empty cleanup function if not enabled
  return () => {};
}

/**
 * Scrolls to a specific item in the results list
 * @param {string} containerId - The ID of the scrollable container
 * @param {string} itemSelector - CSS selector for the target item
 * @param {object} options - Scroll options
 * @param {string} options.behavior - Scroll behavior: 'smooth' or 'auto' (default: 'smooth')
 * @param {string} options.block - Vertical alignment: 'start', 'center', 'end', or 'nearest' (default: 'center')
 * @param {function} options.afterScroll - Callback to execute after scrolling
 */
export function scrollToItem(containerId, itemSelector, options = {}) {
  const { behavior = "smooth", block = "start", afterScroll = null } = options;

  const container = document.getElementById(containerId);
  if (!container) return;

  const item = container.querySelector(itemSelector);
  if (!item) return;

  item.scrollIntoView({
    behavior,
    block,
  });

  // Execute callback after scrolling if provided
  if (afterScroll && typeof afterScroll === "function") {
    // Wait for scroll to complete
    setTimeout(
      () => {
        afterScroll();
      },
      behavior === "smooth" ? 300 : 0
    );
  }
}

/**
 * Ensures a scroll container returns to the absolute top
 * @param {string|HTMLElement} container - Container ID or element
 * @param {Object} options - Scroll options
 * @param {boolean} options.smooth - Whether to use smooth scrolling (default: true)
 * @param {function} options.afterScroll - Callback to execute after scrolling
 * @returns {Promise} Resolves when scrolling is complete
 */
export function ensureScrollToTop(container, options = {}) {
  const { smooth = true, afterScroll = null } = options;

  return new Promise((resolve) => {
    // Get the container element
    const containerElement =
      typeof container === "string"
        ? document.getElementById(container)
        : container;

    if (!containerElement) {
      resolve(false);
      return;
    }

    // Get all rows to find the first one
    const rows = containerElement.querySelectorAll(".result-row");
    if (rows && rows.length > 0) {
      // Scroll to the first row
      rows[0].scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "start",
      });

      // Check if scroll worked
      setTimeout(
        () => {
          if (containerElement.scrollTop <= 10) {
            if (afterScroll && typeof afterScroll === "function") {
              afterScroll();
            }
            resolve(true);
            return;
          } else {
            // Fallback to direct method
            containerElement.scrollTop = 0;

            if (afterScroll && typeof afterScroll === "function") {
              afterScroll();
            }
            resolve(containerElement.scrollTop === 0);
          }
        },
        smooth ? 500 : 50
      );
    } else {
      // No rows, use direct method
      containerElement.scrollTop = 0;

      if (afterScroll && typeof afterScroll === "function") {
        afterScroll();
      }
      resolve(containerElement.scrollTop === 0);
    }
  });
}

/**
 * Checks if a scroll container is at the bottom
 *
 * @param {string|HTMLElement} container - Container ID or element
 * @param {number} threshold - Pixels threshold to consider as bottom (default: 20)
 * @returns {boolean} True if at the bottom
 */
export function isAtBottom(container, threshold = 20) {
  const containerElement =
    typeof container === "string"
      ? document.getElementById(container)
      : container;

  if (!containerElement) return false;

  const scrollTop = containerElement.scrollTop;
  const scrollHeight = containerElement.scrollHeight;
  const clientHeight = containerElement.clientHeight;

  // If we're within the threshold of the bottom
  return scrollHeight - scrollTop - clientHeight <= threshold;
}

/**
 * Creates a page-by-page auto-scroll effect for results with row alignment
 * Simplified version with reduced user interaction handling
 *
 * @param {string} containerId - The ID of the scrollable container
 * @param {object} options - Auto-scroll options
 * @param {number} options.initialDelay - Delay before starting in ms (default: 5000)
 * @param {number} options.pageInterval - Time between page scrolls in ms (default: 5000)
 * @param {number} options.bottomDelay - Pause when reaching the bottom in ms (default: 3000)
 * @param {string} options.layoutType - Layout type ('horizontal', 'vertical', 'ledwall')
 * @param {boolean} options.isAthleteCurrent - Whether an athlete is current or on course
 * @returns {object} Control object with start, stop, and isActive methods
 */
export function createPageScroller(containerId, options = {}) {
  const {
    initialDelay = 8000,
    pageInterval = 15000,
    bottomDelay = 3000,
    layoutType = "horizontal",
    isAthleteCurrent = false,
  } = options;

  let scrollIntervalId = null;
  let initialTimeoutId = null;
  let bottomTimeoutId = null;
  let isActive = false;
  let isPaused = false;
  let currentRowIndex = 0;

  // Check if scrolling should be enabled based on layout and athlete status
  const shouldEnableScrolling = () => {
    if (layoutType === "ledwall") {
      return !isAthleteCurrent;
    }
    return true; // Always enabled for horizontal and vertical
  };

  // Get the container element
  const getContainer = () => document.getElementById(containerId);

  // Get all rows in the container
  const getRows = () => {
    const container = getContainer();
    if (!container) return [];
    return container.querySelectorAll(".result-row");
  };

  // Scroll to the next row or set of rows
  const scrollToNextSet = () => {
    if (isPaused || !shouldEnableScrolling()) return;

    const container = getContainer();
    const rows = getRows();

    if (!container || rows.length === 0) return;

    // Calculate how many rows fit in the viewport
    const rowHeight = rows[0].offsetHeight;
    const containerHeight = container.clientHeight;
    const rowsPerPage = Math.max(1, Math.floor(containerHeight / rowHeight));

    // Calculate the next row to scroll to
    const nextRowIndex = currentRowIndex + rowsPerPage;

    // Check if we're at the bottom
    if (nextRowIndex >= rows.length) {
      // Reached the end of the list
      setAtBottom(true);
      return;
    }

    // Scroll to the next row
    currentRowIndex = nextRowIndex;

    if (rows[currentRowIndex]) {
      rows[currentRowIndex].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Set at bottom state and handle return to top
  const setAtBottom = (atBottom) => {
    if (!atBottom) return;

    // Pause at the bottom before returning to top
    clearTimeout(bottomTimeoutId);
    bottomTimeoutId = setTimeout(() => {
      // Reset row index and scroll back to top
      currentRowIndex = 0;

      // Get the first row and scroll to it
      const rows = getRows();
      if (rows.length > 0) {
        rows[0].scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, bottomDelay);
  };

  // Start the auto-scroller
  const start = () => {
    // Check if we should enable scrolling
    if (!shouldEnableScrolling()) {
      console.log(
        `[Scroll] Auto-scroll disabled for ${layoutType}: athlete status=${isAthleteCurrent}`
      );
      scrollToTop();
      return;
    }

    // Don't start if already active
    if (isActive) return;

    const container = getContainer();
    if (!container) return;

    // Mark as active and reset state
    isActive = true;
    isPaused = false;
    currentRowIndex = 0;

    // Clear any existing timers
    clearAllTimers();

    // Start with a delay
    initialTimeoutId = setTimeout(() => {
      // Begin the page-by-page scrolling interval
      scrollIntervalId = setInterval(scrollToNextSet, pageInterval);
    }, initialDelay);
  };

  // Stop the auto-scroller
  const stop = () => {
    isActive = false;
    isPaused = false;
    clearAllTimers();
  };

  // Pause scrolling (keep timers running)
  const pause = () => {
    isPaused = true;
  };

  // Resume scrolling
  const resume = () => {
    if (!shouldEnableScrolling()) {
      return;
    }
    isPaused = false;
  };

  // Clear all timers
  const clearAllTimers = () => {
    clearInterval(scrollIntervalId);
    clearTimeout(initialTimeoutId);
    clearTimeout(bottomTimeoutId);
  };

  // Scroll back to the top
  const scrollToTop = () => {
    currentRowIndex = 0;
    const rows = getRows();
    if (rows.length > 0) {
      rows[0].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Update athlete status
  const updateAthleteStatus = (isCurrentNow) => {
    if (isAthleteCurrent !== isCurrentNow) {
      // Status changed, update and handle accordingly

      if (layoutType === "ledwall") {
        if (isCurrentNow) {
          // Athlete is now current, stop scrolling and go to top
          console.log(
            `[Scroll] Athlete now current: stopping scroll for ${layoutType}`
          );
          stop();
          scrollToTop();
        } else if (!isCurrentNow && !isActive) {
          // Athlete is no longer current, can restart scrolling
          console.log(
            `[Scroll] Athlete no longer current: restarting scroll for ${layoutType}`
          );
          start();
        }
      }
    }
  };

  // Clean up all timers
  const destroy = () => {
    stop();
  };

  // Return the control interface
  return {
    start,
    stop,
    pause,
    resume,
    scrollToTop,
    destroy,
    updateAthleteStatus,
    isActive: () => isActive,
    isPaused: () => isPaused,
    shouldEnableScrolling: shouldEnableScrolling,
  };
}
