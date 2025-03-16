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
 * Creates an auto-scroll effect for results
 * (useful for when no user interaction is happening)
 * @param {string} containerId - The ID of the scrollable container
 * @param {object} options - Auto-scroll options
 * @param {number} options.speed - Pixels per second (default: 30)
 * @param {number} options.delay - Delay before starting in ms (default: 5000)
 * @param {number} options.pauseDelay - Pause when reaching the end in ms (default: 2000)
 * @param {number} options.resetDelay - Delay before scrolling back to top in ms (default: 8000)
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
        if (
          container.scrollTop + container.clientHeight >=
          container.scrollHeight
        ) {
          // Pause at the bottom before scrolling back to top
          isPaused = true;
          pauseTimeout = setTimeout(() => {
            container.scrollTop = 0;
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

        // Scroll back to top smoothly
        container.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        // Ensure absolute top after animation
        setTimeout(() => {
          if (container) {
            container.scrollTop = 0;
          }

          // Resume after scroll completes
          setTimeout(() => {
            isPaused = false;
          }, 100);
        }, 500);
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
      // First smooth scroll for animation
      container.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      // Then force absolute top position after animation
      setTimeout(() => {
        if (container) {
          container.scrollTop = 0;
        }
      }, 500);
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
