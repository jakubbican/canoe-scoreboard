// ScrollManager.js
// Centralized manager for handling results scrolling with state machine approach

/**
 * ResultsScrollManager
 *
 * Manages the auto-scrolling behavior of the results list with a state machine approach.
 * Handles scroll phases, timing, and interruptions like highlights.
 */
export class ResultsScrollManager {
  /**
   * Create a new ScrollManager
   * @param {Object} options Configuration options
   * @param {number} options.initialDelay Initial delay before starting auto-scroll (ms)
   * @param {number} options.pageInterval Time between page scrolls (ms)
   * @param {number} options.bottomPauseTime Time to pause at bottom before returning to top (ms)
   * @param {number} options.highlightViewTime Time to show highlighted athlete before resuming normal scrolling (ms)
   * @param {string} options.displayType Layout type ('horizontal', 'vertical', 'ledwall')
   * @param {function} options.onPhaseChange Callback when scroll phase changes
   */
  constructor(options = {}) {
    // Configuration with defaults
    this.config = {
      initialDelay: 3000,
      pageInterval: 8000,
      bottomPauseTime: 2000,
      highlightViewTime: 5000,
      displayType: "horizontal",
      onPhaseChange: null,
      ...options,
    };

    // State - using explicit phases for better tracking
    this.phase = "IDLE"; // IDLE, WAITING, SCROLLING, PAUSED_AT_BOTTOM, RETURNING_TO_TOP, HIGHLIGHT_VIEW
    this.timer = null;
    this.currentRowIndex = 0;
    this.container = null;
    this.isPaused = false;
    this.isDisabled = false;

    // Performance tracking
    this.lastScrollTime = 0;
    this.pendingDataUpdate = false;

    // Debug
    this.debug = false;
  }

  /**
   * Set the container element to scroll
   * @param {HTMLElement} element Container element
   */
  setContainer(element) {
    this.container = element;
  }

  /**
   * Start the scrolling cycle
   * @returns {boolean} Whether scrolling was started
   */
  start() {
    if (this.phase !== "IDLE" || this.isDisabled) {
      this.logDebug(
        `Scroll not started: phase=${this.phase}, isDisabled=${this.isDisabled}`
      );
      return false;
    }

    this.logDebug("Starting scroll cycle");
    this.setPhase("WAITING");
    this.currentRowIndex = 0;
    this.isPaused = false;

    // Try to find the container if not set yet
    if (!this.container) {
      this.logDebug(
        "Container not set yet - will try to find before scrolling"
      );
      const container = document.getElementById("results-scroll-container");
      if (container) {
        this.logDebug("Found container during start");
        this.setContainer(container);
      }
    }

    // Start with initial delay
    this.clearTimer();
    this.timer = setTimeout(() => {
      // Double-check we have container before scrolling
      if (!this.container) {
        this.logDebug("Still no container - attempting final lookup");
        const container = document.getElementById("results-scroll-container");
        if (container) {
          this.setContainer(container);
        } else {
          this.logDebug("No container found - aborting scroll");
          this.stop();
          return;
        }
      }
      this.scrollNextPage();
    }, this.config.initialDelay);
    return true;
  }

  /**
   * Scroll to the next page of results
   */
  scrollNextPage() {
    if (this.isPaused || !this.container || this.isDisabled) {
      this.logDebug(
        `Skip scrollNextPage: isPaused=${this.isPaused}, hasContainer=${!!this
          .container}, isDisabled=${this.isDisabled}`
      );
      return;
    }

    // Get all rows
    const rows = this.container.querySelectorAll(".result-row");
    if (!rows || rows.length === 0) {
      this.logDebug("No rows found, aborting scroll");
      // Set a retry timer if no rows found
      this.clearTimer();
      this.timer = setTimeout(() => {
        this.logDebug("Retrying scroll after no rows found");
        this.scrollNextPage();
      }, this.config.pageInterval);
      return;
    }

    // Calculate how many rows fit in the viewport
    const rowHeight = rows[0].offsetHeight;
    const containerHeight = this.container.clientHeight;
    const rowsPerPage = Math.max(
      1,
      Math.floor((containerHeight * 0.9) / rowHeight)
    );

    this.logDebug(
      `Scrolling next page: rowsPerPage=${rowsPerPage}, currentIndex=${this.currentRowIndex}, total=${rows.length}`
    );

    // Calculate the next row to scroll to
    const nextRowIndex = Math.min(
      this.currentRowIndex + rowsPerPage,
      rows.length - 1
    );

    // Check if we're at the bottom or will be after this scroll
    if (nextRowIndex >= rows.length - 1 || this.isAtBottom(this.container)) {
      this.handleAtBottom();
      return;
    }

    // Scroll to the next row
    this.currentRowIndex = nextRowIndex;
    this.setPhase("SCROLLING");
    this.lastScrollTime = Date.now();

    if (rows[this.currentRowIndex]) {
      // Scroll to the row
      const targetTop = rows[this.currentRowIndex].offsetTop;
      this.container.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });

      // Schedule next page scroll
      this.clearTimer();
      this.timer = setTimeout(
        () => this.scrollNextPage(),
        this.config.pageInterval
      );
    }
  }

  /**
   * Handle when scroll reaches the bottom
   */
  handleAtBottom() {
    this.setPhase("PAUSED_AT_BOTTOM");
    this.logDebug("At bottom, pausing before returning to top");

    // Apply any pending data updates while at bottom
    if (this.pendingDataUpdate) {
      this.pendingDataUpdate = false;
      this.logDebug("Applying pending data update at bottom");
    }

    // Wait before returning to top
    this.clearTimer();
    this.timer = setTimeout(() => {
      this.scrollToTop();
      this.setPhase("RETURNING_TO_TOP");

      // Wait for scroll animation to complete before restarting cycle
      setTimeout(() => {
        this.currentRowIndex = 0;
        this.setPhase("WAITING");

        if (this.isDisabled) {
          this.logDebug("Scrolling now disabled, stopping after return to top");
          this.stop();
          return;
        }

        // Schedule next page scroll
        this.clearTimer();
        this.timer = setTimeout(
          () => this.scrollNextPage(),
          this.config.pageInterval
        );
      }, 1000);
    }, this.config.bottomPauseTime);
  }

  /**
   * Scroll to top of container
   * @returns {Promise} Resolves when scrolling is complete
   */
  scrollToTop() {
    if (!this.container) return Promise.resolve(false);

    this.logDebug("Scrolling to top");

    // Set scroll position directly to ensure we don't interrupt current viewing
    this.container.scrollTop = 0;
    this.currentRowIndex = 0;

    return Promise.resolve(true);
  }

  /**
   * Scroll to a highlighted element
   * @param {HTMLElement} element Element to scroll to
   * @param {Function} checkCanAutoScroll Optional callback to check if auto-scrolling should resume
   */
  scrollToHighlight(element, checkCanAutoScroll = null) {
    if (!element || !this.container) return;

    // Stop current scroll cycle
    this.clearTimer();
    this.setPhase("HIGHLIGHT_VIEW");
    this.logDebug("Scrolling to highlight");

    // Calculate position that centers the element in the viewport
    const targetScrollTop =
      element.offsetTop -
      this.container.clientHeight / 2 +
      element.offsetHeight / 2;

    // Ensure we're within bounds
    const maxScroll = this.container.scrollHeight - this.container.clientHeight;
    const safeScrollTop = Math.max(0, Math.min(targetScrollTop, maxScroll));

    // Scroll to highlighted element
    this.container.scrollTo({
      top: safeScrollTop,
      behavior: "smooth",
    });

    // After viewing period, return to normal scrolling
    this.clearTimer();
    this.timer = setTimeout(() => {
      // Only return to top if not disabled
      if (!this.isDisabled) {
        this.scrollToTop();
        // Wait for scroll to complete
        setTimeout(() => {
          // Before restarting auto-scroll, check if it's still appropriate
          const canResumeAutoScroll = checkCanAutoScroll
            ? checkCanAutoScroll()
            : true;

          if (this.isDisabled || !canResumeAutoScroll) {
            this.setPhase("IDLE");
            this.logDebug(
              "Not resuming auto-scroll: disabled or callback prevented"
            );
          } else {
            this.setPhase("WAITING");
            // Restart normal scroll cycle
            this.clearTimer();
            this.timer = setTimeout(
              () => this.scrollNextPage(),
              this.config.pageInterval
            );
          }
        }, 1000);
      } else {
        this.setPhase("IDLE");
      }
    }, this.config.highlightViewTime);
  }

  /**
   * Temporarily pause scrolling
   */
  pause() {
    this.isPaused = true;
    this.logDebug("Scrolling paused");
  }

  /**
   * Resume paused scrolling
   */
  resume() {
    if (!this.isPaused) return;

    this.isPaused = false;
    this.logDebug("Scrolling resumed");

    // If we've been paused for a while, restart the cycle
    const timeSinceLastScroll = Date.now() - this.lastScrollTime;
    if (
      timeSinceLastScroll > this.config.pageInterval * 1.5 &&
      this.phase !== "IDLE" &&
      this.phase !== "HIGHLIGHT_VIEW"
    ) {
      this.logDebug("Long pause detected, restarting scroll cycle");
      this.stop();
      this.start();
    }
  }

  /**
   * Completely stop scrolling and reset state
   */
  stop() {
    this.clearTimer();
    this.setPhase("IDLE");
    this.currentRowIndex = 0;
    this.isPaused = false;
    this.logDebug("Scrolling stopped");
  }

  /**
   * Enable scrolling functionality
   */
  enable() {
    if (this.isDisabled) {
      this.isDisabled = false;
      this.logDebug("Scrolling enabled");
    }
  }

  /**
   * Disable scrolling functionality
   * @param {boolean} goToTop Whether to scroll to top when disabling
   */
  disable(goToTop = true) {
    this.isDisabled = true;
    this.logDebug("Scrolling disabled");

    // Stop any active scrolling
    this.stop();

    // Optionally go to top
    if (goToTop && this.container) {
      this.scrollToTop();
    }
  }

  /**
   * Set the current scroll phase and notify listeners
   * @param {string} newPhase New phase name
   */
  setPhase(newPhase) {
    const oldPhase = this.phase;
    this.phase = newPhase;

    // Notify phase change if callback provided
    if (
      this.config.onPhaseChange &&
      typeof this.config.onPhaseChange === "function"
    ) {
      this.config.onPhaseChange(newPhase, oldPhase);
    }

    this.logDebug(`Phase changed: ${oldPhase} -> ${newPhase}`);
  }

  /**
   * Notify manager of data update
   * @returns {boolean} Whether it's safe to update data immediately
   */
  handleDataUpdate() {
    // If we're in the middle of scrolling, mark as pending
    if (this.phase === "SCROLLING") {
      this.pendingDataUpdate = true;
      this.logDebug(
        "Data update detected during scrolling - marking as pending"
      );
      return false; // Data update should be buffered
    }

    // During highlight view, also buffer updates
    if (this.phase === "HIGHLIGHT_VIEW") {
      this.pendingDataUpdate = true;
      this.logDebug(
        "Data update detected during highlight view - marking as pending"
      );
      return false;
    }

    this.logDebug(`Safe to update data immediately (phase: ${this.phase})`);
    return true; // OK to update data immediately
  }

  /**
   * Update scroll manager configuration
   * @param {Object} newOptions New configuration options
   */
  updateConfig(newOptions) {
    this.config = {
      ...this.config,
      ...newOptions,
    };
    this.logDebug("Configuration updated", this.config);
  }

  /**
   * Clear any active timer
   */
  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * Log debug messages if debug mode enabled
   * @param {string} message Debug message
   * @param {any} data Optional data to log
   */
  logDebug(message, data) {
    if (this.debug) {
      if (data) {
        console.log(`[ScrollManager] ${message}`, data);
      } else {
        console.log(`[ScrollManager] ${message}`);
      }
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.clearTimer();
    this.container = null;
  }

  /************************************************************
   * UTILITY FUNCTIONS
   ************************************************************/

  /**
   * Checks if a scroll container is at the bottom
   * @param {string|HTMLElement} container - Container ID or element
   * @param {number} threshold - Pixels threshold to consider as bottom (default: 20)
   * @returns {boolean} True if at the bottom
   */
  isAtBottom(container, threshold = 20) {
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
   * Find the index of the first visible row
   * @param {HTMLElement} container - The container element
   * @param {NodeList} rows - The list of rows
   * @returns {number} The index of the first visible row
   */
  findFirstVisibleRowIndex(container, rows) {
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
   * Scrolls to a specific item in the results list
   * @param {string|HTMLElement} container - The scrollable container
   * @param {string} itemSelector - CSS selector for the target item
   * @param {object} options - Scroll options
   */
  scrollToItem(container, itemSelector, options = {}) {
    const {
      behavior = "smooth",
      block = "start",
      afterScroll = null,
    } = options;

    const containerElement =
      typeof container === "string"
        ? document.getElementById(container)
        : container;

    if (!containerElement) return;

    const item = containerElement.querySelector(itemSelector);
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
}

/**
 * Get scroll settings based on layout type
 * @param {string} displayType Layout type ('horizontal', 'vertical', 'ledwall')
 * @returns {Object} Scroll settings
 */
export function getScrollSettingsForLayout(displayType) {
  // Base settings
  const settings = {
    initialDelay: 3000, // Wait 3 seconds before starting auto-scroll
    pageInterval: 8000, // Default: Scroll one page every 8 seconds
    bottomPauseTime: 2000, // Pause at the bottom for 2 seconds
    highlightViewTime: 5000, // Time to view highlighted item
  };

  // Layout-specific overrides
  if (displayType === "vertical") {
    // Vertical layout: stay longer on each page, more time at bottom
    settings.pageInterval = 12000; // 12 seconds per page
    settings.bottomPauseTime = 8000; // 8 seconds at bottom
  } else if (displayType === "ledwall") {
    // LED Wall: quicker scrolling
    settings.pageInterval = 3000; // 3 seconds per page
    settings.bottomPauseTime = 1500; // 1.5 seconds at bottom
  } else if (displayType === "horizontal") {
    // Horizontal: default settings
    settings.pageInterval = 8000; // 8 seconds per page
    settings.bottomPauseTime = 2000; // 2 seconds at bottom
  }

  return settings;
}

/**
 * Check if a container is scrolled to the bottom
 * @param {string|HTMLElement} container The container to check
 * @param {number} threshold Pixels threshold to consider as bottom
 * @returns {boolean} True if at bottom
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

export default ResultsScrollManager;
