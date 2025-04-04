'use server';

import * as z from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { signIn, signOut } from "@/app/auth";
import { getUserByEmail } from "@/data/user";
import { prisma } from "@/lib/prisma";
import { LoginSchema, RegisterSchema } from "@/schemas/auth";

export async function login(values: z.infer<typeof LoginSchema>) {
  const validatedFields = LoginSchema.safeParse(values);
  
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/my-events",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    
    throw error;
  }
}

export async function register(values: z.infer<typeof RegisterSchema>) {
  const validatedFields = RegisterSchema.safeParse(values);
  
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name, location } = validatedFields.data;
  
  const existingUser = await getUserByEmail(email);

  if (existingUser) {

    return { error: "Email already in use!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      location,
      preferences: {},
    },
  });

  // Optional: Sign in the user after registration
  return await login({ email, password });
}

export async function logout() {
  await signOut();
}