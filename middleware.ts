import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Opt-in positive matcher to prevent bots from triggering Edge Requests on random paths (like /wp-admin)
  matcher: [
    // 1. Root path (for redirection to default locale)
    "/",

    // 2. All localized paths
    "/(en|zh|fr|it|ja|es|de|ar|ru|pt)/:path*",

    // 3. Known app routes that might be accessed without a locale prefix
    "/linkbio/:path*",
    "/privacy-policy/:path*",
    "/product/:path*",
    "/search/:path*",
    "/signin/:path*",
    "/terms-of-service/:path*"
  ],
};

