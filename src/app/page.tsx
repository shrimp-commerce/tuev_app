import { getTranslations } from "next-intl/server";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { Card, CardContent } from "../components/ui/card";
import { WorkLogs } from "./_components/workLogs";

export default async function Home() {
  const session = await auth();
  const t = await getTranslations("HomePage");

  return (
    <HydrateClient>
      <main className="bg-muted/50 flex min-h-screen flex-col">
        <Card className="w-full rounded-none border-none p-8 shadow-none">
          <CardContent className="flex flex-col gap-8 p-0">
            {session?.user && <WorkLogs />}
          </CardContent>
        </Card>
      </main>
    </HydrateClient>
  );
}
