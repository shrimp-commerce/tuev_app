import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import TodaysTasks from "../components/todaysTasks";
import { Card, CardContent } from "../components/ui/card";
import { WorkLogs } from "./_components/workLogs";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="bg-muted/50 min-h-screen w-full px-2 py-8 md:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <Card>
            <CardContent className="flex flex-col gap-8">
              {session?.user && <TodaysTasks />}
            </CardContent>
          </Card>

          {session?.user && <WorkLogs />}
        </div>
      </main>
    </HydrateClient>
  );
}
