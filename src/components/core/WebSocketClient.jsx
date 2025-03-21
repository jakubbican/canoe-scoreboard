// WebSocketClient.jsx
// A robust WebSocket implementation that maintains a persistent connection

import React, { useEffect, useState, useContext, createContext } from "react";

// Create a single WebSocket instance that persists outside of React's lifecycle
let globalWebSocket = null;
let reconnectTimer = null;
let messageListeners = [];
let connectionListeners = [];
let lastMessageTimestamp = null;

// WebSocket manager to handle connection state outside React lifecycle
const WebSocketManager = {
  // Initialize the WebSocket connection
  connect(url) {
    // Close existing socket if it exists
    this.disconnect();

    console.log(`Connecting to WebSocket server at ${url}...`);

    try {
      globalWebSocket = new WebSocket(url);

      globalWebSocket.onopen = () => {
        console.log("WebSocket connection established");
        connectionListeners.forEach((listener) => listener(true, null));
      };

      globalWebSocket.onclose = (event) => {
        console.log(
          `WebSocket connection closed: ${event.code} ${event.reason}`
        );
        connectionListeners.forEach((listener) =>
          listener(false, "Connection closed")
        );

        // Don't reconnect if the close was intentional
        if (event.code !== 1000) {
          this.scheduleReconnect(url);
        }
      };

      globalWebSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        connectionListeners.forEach((listener) =>
          listener(false, "Connection error occurred")
        );
      };

      globalWebSocket.onmessage = (event) => {
        try {
          lastMessageTimestamp = new Date();
          const message = JSON.parse(event.data);
          messageListeners.forEach((listener) => listener(message));
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      connectionListeners.forEach((listener) => listener(false, error.message));
      this.scheduleReconnect(url);
    }
  },

  // Disconnect and cleanup WebSocket
  disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (globalWebSocket && globalWebSocket.readyState < 2) {
      // Use a clean 1000 code for intentional disconnects
      globalWebSocket.close(1000, "Intentional disconnect");
    }
    globalWebSocket = null;
  },

  // Schedule a reconnection attempt
  scheduleReconnect(url) {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    reconnectTimer = setTimeout(() => {
      this.connect(url);
    }, 5000); // 5 second delay before reconnect
  },

  // Add a message listener
  addMessageListener(listener) {
    messageListeners.push(listener);
    return () => {
      messageListeners = messageListeners.filter((l) => l !== listener);
    };
  },

  // Add a connection status listener
  addConnectionListener(listener) {
    connectionListeners.push(listener);
    return () => {
      connectionListeners = connectionListeners.filter((l) => l !== listener);
    };
  },

  // Check if currently connected
  isConnected() {
    return globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN;
  },

  // Get last message timestamp
  getLastMessageTime() {
    return lastMessageTimestamp;
  },
};

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
  // Connection state
  const [connected, setConnected] = useState(WebSocketManager.isConnected());
  const [connectionError, setConnectionError] = useState(null);
  const [lastMessageTime, setLastMessageTime] = useState(
    WebSocketManager.getLastMessageTime()
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
    // Only connect if we're not already connected to the right URL
    if (!globalWebSocket || globalWebSocket.url !== serverUrl) {
      WebSocketManager.connect(serverUrl);
    }

    // Add connection status listener
    const removeConnectionListener = WebSocketManager.addConnectionListener(
      (isConnected, error) => {
        setConnected(isConnected);
        setConnectionError(error);
      }
    );

    // Add message listener
    const removeMessageListener = WebSocketManager.addMessageListener(
      (message) => {
        // Update last message time
        setLastMessageTime(WebSocketManager.getLastMessageTime());

        // Process message based on type
        const { msg, data } = message;

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
            setScheduleData(data);
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

    // Cleanup function - remove listeners but don't disconnect
    return () => {
      removeConnectionListener();
      removeMessageListener();
    };
  }, [serverUrl]);

  // Cleanup WebSocket on component unmount
  useEffect(() => {
    return () => {
      // Only disconnect if this is the last WebSocketProvider
      if (messageListeners.length <= 1) {
        WebSocketManager.disconnect();
      }
    };
  }, []);

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
