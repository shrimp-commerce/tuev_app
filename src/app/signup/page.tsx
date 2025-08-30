"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";

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
      className="mx-auto max-w-md rounded bg-white p-6 shadow"
    >
      <h2 className="mb-4 text-2xl font-bold">{t("title")}</h2>
      {error && <div className="mb-2 text-red-600">{t(error)}</div>}
      {success && <div className="mb-2 text-green-600">{t(success)}</div>}
      <div className="mb-4">
        <label className="mb-1 block font-medium">{t("name")}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 block font-medium">{t("email")}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 block font-medium">{t("role")}</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded border px-3 py-2"
        >
          <option value="USER">{t("user")}</option>
          <option value="ADMIN">{t("admin")}</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="mb-1 block font-medium">{t("signupPassword")}</label>
        <input
          type="password"
          value={signupPassword}
          onChange={(e) => setSignupPassword(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
      </div>
      <div className="mb-6">
        <label className="mb-1 block font-medium">{t("password")}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full rounded bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? t("signingUp") : t("signUp")}
      </button>
    </form>
  );
}
