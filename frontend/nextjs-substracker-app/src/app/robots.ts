import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://substracker.live";

//X GOOGLE INDEXING x my website ok fra le ricerche google
/*
genera automaticamente /robots.txt che:
  permette le pagine pubbliche
  blocca /dashboard, /profile, /api/, ecc.
  indica la sitemap a Google
*/
/*
  0. (gia fatto probabilmente): https://search.google.com/search-console e verifica la ownership del tuo sito.
  1. Aggiungi la variabile d'ambiente nel tuo hosting (Vercel/server):
  NEXT_PUBLIC_SITE_URL=https://substracker.live

  2. Fai deploy — dopo il deploy verifica che esistano:
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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/it", "/it/login", "/it/register"],
        disallow: [
          "/dashboard",
          "/profile",
          "/it/dashboard",
          "/it/profile",
          "/api/",
          "/sentry-example-page",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
