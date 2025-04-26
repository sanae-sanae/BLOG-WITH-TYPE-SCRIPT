import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set up the global CSS variables needed for ThreeJS and animations
document.documentElement.style.setProperty('--primary', '#6D28D9');
document.documentElement.style.setProperty('--secondary', '#9333EA');
document.documentElement.style.setProperty('--accent', '#10B981');

createRoot(document.getElementById("root")!).render(<App />);
