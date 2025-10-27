"use client";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";

export default function Header() {
  const { data: session, status } = useSession();
  const t = useTranslations("Header");
  const isLoading = status === "loading";

  const pathname = usePathname();

  return (
    <header
      className={`flex w-full items-center justify-between border-b border-gray-200 px-6 py-4 shadow relative${isLoading ? "animate-pulse" : ""}`}
      style={isLoading ? { pointerEvents: "none", opacity: 0.6 } : {}}
    >
      <div className="flex flex-row items-center gap-2 text-lg font-semibold">
        {session?.user?.name && (
          <>
            <Avatar>
              <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            {session?.user?.name}
          </>
        )}
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
