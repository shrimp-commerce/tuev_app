import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function AdminPanel() {
  const session = await auth();
  if (!session?.user?.id) {
    const { redirect } = await import("next/navigation");
    redirect("/");
  }
  const { db } = await import("~/server/db");
  const user = await db.user.findUnique({
    where: { id: session?.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    const { redirect } = await import("next/navigation");
    redirect("/");
  }
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col">
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Admin Panel
          </h1>
        </div>
      </main>
    </HydrateClient>
  );
}
