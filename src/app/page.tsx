import { getTranslations } from "next-intl/server";

import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { WorkLogs } from "./_components/workLogs";

export default async function Home() {
  const session = await auth();
  const t = await getTranslations("HomePage");

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col">
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
          <h1 className="text-4xl font-extrabold tracking-tight">
            {t("mainHeading")}
          </h1>

          {session?.user && <WorkLogs />}
        </div>
      </main>
    </HydrateClient>
  );
}
