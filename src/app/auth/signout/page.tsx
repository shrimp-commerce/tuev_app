"use client";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "../../../components/ui/button";

export default function SignOutPage() {
  const t = useTranslations("SignOut");
  useEffect(() => {
    void signOut({ redirect: false });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <h1 className="mb-4 text-2xl font-bold">{t("title")}</h1>
      <p className="mb-6">{t("signedOutMessage")}</p>
      <Button asChild>
        <a href="/auth/signin">{t("signInAgain")}</a>
      </Button>
    </div>
  );
}
