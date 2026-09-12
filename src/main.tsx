import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Import development configuration to suppress console errors
import "./config/dev";

createRoot(document.getElementById("root")!).render(<App />);
