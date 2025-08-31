import { getTranslations } from "next-intl/server";

import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { LatestWorkLog } from "./_components/workLog";

export default async function Home() {
  const session = await auth();
  const t = await getTranslations("HomePage");

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col">
        <div className="container flex flex-col gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            {t("mainHeading")}
          </h1>

          {session?.user && <LatestWorkLog />}
        </div>
      </main>
    </HydrateClient>
  );
}
