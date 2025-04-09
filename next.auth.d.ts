// next-auth.d.ts
import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      location?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    location?: string;
  }
}
