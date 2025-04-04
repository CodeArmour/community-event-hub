// app/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "@/auth.config";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/schemas/auth";
import { getUserByEmail } from "@/data/user";
import bcrypt from "bcryptjs";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
      Credentials({
        async authorize(credentials) {
          const validatedFields = LoginSchema.safeParse(credentials);
  
          if (!validatedFields.success) return null;
  
          const { email, password } = validatedFields.data;
          
          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;
  
          const passwordsMatch = await bcrypt.compare(
            password,
            user.password
          );
  
          if (passwordsMatch) return user;
          return null;
        }
      })
    ],
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
});