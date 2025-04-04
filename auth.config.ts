// auth.config.ts
import type { NextAuthConfig } from "next-auth";
import { getUserById } from "@/data/user";
import { prisma } from "@/lib/prisma";

export default {
    providers: [],
    callbacks: {
        async session({ token, session }) {
          if (token.sub && session.user) {
            session.user.id = token.sub;
          }
    
          if (token.role && session.user) {
            session.user.role = token.role as "USER" | "ADMIN";
          }
    
          return session;
        },
        async jwt({ token }) {
          if (!token.sub) return token;
    
          const user = await getUserById(token.sub);
    
          if (!user) return token;
    
          token.role = user.role;
    
          return token;
        }
      },
      events: {
        async linkAccount({ user }) {
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              // Update email verification if using OAuth
              // emailVerified: new Date() 
            }
          });
        }
      }
  
} satisfies NextAuthConfig;