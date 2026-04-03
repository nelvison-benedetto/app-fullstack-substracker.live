//this file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
//the config you add here will be used whenever one of the edge features is loaded.
//note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
//https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({  //iniatilize Sentry x EDGE FEATS of nextjs: middleware, edge routes, runtime serverless edge and so on
  //EDGE FEATS: code that runs nearly the user, on CDN, not on classic server Node

  dsn: "https://51985865da72130e3b07d8d7a3e80871@o4511129183125504.ingest.de.sentry.io/4511129349062736",
  //DSN(Data Source Name) is indirizzo + chiave segreta del tuo progetto Sentry, so sentry send the errors to this project.

  //define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  //1 = 100% of reqs tracked, 0.2 = 20% of reqs tracked, and so on. MAYBE IS TOO HIGH FOR PRODUCTION (IN PRODUCTION CAN BE 0.2 X DONT' WASTE RESOURCE / Sentry free plan), but for testing is good to see all the errors.

  //enable logs to be sent to Sentry
  enableLogs: true,

  //enable sending user PII (Personally Identifiable Information) to Sentry. This includes information like IP addresses, email addresses, and other data that can be used to identify an individual. !in future puoi mettere qualcosa come cookie policy x raccogliere metadati, but now ok.
  //https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

});
