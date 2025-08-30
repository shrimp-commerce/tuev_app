import "~/styles/globals.css";

import { type Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { Geist } from "next/font/google";

import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "time tracking",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

import React from "react";
import Header from "./Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <SessionProvider>
            <NextIntlClientProvider>
              <Header />
              <React.Suspense fallback={<div>Loading...</div>}>
                {children}
              </React.Suspense>
            </NextIntlClientProvider>
          </SessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
