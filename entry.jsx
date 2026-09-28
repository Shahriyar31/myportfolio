import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { inject } from "@vercel/analytics";
import App from "./src/App.jsx";
import { ThemeProvider } from "./src/context/ThemeContext.jsx";

inject();

// A scroll-driven story should always begin at the start
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (!location.hash) window.scrollTo(0, 0);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </StrictMode>
);
