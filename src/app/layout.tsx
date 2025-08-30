import "~/styles/globals.css";

import { type Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "time tracking",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
