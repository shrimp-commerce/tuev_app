import Link from "next/link";

import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { Button } from "../components/ui/button";
import { LatestWorkLog } from "./_components/workLog";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Time Tracking app
          </h1>
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <Button asChild>
                <Link
                  href={session ? "/api/auth/signout" : "/api/auth/signin"}
                  className="rounded-full px-10 py-3 font-semibold no-underline transition"
                >
                  {session ? "Sign out" : "Sign in"}
                </Link>
              </Button>
            </div>
          </div>
          {session?.user && <LatestWorkLog />}
        </div>
      </main>
    </HydrateClient>
  );
}
