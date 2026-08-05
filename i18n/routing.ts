import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh", "fr", "it", "ja", "es", "de", "ar", "ru", "pt"],
  defaultLocale: "en",
});
