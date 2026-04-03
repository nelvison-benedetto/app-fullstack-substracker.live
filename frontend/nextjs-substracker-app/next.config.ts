import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";  //x MULTI-LANGUAGE website

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
//wrapper funct that enhances the Next.js config with next-intl plugin, which provides internationalization support for the app. The argument "./src/i18n/request.ts" specifies the path to the file that contains the logic for handling internationalization requests!
//so "./src/i18n/request.ts" contains the logic for handling internationalization requests, such as determining the user's preferred language and loading the appropriate translations.

const nextConfig: NextConfig = {  //base nextjs config
  images: {  
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.substracker.live",
        pathname: "/**",
      },
    ],
  },
  //allows Next.js tag <Image/> to load external images!
  //without this <Image src="https://cdn.substracker.live/image.png" /> will fail cause security restrictions
};

export default withSentryConfig(withNextIntl(nextConfig), {  // nextConfig -> withNextIntl() -> withSentryConfig() -> final config exported
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "nelvison-organization",  //sentry organization slug

  project: "substrackerapp-frontend",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,  //in CI (GitHub Actions, etc.) -> logs enabled, locally -> logs suppressed

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,  //uploads MORE source maps to Sentry: without you get e.g.Error: at a.min.js:1:2345 (isn't clear), with it instead you get e.g. Error: at UserService.ts:42

  //Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  //This can increase your server load as well as your hosting bill.
  //Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  //side errors will fail.
  //tunnelRoute: "/monitoring",

  webpack: {  //customizing build process
    //enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    //see the following for more information:
    //https://docs.sentry.io/product/crons/
    //https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,  //integrates with Vercel cron jobs: ok monitors scheduled jobs, ok tracks failures

    // Tree-shaking options for reducing bundle size
    treeshake: {  
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,  //removes Sentry debug logs from bundle: ok smaller built, better perfomance
    },
  },

});
