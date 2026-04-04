import { getRequestConfig } from "next-intl/server";  //"Per questa request, che lingua uso e quali traduzioni carico?"
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {  //RUNS ON EVERY REQUEST!! (server side) -> next-intl chiama questa funzione per ogni richiesta per capire quale locale usare e quali messaggi caricare. requestLocale è una promise che risolve la locale rilevata da next-intl (basata su Accept-Language o cookie), ma noi useremo la nostra logica personalizzata invece di quella di default di next-intl, quindi ignoreremo questo parametro e implementeremo la nostra logica di rilevamento della locale (cookie > CF-IPCountry > Accept-Language) direttamente nel middleware (src/middleware.ts) modificando l'header della richiesta prima di passarla a next-intl.
  
  let locale = await requestLocale;

  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,  //la lingua da usare per questa richiesta (es. "en" o "it")
    messages: ( await import(`../../messages/${locale}.json`) ).default,  //i messaggi di traduzione da caricare per questa richiesta (es. i testi in inglese o italiano)  (senza .default non ottieni l'oggetto ma un modulo con una proprietà default che contiene l'oggetto, CON .default ottieni davvero il vero obj Json)
  };
});
