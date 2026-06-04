import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@/api-client";
import { getApiBaseUrl } from "@/lib/api";
import App from "./App";
import "./index.css";

setBaseUrl(getApiBaseUrl());

createRoot(document.getElementById("root")!).render(<App />);
