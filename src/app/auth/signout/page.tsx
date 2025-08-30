"use client";
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { Button } from "../../../components/ui/button";

export default function SignOutPage() {
  useEffect(() => {
    void signOut({ redirect: false });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <h1 className="mb-4 text-2xl font-bold">Sign Out</h1>
      <p className="mb-6">
        You have been signed out. Thank you for using the app!
      </p>
      <Button asChild>
        <a href="/auth/signin">Sign In Again</a>
      </Button>
    </div>
  );
}
