import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./globals.css";
import { loadUserPrefs } from "./lib/user-prefs";

if (loadUserPrefs().reduceMotionOverride === true) {
  document.documentElement.classList.add("danora-reduce-motion");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);