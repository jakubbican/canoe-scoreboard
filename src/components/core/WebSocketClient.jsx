// WebSocketClient.jsx
// A robust WebSocket implementation that maintains a persistent connection

import React, { useEffect, useState, useContext, createContext } from "react";

/**
 * Singleton WebSocket service that maintains connection state
 * outside of React's component lifecycle
 */
class WebSocketService {
  // Private instance variables
  #webSocket = null;
  #reconnectTimer = null;
  #messageListeners = [];
  #connectionListeners = [];
  #lastMessageTimestamp = null;
  #reconnectAttempts = 0;
  #maxReconnectDelay = 30000; // 30 seconds max delay
  #url = null;

  // Private singleton instance
  static #instance = null;

  // Private constructor
  constructor() {
    if (WebSocketService.#instance) {
      throw new Error("Use WebSocketService.getInstance() instead of new operator");
    }
  }

  // Public method to get singleton instance
  static getInstance() {
    if (!WebSocketService.#instance) {
      WebSocketService.#instance = new WebSocketService();
    }
    return WebSocketService.#instance;
  }

  // Initialize the WebSocket connection
  connect(url) {
    // Store URL for reconnection
    this.#url = url;

    // Close existing socket if it exists
    this.disconnect();

    console.log(`Connecting to WebSocket server at ${url}...`);

    try {
      this.#webSocket = new WebSocket(url);

      this.#webSocket.onopen = () => {
        console.log("WebSocket connection established");
        this.#reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        this.#connectionListeners.forEach((listener) => listener(true, null));
      };

      this.#webSocket.onclose = (event) => {
        console.log(
          `WebSocket connection closed: ${event.code} ${event.reason}`
        );
        this.#connectionListeners.forEach((listener) =>
          listener(false, "Connection closed")
        );

        // Don't reconnect if the close was intentional
        if (event.code !== 1000) {
          this.#scheduleReconnect();
        }
      };

      this.#webSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.#connectionListeners.forEach((listener) =>
          listener(false, "Connection error occurred")
        );
      };

      this.#webSocket.onmessage = (event) => {
        try {
          this.#lastMessageTimestamp = new Date();
          const message = JSON.parse(event.data);
          this.#messageListeners.forEach((listener) => listener(message));
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      this.#connectionListeners.forEach((listener) => listener(false, error.message));
      this.#scheduleReconnect();
    }
  }

  // Disconnect and cleanup WebSocket
  disconnect() {
    if (this.#reconnectTimer) {
      clearTimeout(this.#reconnectTimer);
      this.#reconnectTimer = null;
    }

    if (this.#webSocket && this.#webSocket.readyState < 2) {
      // Use a clean 1000 code for intentional disconnects
      this.#webSocket.close(1000, "Intentional disconnect");
    }
    this.#webSocket = null;
  }

  // Private method to schedule a reconnection attempt with exponential back-off
  #scheduleReconnect() {
    if (this.#reconnectTimer) {
      clearTimeout(this.#reconnectTimer);
    }

    // Calculate delay with exponential back-off
    const baseDelay = 1000; // Start with 1 second
    const delay = Math.min(
      baseDelay * Math.pow(2, this.#reconnectAttempts),
      this.#maxReconnectDelay
    );

    this.#reconnectAttempts++;

    console.log(`Scheduling reconnect attempt ${this.#reconnectAttempts} in ${delay}ms`);

    this.#reconnectTimer = setTimeout(() => {
      if (this.#url) {
        this.connect(this.#url);
      }
    }, delay);
  }

  // Add a message listener
  addMessageListener(listener) {
    this.#messageListeners.push(listener);
    return () => {
      this.#messageListeners = this.#messageListeners.filter((l) => l !== listener);
    };
  }

  // Add a connection status listener
  addConnectionListener(listener) {
    this.#connectionListeners.push(listener);
    return () => {
      this.#connectionListeners = this.#connectionListeners.filter((l) => l !== listener);
    };
  }

  // Check if currently connected
  isConnected() {
    return this.#webSocket && this.#webSocket.readyState === WebSocket.OPEN;
  }

  // Get last message timestamp
  getLastMessageTime() {
    return this.#lastMessageTimestamp;
  }

  // Get count of registered listeners
  getMessageListenersCount() {
    return this.#messageListeners.length;
  }
}

// Create context to provide WebSocket state throughout the app
const WebSocketContext = createContext({
  connected: false,
  connectionError: null,
  lastMessageTime: null,
  competitorData: {},
  topResults: { list: [] },
  top10Results: { list: [] },
  scheduleData: [],
  onCourseData: [],
  onStartData: [],
  controlState: {
    displayCurrent: false,
    displayTop: false,
    displayTop10: false,
    displayInfoText: false,
    displaySchedule: false,
    displayDayTime: false,
    displayTitle: false,
    displayTopBar: false,
    displayFooter: false,
    displayOnCourse: false,
    displayOnStart: false,
  },
  dayTimeData: { time: "" },
  infoTextData: { text: "" },
  titleData: { text: "" },
});

/**
 * WebSocket Provider Component
 * Manages connection to the timing server and handles all incoming messages
 */
export function WebSocketProvider({
  children,
  serverUrl = "ws://localhost:8081/",
}) {
  // Get the singleton instance
  const wsService = WebSocketService.getInstance();

  // Connection state
  const [connected, setConnected] = useState(wsService.isConnected());
  const [connectionError, setConnectionError] = useState(null);
  const [lastMessageTime, setLastMessageTime] = useState(
    wsService.getLastMessageTime()
  );

  // Data states for different message types
  const [competitorData, setCompetitorData] = useState({});
  const [topResults, setTopResults] = useState({ list: [] });
  const [top10Results, setTop10Results] = useState({ list: [] });
  const [scheduleData, setScheduleData] = useState([]);
  const [onCourseData, setOnCourseData] = useState([]);
  const [onStartData, setOnStartData] = useState([]);
  const [controlState, setControlState] = useState({
    displayCurrent: false,
    displayTop: false,
    displayTop10: false,
    displayInfoText: false,
    displaySchedule: false,
    displayDayTime: false,
    displayTitle: false,
    displayTopBar: false,
    displayFooter: false,
    displayOnCourse: false,
    displayOnStart: false,
  });
  const [dayTimeData, setDayTimeData] = useState({ time: "" });
  const [infoTextData, setInfoTextData] = useState({ text: "" });
  const [titleData, setTitleData] = useState({ text: "" });

  // Initialize WebSocket connection on mount or server URL change
  useEffect(() => {
    // Only connect if we're not already connected or URL changed
    if (!wsService.isConnected()) {
      wsService.connect(serverUrl);
    }

    // Add connection status listener
    const removeConnectionListener = wsService.addConnectionListener(
      (isConnected, error) => {
        setConnected(isConnected);
        setConnectionError(error);
      }
    );

    // Add message listener
    const removeMessageListener = wsService.addMessageListener(
      (message) => {
        // Update last message time
        setLastMessageTime(wsService.getLastMessageTime());

        // Process message based on type
        const { msg, data } = message;

        // Add debug logging - but cleaner without flooding console
        if (msg === "schedule") {
          console.log("Received schedule data from server:", data);
        }

        switch (msg) {
          case "comp":
            setCompetitorData(data);
            break;
          case "top":
            setTopResults(data);
            break;
          case "top10":
            setTop10Results(data);
            break;
          case "schedule":
            // Ensure we're handling the data structure correctly
            if (Array.isArray(data)) {
              setScheduleData(data);
            } else if (data && Array.isArray(data.data)) {
              // Handle case where data might be nested in a data property
              setScheduleData(data.data);
            } else {
              console.error("Schedule data is not in expected format:", data);
              setScheduleData([]);
            }
            break;
          case "oncourse":
            setOnCourseData(data);
            break;
          case "onstart":
            setOnStartData(data);
            break;
          case "control":
            setControlState({
              displayCurrent: data.displayCurrent === "1",
              displayTop: data.displayTop === "1",
              displayTop10: data.displayTop10 === "1",
              displayInfoText: data.displayInfoText === "1",
              displaySchedule: data.displaySchedule === "1",
              displayDayTime: data.displayDayTime === "1",
              displayTitle: data.displayTitle === "1",
              displayTopBar: data.displayTopBar === "1",
              displayFooter: data.displayFooter === "1",
              displayOnCourse: data.displayOnCourse === "1",
              displayOnStart: data.displayOnStart === "1",
            });
            break;
          case "daytime":
            setDayTimeData(data);
            break;
          case "infotext":
            setInfoTextData(data);
            break;
          case "title":
            setTitleData(data);
            break;
          default:
            console.warn(`Unknown message type: ${msg}`);
        }
      }
    );

    // Cleanup function - remove listeners but don't disconnect by default
    return () => {
      removeConnectionListener();
      removeMessageListener();

      // Only disconnect if this is the last WebSocketProvider using the service
      if (wsService.getMessageListenersCount() === 0) {
        wsService.disconnect();
      }
    };
  }, [serverUrl]);

  // Provide all WebSocket data and state to children
  const contextValue = {
    connected,
    connectionError,
    lastMessageTime,
    competitorData,
    topResults,
    top10Results,
    scheduleData,
    onCourseData,
    onStartData,
    controlState,
    dayTimeData,
    infoTextData,
    titleData,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Custom hook to use WebSocket data
export function useWebSocket() {
  return useContext(WebSocketContext);
}

export default WebSocketContext;
