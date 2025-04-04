import { auth } from "@/app/auth";
import { redirect } from "next/navigation";

export const getUserSession = async () => {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }
  
  return session;
};

export const requireAuth = async () => {
  const session = await getUserSession();
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  return session;
};

export const requireAdmin = async () => {
  const session = await requireAuth();
  
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
  
  return session;
};