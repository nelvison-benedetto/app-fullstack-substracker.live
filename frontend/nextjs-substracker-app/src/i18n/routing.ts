import { defineRouting } from "next-intl/routing";  // x per creare una config tipizzata e consistente per routing/navigation (createNavigation)/middleware/server config

export const routing = defineRouting({  //crei obj centrale di configurazione: sara usato da createNavigation/getRequestConfig/middleware
  locales: ["it", "en"],  //supportated languages
  defaultLocale: "it",  //main language
  localePrefix: "as-needed",  //italiano senza prefisso, inglese con /en/
});

export type Locale = (typeof routing.locales)[number];  //ts, prende routing.locales = ["it", "en"] e crea type type Locale = "it" | "en";. ora puoi fare e.g. function setLocale(locale: Locale) {} e ts ti protegge da errori di battitura
