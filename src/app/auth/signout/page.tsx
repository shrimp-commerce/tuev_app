"use client";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

export default function SignOutPage() {
  const t = useTranslations("SignOut");
  useEffect(() => {
    void signOut({ redirect: false });
  }, []);

  return (
    <div className="bg-muted/50 flex min-h-screen items-center justify-center py-8">
      <Card className="w-full max-w-md p-6 shadow">
        <CardContent className="flex flex-col items-center space-y-6">
          <h1 className="mb-2 text-center text-2xl font-bold">{t("title")}</h1>
          <p className="mb-4 text-center">{t("signedOutMessage")}</p>
          <Button asChild className="w-full max-w-xs">
            <a href="/auth/signin">{t("signInAgain")}</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
