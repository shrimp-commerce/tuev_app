import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // TODO: Implement locale detection
  const locale = "de";

  return {
    locale,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
