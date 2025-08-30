"use client";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "../components/ui/button";

export default function Header() {
  const { data: session } = useSession();
  const t = useTranslations("HomePage");
  return (
    <header className="flex w-full items-center justify-between px-6 py-4 shadow">
      <div className="text-lg font-semibold">
        {session?.user
          ? t("loggedInAs", { name: session.user.name ?? "" })
          : ""}
      </div>
      <Button asChild>
        <Link
          href={session ? "/api/auth/signout" : "/api/auth/signin"}
          className="rounded-full px-10 py-3 font-semibold no-underline transition"
        >
          {session ? t("signOut") : t("signIn")}
        </Link>
      </Button>
    </header>
  );
}
