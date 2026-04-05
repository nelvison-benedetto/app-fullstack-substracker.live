'use client'

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';  //plugin installed x read/write cookies easily

export type Theme = 'light' | 'dark';  //restricts theme values to 'light' or 'dark'

export const useDarkMode = (defaultTheme: Theme = 'dark') => {

  //Lazy initializer (runs only at the first mount): reads saved cookie on first client render, avoiding theme flash
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    return (Cookies.get('theme') as Theme) ?? defaultTheme;
  });

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const setAndSaveTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    Cookies.set('theme', newTheme, { expires: 365, path: '/' });
  };

  const toggleTheme = () => setAndSaveTheme(theme === 'dark' ? 'light' : 'dark');

  return { theme, toggleTheme };
};
