import { createContext, useContext, useLayoutEffect, useState } from "react";
import { setMode } from "../site/theme";

const ThemeContext = createContext(null);

// index.html sets data-theme before first paint; start from that to avoid a flash.
const initialDark = () => document.documentElement.dataset.theme !== "light";

export function ThemeProvider({ children }) {
    const [dark, setDark] = useState(initialDark);
    useLayoutEffect(() => {
        const theme = dark ? "dark" : "light";
        document.documentElement.dataset.theme = theme;
        setMode(theme);
        try { localStorage.setItem("fs-theme", theme); } catch { /* storage blocked */ }
    }, [dark]);
    return <ThemeContext.Provider value={{ dark, setDark }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
