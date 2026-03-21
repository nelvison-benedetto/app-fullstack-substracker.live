'use client'

import { useDarkMode, type Theme } from '@/shared/hooks/useDarkMode'
import Button from '@/shared/components/atoms/Button'
import { Moon, Sun } from 'lucide-react'

type ToggleDarkModeProps = { defaultMode?: Theme };

export default function ToggleDarkMode({ defaultMode = 'dark' }: ToggleDarkModeProps) {
  const { theme, toggleTheme } = useDarkMode(defaultMode);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="flex items-center justify-center"
    >
      {theme === 'light'
        ? <Moon className="h-4 w-4 transition-transform duration-200" />
        : <Sun className="h-4 w-4 transition-transform duration-200" />
      }
    </Button>
  );
}
