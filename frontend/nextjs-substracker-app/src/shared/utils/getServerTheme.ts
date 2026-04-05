import {cookies} from "next/headers";  //next.js server API to read cookies

export type Theme = "dark" | "light";

export async function getServerTheme(defaultTheme: Theme = 'dark'): Promise<Theme>{

    const cookieStore = await cookies();
    const themeCookie = cookieStore.get('theme')?.value;
    //reads theme from cookie 

    if (themeCookie === 'light' || themeCookie === 'dark') {
        return themeCookie;
    }
    return defaultTheme;

};