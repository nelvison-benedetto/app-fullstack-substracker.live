import { createNavigation } from "next-intl/navigation";  //serve per navigare tra pagine con la lingua corretta, prende il tuo custom config e poi se code dice e.g. <Link href="/dashboard" /> allora va su /en/dashboard   oppure   /dashboard (default it)
import { routing } from "./routing";

// Link, redirect, usePathname, useRouter locale-aware
// Usali ovunque al posto di next/navigation
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);  //spacchetta ed esporta questi
