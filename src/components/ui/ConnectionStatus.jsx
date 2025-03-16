// ConnectionStatus.jsx
// Displays WebSocket connection status and allows toggling config panel

import React from "react";
import { useWebSocket } from "../core/WebSocketClient";

function ConnectionStatus({ onClick }) {
  const { connected, connectionError, lastMessageTime } = useWebSocket();

  // Format the time since last message
  const getTimeSinceLastMessage = () => {
    if (!lastMessageTime) return "No messages received";

    const now = new Date();
    const diff = Math.floor((now - lastMessageTime) / 1000);

    if (diff < 60) {
      return `${diff}s ago`;
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)}m ago`;
    } else {
      return `${Math.floor(diff / 3600)}h ago`;
    }
  };

  return (
    <div
      className={`connection-status ${
        connected ? "connected" : "disconnected"
      }`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
      title="Click to open configuration panel"
    >
      <div className="indicator"></div>
      <div className="status-text">
        {connected ? "Connected" : "Disconnected"}
        {connectionError && `: ${connectionError}`}
        {lastMessageTime && ` - Last message: ${getTimeSinceLastMessage()}`}
      </div>
    </div>
  );
}

export default ConnectionStatus;
