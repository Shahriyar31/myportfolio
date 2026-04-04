import { createContext, useContext, useState } from "react";
import { DARK, LIGHT } from "../data/constants";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [dark, setDark] = useState(true);
    const T = dark ? DARK : LIGHT;
    return (
        <ThemeContext.Provider value={{ T, dark, setDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
