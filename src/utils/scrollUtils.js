// scrollUtils.js
// Utilities for handling scrolling in the results container
// Updated to support snap scrolling

/**
 * Initializes keyboard and mouse wheel scroll handling for the results container
 * @param {string} containerId - The ID of the scrollable container
 * @param {object} options - Scroll options
 * @param {number} options.scrollSpeed - Base scroll speed for wheel (default: 40)
 * @param {number} options.pageScrollFactor - How much of the container height to scroll for Page Up/Down (default: 0.9)
 * @param {function} options.onScroll - Callback for scroll events
 * @returns {function} Cleanup function to remove event listeners
 */
export function initScrollHandling(containerId, options = {}) {
  const { scrollSpeed = 40, pageScrollFactor = 0.9, onScroll = null } = options;

  const handleWheel = (e) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Calculate scroll amount
    let scrollAmount = 0;

    // Normalize deltaY across browsers
    if (e.deltaMode === 1) {
      // DOM_DELTA_LINE: scroll by lines
      scrollAmount = e.deltaY * scrollSpeed;
    } else {
      // DOM_DELTA_PIXEL: scroll by pixels
      scrollAmount = e.deltaY;
    }

    // Scroll according to snap behavior
    if (Math.abs(e.deltaY) > 0) {
      // Using snap scrolling, we move to the next row or previous row
      // Let the browser's built-in snap scrolling handle the exact position
      container.scrollBy({
        top: Math.sign(e.deltaY) * 50, // Just enough movement to trigger snap scrolling
        behavior: "smooth",
      });
    }

    // Call onScroll callback if provided
    if (onScroll && typeof onScroll === "function") {
      onScroll(container.scrollTop);
    }

    // Prevent default only if we're handling the scroll
    if (container.contains(e.target) || e.target.closest(`#${containerId}`)) {
      e.preventDefault();
    }
  };

  const handleKeyDown = (e) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Get all rows for better navigation
    const rows = container.querySelectorAll(".result-row");
    if (!rows || rows.length === 0) return;

    // Get row height from the first row
    const rowHeight = rows[0].offsetHeight;
    const containerHeight = container.clientHeight;
    const rowsPerPage = Math.floor(containerHeight / rowHeight);

    let targetRow = null;

    // Handle Page Up/Down keys
    if (e.key === "PageUp") {
      // Find visible rows
      const visibleRowIndex = findFirstVisibleRowIndex(container, rows);
      if (visibleRowIndex > 0) {
        // Move up by rowsPerPage or to the top
        targetRow = rows[Math.max(0, visibleRowIndex - rowsPerPage)];
      } else {
        // Already at top
        return;
      }
      e.preventDefault();
    } else if (e.key === "PageDown") {
      // Find visible rows
      const visibleRowIndex = findFirstVisibleRowIndex(container, rows);
      if (visibleRowIndex < rows.length - 1) {
        // Move down by rowsPerPage or to the bottom
        targetRow =
          rows[Math.min(rows.length - 1, visibleRowIndex + rowsPerPage)];
      } else {
        // Already at bottom
        return;
      }
      e.preventDefault();
    } else if (e.key === "Home") {
      // Scroll to top
      if (rows.length > 0) {
        targetRow = rows[0];
      }
      e.preventDefault();
    } else if (e.key === "End") {
      // Scroll to bottom
      if (rows.length > 0) {
        targetRow = rows[rows.length - 1];
      }
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      // Move up one row
      const visibleRowIndex = findFirstVisibleRowIndex(container, rows);
      if (visibleRowIndex > 0) {
        targetRow = rows[visibleRowIndex - 1];
      }
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      // Move down one row
      const visibleRowIndex = findFirstVisibleRowIndex(container, rows);
      if (visibleRowIndex < rows.length - 1) {
        targetRow = rows[visibleRowIndex + 1];
      }
      e.preventDefault();
    } else {
      // Not a scroll key
      return;
    }

    // Scroll to the target row if we have one
    if (targetRow) {
      targetRow.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Call onScroll callback if provided
      if (onScroll && typeof onScroll === "function") {
        setTimeout(() => {
          onScroll(container.scrollTop);
        }, 100);
      }
    }
  };

  // Find the index of the first visible row
  const findFirstVisibleRowIndex = (container, rows) => {
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;

    for (let i = 0; i < rows.length; i++) {
      const rowTop = rows[i].offsetTop;
      const rowBottom = rowTop + rows[i].offsetHeight;

      // If the row is at least partially visible
      if (rowBottom > containerTop && rowTop < containerBottom) {
        // Check if it's more than half visible
        if (rowTop < containerTop + 20) {
          return i;
        }
        return i;
      }
    }
    return 0; // Default to first row if none found
  };

  // Attach event listeners
  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("keydown", handleKeyDown);

  // Return cleanup function
  return () => {
    window.removeEventListener("wheel", handleWheel);
    window.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * Scrolls to a specific item in the results list
 * @param {string} containerId - The ID of the scrollable container
 * @param {string} itemSelector - CSS selector for the target item
 * @param {object} options - Scroll options
 * @param {string} options.behavior - Scroll behavior: 'smooth' or 'auto' (default: 'smooth')
 * @param {string} options.block - Vertical alignment: 'start', 'center', 'end', or 'nearest' (default: 'center')
 */
export function scrollToItem(containerId, itemSelector, options = {}) {
  const { behavior = "smooth", block = "start" } = options;

  const container = document.getElementById(containerId);
  if (!container) return;

  const item = container.querySelector(itemSelector);
  if (!item) return;

  item.scrollIntoView({
    behavior,
    block,
  });
}

/**
 * Ensures a scroll container returns to the absolute top
 * This function uses multiple approaches to ensure the container scrolls to top
 * even if the first attempt fails.
 *
 * @param {string|HTMLElement} container - Container ID or element
 * @param {Object} options - Scroll options
 * @param {boolean} options.smooth - Whether to use smooth scrolling (default: true)
 * @param {number} options.maxAttempts - Maximum number of attempts to scroll to top (default: 3)
 * @param {boolean} options.onlyContainer - Only scroll the container, not the whole page (default: true)
 * @returns {Promise} Resolves when scrolling is complete
 */
export function ensureScrollToTop(container, options = {}) {
  const { smooth = true, maxAttempts = 3, onlyContainer = true } = options;
  let attempts = 0;

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
            resolve(true);
            return;
          } else {
            // Fallback to direct method
            containerElement.scrollTop = 0;
            resolve(containerElement.scrollTop === 0);
          }
        },
        smooth ? 500 : 50
      );
    } else {
      // No rows, use direct method
      containerElement.scrollTop = 0;
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
 * Scrolls a container one page down, aligned to rows
 *
 * @param {string|HTMLElement} container - Container ID or element
 * @param {Object} options - Scroll options
 * @param {number} options.pageFactor - Percentage of page to scroll (default: 0.9)
 * @param {boolean} options.smooth - Whether to use smooth scrolling (default: true)
 * @returns {boolean} True if scrolled, false if already at bottom
 */
export function scrollPageDown(container, options = {}) {
  const { pageFactor = 0.9, smooth = true } = options;

  const containerElement =
    typeof container === "string"
      ? document.getElementById(container)
      : container;

  if (!containerElement) return false;

  // Check if already at bottom
  if (isAtBottom(containerElement)) {
    return false;
  }

  // Get all result rows
  const rows = containerElement.querySelectorAll(".result-row");
  if (!rows || rows.length === 0) return false;

  // Calculate how many rows fit in a page
  const rowHeight = rows[0].offsetHeight;
  const containerHeight = containerElement.clientHeight;
  const rowsPerPage = Math.floor((containerHeight * pageFactor) / rowHeight);

  // Find the first visible row
  const firstVisibleRowIndex = findFirstVisibleRowIndex(containerElement, rows);

  // Calculate target row
  const targetIndex = Math.min(
    firstVisibleRowIndex + rowsPerPage,
    rows.length - 1
  );

  // Scroll to the target row
  if (rows[targetIndex]) {
    rows[targetIndex].scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "start",
    });
    return true;
  }

  return false;
}

// Helper function to find the first visible row
function findFirstVisibleRowIndex(container, rows) {
  const containerTop = container.scrollTop;

  for (let i = 0; i < rows.length; i++) {
    const rowTop = rows[i].offsetTop;
    // If this row starts at or below the current scroll position and is the first such row
    if (rowTop >= containerTop - 10) {
      return i;
    }
  }
  return 0; // Default to first row
}

/**
 * Creates a page-by-page auto-scroll effect for results with row alignment
 * @param {string} containerId - The ID of the scrollable container
 * @param {object} options - Auto-scroll options
 * @param {number} options.initialDelay - Delay before starting in ms (default: 5000)
 * @param {number} options.pageInterval - Time between page scrolls in ms (default: 5000)
 * @param {number} options.bottomDelay - Pause when reaching the bottom in ms (default: 3000)
 * @param {number} options.inactivityTimeout - Time before restarting after user interaction in ms (default: 8000)
 * @returns {object} Control object with start, stop, pause, resume, and isActive methods
 */
export function createPageScroller(containerId, options = {}) {
  const {
    initialDelay = 5000,
    pageInterval = 5000,
    bottomDelay = 3000,
    inactivityTimeout = 8000,
  } = options;

  let scrollIntervalId = null;
  let initialTimeoutId = null;
  let bottomTimeoutId = null;
  let inactivityTimeoutId = null;
  let isActive = false;
  let isPaused = false;
  let isUserActive = false;
  let currentRowIndex = 0;

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
    if (isPaused || isUserActive) return;

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
    isPaused = false;
  };

  // Mark user as active (to pause scrolling)
  const userActive = () => {
    isUserActive = true;

    // Reset inactivity timer
    clearTimeout(inactivityTimeoutId);
    inactivityTimeoutId = setTimeout(() => {
      isUserActive = false;
    }, inactivityTimeout);
  };

  // Clear all timers
  const clearAllTimers = () => {
    clearInterval(scrollIntervalId);
    clearTimeout(initialTimeoutId);
    clearTimeout(bottomTimeoutId);
    clearTimeout(inactivityTimeoutId);
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

  // Clean up all timers and event listeners
  const destroy = () => {
    stop();
  };

  // Return the control interface
  return {
    start,
    stop,
    pause,
    resume,
    userActive,
    scrollToTop,
    destroy,
    isActive: () => isActive,
    isPaused: () => isPaused,
  };
}

/**
 * Legacy auto-scroll function (maintained for backward compatibility)
 * Updated to work with row-based snap scrolling
 * @param {string} containerId - The ID of the scrollable container
 * @param {object} options - Auto-scroll options
 * @returns {object} Control object with start, stop, pause, and resume methods
 */
export function createAutoScroll(containerId, options = {}) {
  const {
    speed = 30,
    delay = 5000,
    pauseDelay = 2000,
    resetDelay = 8000,
  } = options;

  let scrollInterval = null;
  let isScrolling = false;
  let isPaused = false;
  let pauseTimeout = null;
  let startTimeout = null;
  let resetTimeout = null;
  let currentRowIndex = 0;

  const startAutoScroll = () => {
    const container = document.getElementById(containerId);
    if (!container) return;

    clearInterval(scrollInterval);
    clearTimeout(pauseTimeout);
    clearTimeout(startTimeout);
    clearTimeout(resetTimeout);

    // Get all rows
    const rows = container.querySelectorAll(".result-row");
    if (!rows || rows.length === 0) return;

    // Delay before starting
    startTimeout = setTimeout(() => {
      isScrolling = true;
      currentRowIndex = 0;

      // Instead of scrolling by pixels, we'll scroll row by row
      scrollInterval = setInterval(() => {
        if (isPaused) return;

        const container = document.getElementById(containerId);
        if (!container) {
          stopAutoScroll();
          return;
        }

        const rows = container.querySelectorAll(".result-row");
        if (!rows || rows.length === 0) return;

        // Advance to next row
        currentRowIndex++;

        // Check if we've reached the bottom
        if (currentRowIndex >= rows.length) {
          // Pause at the bottom before scrolling back to top
          isPaused = true;
          pauseTimeout = setTimeout(() => {
            currentRowIndex = 0;
            if (rows[0]) {
              rows[0].scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
            isPaused = false;
          }, pauseDelay);
          return;
        }

        // Scroll to the current row
        if (rows[currentRowIndex]) {
          rows[currentRowIndex].scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 1000); // Scroll every second instead of continuous pixels

      // Set timeout to reset to top after resetDelay
      resetTimeout = setTimeout(() => {
        isPaused = true;
        currentRowIndex = 0;
        const rows = container.querySelectorAll(".result-row");
        if (rows && rows.length > 0) {
          rows[0].scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
        setTimeout(() => {
          isPaused = false;
        }, 100);
      }, resetDelay);
    }, delay);
  };

  const stopAutoScroll = () => {
    isScrolling = false;
    isPaused = false;
    clearInterval(scrollInterval);
    clearTimeout(pauseTimeout);
    clearTimeout(startTimeout);
    clearTimeout(resetTimeout);
  };

  const pauseAutoScroll = () => {
    if (isScrolling) {
      isPaused = true;
    }
  };

  const resumeAutoScroll = () => {
    if (isScrolling) {
      isPaused = false;
    }
  };

  const resetScrollPosition = () => {
    const container = document.getElementById(containerId);
    if (container) {
      const rows = container.querySelectorAll(".result-row");
      if (rows && rows.length > 0) {
        rows[0].scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  // Auto-pause on user interaction with the container
  const container = document.getElementById(containerId);
  if (container) {
    container.addEventListener("mouseenter", pauseAutoScroll);
    container.addEventListener("mouseleave", resumeAutoScroll);
    container.addEventListener("touchstart", pauseAutoScroll);
    container.addEventListener("touchend", resumeAutoScroll);
  }

  return {
    start: startAutoScroll,
    stop: stopAutoScroll,
    pause: pauseAutoScroll,
    resume: resumeAutoScroll,
    reset: resetScrollPosition,
    isScrolling: () => isScrolling,
    isPaused: () => isPaused,
  };
}
