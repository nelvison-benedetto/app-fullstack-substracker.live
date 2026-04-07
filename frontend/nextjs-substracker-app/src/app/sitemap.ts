import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://substracker.live";

//X GOOGLE INDEXING x my website ok fra le ricerche google
//genera automaticamente /sitemap.xml con tutte le pagine pubbliche in EN e IT, con hreflang alternates per il multilingual.
/*
  0. (gia fatto probabilmente): https://search.google.com/search-console e verifica la ownership del tuo sito.
  1. Aggiungi la variabile d'ambiente nel tuo hosting (Vercel/server):
  NEXT_PUBLIC_SITE_URL=https://substracker.live

  2. Fai deploy — dopo il deploy verifica che esistano routes:
  - https://substracker.live/sitemap.xml
  - https://substracker.live/robots.txt

  3. Sottometti la sitemap su Google Search Console:
  - Vai su Search Console → Sitemaps (menu sinistro)
  - Inserisci: sitemap.xml
  - Clicca "Submit"

  4. Cloudflare — nessuna configurazione aggiuntiva necessaria. Assicurati solo che il tuo dominio non abbia regole Page Rules o Workers che blocchino /sitemap.xml o
   /robots.txt.

  Nota: Google impiega di solito da pochi giorni a qualche settimana per indicizzare le pagine dopo che hai inviato la sitemap. Puoi anche usare il tool "URL
  Inspection" in Search Console per richiedere l'indicizzazione manuale delle pagine chiave.
*/


// Public pages accessible without authentication, in both supported locales.
// "as-needed" prefix strategy: English has no prefix, Italian uses /it/
const publicRoutes = ["/", "/login", "/register"];
const locales = ["en", "it"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of publicRoutes) {
    for (const locale of locales) {
      const localizedPath =
        locale === "en"
          ? route                              // e.g. /login
          : route === "/"
            ? "/it"                            // /it (not /it/)
            : `/it${route}`;                   // e.g. /it/login

      entries.push({
        url: `${BASE_URL}${localizedPath}`,
        lastModified: new Date(),
        changeFrequency: route === "/" ? "weekly" : "monthly",
        priority: route === "/" ? 1.0 : 0.8,
        alternates: {
          languages: {
            en: `${BASE_URL}${route === "/" ? "" : route}`,
            it: `${BASE_URL}${route === "/" ? "/it" : `/it${route}`}`,
          },
        },
      });
    }
  }

  return entries;
}
