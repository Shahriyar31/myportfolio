import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

// index.html sets data-theme before first paint; start from that to avoid a flash.
const initialDark = () => document.documentElement.dataset.theme !== "light";

export function ThemeProvider({ children }) {
    const [dark, setDark] = useState(initialDark);
    useEffect(() => {
        const theme = dark ? "dark" : "light";
        document.documentElement.dataset.theme = theme;
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0b0c0e" : "#ecebe6");
        try { localStorage.setItem("fs-theme", theme); } catch { /* storage blocked */ }
    }, [dark]);
    return <ThemeContext.Provider value={{ dark, setDark }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
