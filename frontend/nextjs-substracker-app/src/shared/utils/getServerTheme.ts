import {cookies} from "next/headers";

export type Theme = "dark" | "light";

export async function getServerTheme(defaultTheme: Theme = 'dark'): Promise<Theme>{
    const cookieStore = await cookies();
    const themeCookie = cookieStore.get('theme')?.value;
    if (themeCookie === 'light' || themeCookie === 'dark') {
        return themeCookie;
    }
    return defaultTheme;

};