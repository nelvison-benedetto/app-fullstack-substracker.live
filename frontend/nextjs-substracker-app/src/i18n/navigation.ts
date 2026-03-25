import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Link, redirect, usePathname, useRouter locale-aware
// Usali ovunque al posto di next/navigation
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
