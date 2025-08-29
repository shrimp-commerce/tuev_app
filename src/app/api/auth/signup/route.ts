// TODO: remove if we don't need signup anymore, warning: this was AI generated, don't care currently
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";

export async function POST(req: Request) {
  type SignupBody = {
    name?: unknown;
    email?: unknown;
    password?: unknown;
    role?: unknown;
    signupPassword?: unknown;
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const body: SignupBody = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role === "ADMIN" ? "ADMIN" : "USER";
  const signupPassword =
    typeof body.signupPassword === "string" ? body.signupPassword : "";
  // Import env

  if (!name || !email || !password || !signupPassword) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (signupPassword !== env.SIGNUP_PASSWORD) {
    return NextResponse.json(
      { error: "Invalid signup password" },
      { status: 403 },
    );
  }

  // Check if user already exists
  const existingUser = await db.user.findFirst({
    where: { email },
  });
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    role: user.role,
  });
}
