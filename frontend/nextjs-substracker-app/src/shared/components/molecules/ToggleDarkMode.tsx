'use client'

import { useDarkMode, type Theme } from '@/shared/hooks/useDarkMode'
import Button from '@/shared/components/atoms/Button'
import {Moon, Sun} from 'lucide-react'

type ToggleDarkModeProps = { defaultMode?: Theme };

export default function ToggleDarkMode({defaultMode='dark'}: ToggleDarkModeProps){
    const {theme, toggleTheme} = useDarkMode(defaultMode);

    return (

        <div>
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === "light" && <Moon className='w-4 h-4' />}
                {theme === "dark" && <Sun className='w-4 h-4' />}
            </Button>
        </div>

    );
};