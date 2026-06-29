import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import { API_BASE } from "./lib/apiBase";
import "./index.css";

// When the API is hosted on a separate origin (e.g. a second Railway
// service), point the generated API client at it. Empty => same-origin.
if (API_BASE) setBaseUrl(API_BASE);

createRoot(document.getElementById("root")!).render(<App />);
