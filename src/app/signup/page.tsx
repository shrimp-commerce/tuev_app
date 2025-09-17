"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Alert, AlertTitle } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export default function SignupForm() {
  const t = useTranslations("SignUp");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, signupPassword }),
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await res.json();
      if (!res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        setError(data.error ?? "Sign up failed");
      } else {
        setSuccess("Sign up successful! You can now log in.");
        setName("");
        setEmail("");
        setPassword("");
        setRole("USER");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md space-y-6 rounded-lg bg-white p-8 shadow"
    >
      <h2 className="mb-4 text-center text-2xl font-bold">{t("title")}</h2>
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertTitle>{t(error)}</AlertTitle>
        </Alert>
      )}
      {success && (
        <Alert className="mb-2">
          <AlertTitle>{t(success)}</AlertTitle>
        </Alert>
      )}
      <div className="space-y-2">
        <label className="block font-medium">{t("name")}</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="block font-medium">{t("email")}</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="block font-medium">{t("role")}</label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("role")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">{t("user")}</SelectItem>
            <SelectItem value="ADMIN">{t("admin")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="block font-medium">{t("signupPassword")}</label>
        <Input
          type="password"
          value={signupPassword}
          onChange={(e) => setSignupPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="block font-medium">{t("password")}</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t("signingUp") : t("signUp")}
      </Button>
    </form>
  );
}
