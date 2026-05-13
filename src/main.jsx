import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import './index.css';

// Change this version number every time you deploy
const APP_VERSION = "1.0.1";

if (localStorage.getItem("app_version") !== APP_VERSION) {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("app_version", APP_VERSION);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
