import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthConfig = {
  callbacks: {
    async redirect({ baseUrl }: { baseUrl: string }) {
      // always redirect back to home
      return `${baseUrl}${process.env.NEXT_BASE_PATH ?? ""}`;
    },
    session: async ({
      session,
      token,
    }: {
      session: DefaultSession;
      token: { sub?: string };
    }) => {
      if (session?.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    jwt: async ({
      token,
      user,
    }: {
      token: Record<string, unknown>;
      user?: { id?: string };
      account?: unknown;
      profile?: unknown;
      trigger?: "update" | "signIn" | "signUp";
      isNewUser?: boolean;
      session?: unknown;
    }) => {
      if (user?.id) {
        token.uid = user.id;
      }
      return token;
    },
  },
  session: { strategy: "jwt" },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      credentials: {
        name: { label: "Username", placeholder: "name" },
        password: {
          label: "Password",
          placeholder: "password",
          type: "password",
        },
      },
      async authorize(credentials: Record<string, unknown> | undefined) {
        const userName =
          typeof credentials?.name === "string" ? credentials.name : undefined;
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : undefined;

        if (userName && password) {
          const dbUser = await db.user.findFirst({
            where: { name: userName },
          });

          if (
            typeof dbUser?.password === "string" &&
            typeof password === "string" &&
            (await bcrypt.compare(password, dbUser.password))
          ) {
            return {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
            };
          }
        }

        return null;
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

// getServerSession is not available in NextAuth v5
