// main.jsx
// Entry point for the scoreboard application

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/main.css";
import "./styles/layout.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
