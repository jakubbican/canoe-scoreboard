// scrollUtils.js
// Utilities for handling scrolling in the results container

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

    // Apply scroll
    container.scrollTop += scrollAmount;

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

    let scrollAmount = 0;

    // Handle Page Up/Down keys
    if (e.key === "PageUp") {
      scrollAmount = -container.clientHeight * pageScrollFactor;
      e.preventDefault();
    } else if (e.key === "PageDown") {
      scrollAmount = container.clientHeight * pageScrollFactor;
      e.preventDefault();
    } else if (e.key === "Home") {
      // Scroll to top
      container.scrollTop = 0;
      if (onScroll) onScroll(0);
      e.preventDefault();
      return;
    } else if (e.key === "End") {
      // Scroll to bottom
      container.scrollTop = container.scrollHeight;
      if (onScroll) onScroll(container.scrollTop);
      e.preventDefault();
      return;
    } else if (e.key === "ArrowUp") {
      scrollAmount = -scrollSpeed;
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      scrollAmount = scrollSpeed;
      e.preventDefault();
    } else {
      // Not a scroll key
      return;
    }

    // Apply scroll
    container.scrollTop += scrollAmount;

    // Call onScroll callback if provided
    if (onScroll && typeof onScroll === "function") {
      onScroll(container.scrollTop);
    }
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
  const { behavior = "smooth", block = "center" } = options;

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

    // Immediate force scroll to top (no animation) - most reliable method
    containerElement.scrollTop = 0;

    // Check if we're already at the top
    if (containerElement.scrollTop === 0) {
      resolve(true);
      return;
    }

    // If not at top, try additional methods
    const attemptScroll = () => {
      attempts++;

      // Method 1: Use scrollTop for container-only scrolling instead of scrollTo
      // or scrollIntoView which can affect page position
      if (onlyContainer) {
        containerElement.scrollTop = 0;

        // If we're already at the top, resolve and exit
        if (containerElement.scrollTop === 0) {
          resolve(true);
          return;
        }
      } else {
        // Method 1 (legacy): Use scrollTo with smooth behavior
        containerElement.scrollTo({
          top: 0,
          behavior: smooth ? "smooth" : "auto",
        });
      }

      // Method 2: After a short delay, force scrollTop = 0
      setTimeout(
        () => {
          if (containerElement.scrollTop > 0) {
            containerElement.scrollTop = 0;
          }

          // Method 3: If still not at top, try scrollIntoView on the first child
          // Only if we're allowed to affect the whole page
          setTimeout(() => {
            if (containerElement.scrollTop > 0) {
              if (!onlyContainer && containerElement.firstElementChild) {
                containerElement.firstElementChild.scrollIntoView({
                  behavior: "auto",
                  block: "start",
                });
              } else {
                // For container-only scrolling, use scrollTop again
                containerElement.scrollTop = 0;
              }
            }

            // Final check and force
            setTimeout(() => {
              if (containerElement.scrollTop > 0) {
                containerElement.scrollTop = 0;
              }

              // If we're still not at the top and haven't exceeded max attempts, try again
              if (containerElement.scrollTop > 0 && attempts < maxAttempts) {
                attemptScroll();
              } else {
                // If we're at the top or out of attempts, resolve
                const success = containerElement.scrollTop === 0;
                resolve(success);
              }
            }, 100);
          }, 100);
        },
        smooth ? 500 : 50
      );
    };

    // Start the first attempt
    attemptScroll();
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
 * Scrolls a container one page down
 *
 * @param {string|HTMLElement} container - Container ID or element
 * @param {Object} options - Scroll options
 * @param {number} options.pageFactor - Percentage of page to scroll (default: 0.9)
 * @param {boolean} options.smooth - Whether to use smooth scrolling (default: true)
 * @param {boolean} options.onlyContainer - Only scroll the container, not the whole page (default: true)
 * @returns {boolean} True if scrolled, false if already at bottom
 */
export function scrollPageDown(container, options = {}) {
  const { pageFactor = 0.9, smooth = true, onlyContainer = true } = options;

  const containerElement =
    typeof container === "string"
      ? document.getElementById(container)
      : container;

  if (!containerElement) return false;

  const pageHeight = containerElement.clientHeight * pageFactor;
  const currentScroll = containerElement.scrollTop;
  const maxScroll =
    containerElement.scrollHeight - containerElement.clientHeight;

  // Check if already at bottom
  if (isAtBottom(containerElement)) {
    return false;
  }

  // Scroll down one page
  if (onlyContainer) {
    // Set scrollTop directly to ensure we only scroll within the container
    containerElement.scrollTop = Math.min(
      currentScroll + pageHeight,
      maxScroll
    );

    // If smooth scrolling is requested, apply it after the direct scroll
    // This is a compromise - we ensure container-only scrolling but still get smoothness
    if (smooth) {
      const targetPosition = containerElement.scrollTop;
      containerElement.scrollTop = currentScroll;

      // Now smoothly scroll to the target
      containerElement.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  } else {
    // Legacy method - may affect page position
    containerElement.scrollTo({
      top: Math.min(currentScroll + pageHeight, maxScroll),
      behavior: smooth ? "smooth" : "auto",
    });
  }

  return true;
}

/**
 * Creates a page-by-page auto-scroll effect for results
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

  // Get the container element
  const getContainer = () => document.getElementById(containerId);

  // Scroll one page down
  const performPageScroll = () => {
    if (isPaused || isUserActive) return;

    const container = getContainer();
    if (!container) return;

    // Check if we're near the bottom
    if (isAtBottom(container)) {
      // Pause at the bottom before returning to top
      clearTimeout(bottomTimeoutId);
      bottomTimeoutId = setTimeout(() => {
        // Scroll back to top
        ensureScrollToTop(container, { smooth: true });
      }, bottomDelay);
      return;
    }

    // Scroll down one page
    scrollPageDown(container, { pageFactor: 0.9, smooth: true });
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

    // Clear any existing timers
    clearAllTimers();

    // Start with a delay
    initialTimeoutId = setTimeout(() => {
      // Begin the page-by-page scrolling interval
      scrollIntervalId = setInterval(performPageScroll, pageInterval);
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
    scrollToTop: () => ensureScrollToTop(getContainer(), { smooth: true }),
    destroy,
    isActive: () => isActive,
    isPaused: () => isPaused,
  };
}

/**
 * Legacy auto-scroll function (maintained for backward compatibility)
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

  const startAutoScroll = () => {
    const container = document.getElementById(containerId);
    if (!container) return;

    clearInterval(scrollInterval);
    clearTimeout(pauseTimeout);
    clearTimeout(startTimeout);
    clearTimeout(resetTimeout);

    // Delay before starting
    startTimeout = setTimeout(() => {
      isScrolling = true;

      // Convert speed from pixels per second to pixels per interval (16ms ~= 60fps)
      const pixelsPerInterval = speed / 60;

      scrollInterval = setInterval(() => {
        if (isPaused) return;

        const container = document.getElementById(containerId);
        if (!container) {
          stopAutoScroll();
          return;
        }

        // Check if we've reached the bottom
        if (isAtBottom(container)) {
          // Pause at the bottom before scrolling back to top
          isPaused = true;
          pauseTimeout = setTimeout(() => {
            ensureScrollToTop(container, { smooth: false });
            isPaused = false;
          }, pauseDelay);
          return;
        }

        // Scroll down
        container.scrollTop += pixelsPerInterval;
      }, 16);

      // Set timeout to reset to top after resetDelay
      resetTimeout = setTimeout(() => {
        const container = document.getElementById(containerId);
        if (!container) return;

        isPaused = true;

        // Scroll back to top
        ensureScrollToTop(container, { smooth: true }).then(() => {
          // Resume after scroll completes
          setTimeout(() => {
            isPaused = false;
          }, 100);
        });
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
      ensureScrollToTop(container, { smooth: true });
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
