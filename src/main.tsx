import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./theme.css";
import { ThemeProvider } from "./theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
