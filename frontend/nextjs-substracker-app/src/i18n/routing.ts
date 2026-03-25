import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["it", "en"],
  defaultLocale: "it",
  localePrefix: "as-needed", // italiano senza prefisso, inglese con /en/
});

export type Locale = (typeof routing.locales)[number];
