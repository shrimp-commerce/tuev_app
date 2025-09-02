"use client";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../components/ui/button";

export default function Header() {
  const { data: session } = useSession();
  const t = useTranslations("Header");

  const pathname = usePathname();

  return (
    <header className="flex w-full items-center justify-between px-6 py-4 shadow">
      <div className="text-lg font-semibold">
        {session?.user
          ? t("loggedInAs", { name: session.user.name ?? "" })
          : ""}
      </div>
      <div className="flex flex-row items-center gap-4">
        {session?.user?.isAdmin && (
          <Button asChild>
            {pathname === "/admin-panel" ? (
              <Link href="/">{t("toEmployeeView")}</Link>
            ) : (
              <Link href="/admin-panel">{t("toAdminPanel")}</Link>
            )}
          </Button>
        )}
        <Button asChild>
          <Link href={session ? "/api/auth/signout" : "/api/auth/signin"}>
            {session ? t("signOut") : t("signIn")}
          </Link>
        </Button>
      </div>
    </header>
  );
}
