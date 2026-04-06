import * as Sentry from "@sentry/nextjs";
export const dynamic = "force-dynamic";   //tells to nextjs "Do NOT cache this route. Always execute it on every request."

class SentryExampleAPIError extends Error {     //custom error class
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

//A faulty API route to test Sentry's error monitoring
export function GET() {   //when fetch("/api/sentry-example-api"), this functions runs
  Sentry.logger.info("Sentry example API called");
  throw new SentryExampleAPIError(
    "This error is raised on the backend called by the example page.",
  );
}
