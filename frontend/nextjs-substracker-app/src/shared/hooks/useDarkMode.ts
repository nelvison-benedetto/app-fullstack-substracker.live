'use client'

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export type Theme = 'light' | 'dark';

export const useDarkMode = (defaultTheme: Theme = 'dark') => {
  // Lazy initializer: reads saved cookie on first client render, avoiding theme flash
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
