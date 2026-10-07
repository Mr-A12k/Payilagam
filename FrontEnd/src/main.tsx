import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import "@/styles/application.css";
import "@/styles/workspace.css";
import App from "@/App";
import AppProviders from "@/app/AppProviders";

createRoot(document.getElementById("root")!).render(
  <StrictMode><AppProviders><App /></AppProviders></StrictMode>,
);
