/**
 * Utility functions for formatting data in the canoe-scoreboard application
 */

/**
 * Formats a competitor name, handling doubles by showing only family names
 * @param {string} name - The competitor name
 * @returns {string} Formatted name
 */
export function formatName(name) {
  if (!name) return "";

  // Handle double events (e.g., "SMITH John/JONES Mike")
  const nameArr = name.split("/");
  if (nameArr.length < 2) return name;

  // For doubles, show the family names
  const firstNameArr = nameArr[0].split(" ");
  const secondNameArr = nameArr[1].split(" ");
  return `${firstNameArr[0]}/${secondNameArr[0]}`;
}

/**
 * Formats time to start in appropriate units (seconds, minutes, hours)
 * @param {number} seconds - Time to start in seconds
 * @returns {string} Formatted time string
 */
export function formatTimeToStart(seconds) {
  const stsToMinutes = seconds / 60;

  if (stsToMinutes < 1) {
    return `${seconds} sec`;
  } else if (stsToMinutes < 60) {
    return `${Math.floor(stsToMinutes)} min`;
  } else {
    return `${Math.floor(stsToMinutes / 60)} hrs`;
  }
}

/**
 * Formats gate penalties data without rendering JSX
 * @param {string} penaltyString - Comma-separated penalties
 * @returns {Array} Array of gate penalty objects with gateNumber, penaltyClass, rawValue
 */
export function formatGatePenaltyData(penaltyString) {
  if (!penaltyString) return [];

  return penaltyString
    .split(",")
    .map((penalty, index) => {
      if (!penalty || penalty === "0") return null;

      const penaltyValue = parseInt(penalty, 10);
      const gateNumber = index + 1;
      const penaltyClass = penaltyValue >= 50 ? "penalty-50" : "penalty-2";

      return {
        gateNumber,
        penaltyClass,
        rawValue: penalty
      };
    })
    .filter(Boolean);
}
