'use client'

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export type Theme= 'light' | 'dark';

export const useDarkMode = (defaultTheme: Theme = "dark") => {
    const [theme, setTheme] = useState<Theme>(defaultTheme);

    useEffect(()=>{
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
    }, [theme]);

    const setAndSaveTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        Cookies.set("theme", newTheme, {expires: 365, path:"/"});
    };

    const toggleTheme = () => {
        setAndSaveTheme(theme === "dark" ? "light" : "dark");
    };

    return {theme, toggleTheme};

};

