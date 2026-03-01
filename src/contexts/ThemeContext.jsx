import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
    theme: 'default',
    setTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
    // mock available themes: 'default', 'dark', 'ocean', 'matcha'
    const [theme, setTheme] = useState('default');
    
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
