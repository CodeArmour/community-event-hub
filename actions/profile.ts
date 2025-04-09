// actions/profile.ts
"use server";

import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";


export async function getCurrentUserForProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      location: true,
      preferences: true,
      createdAt: true,
    },
  });

  if (!user) throw new Error("User not found");

  const preferences = (user.preferences as any) || {
    messagePreferences: {
      emailNotifications: false,
      smsNotifications: false,
      eventReminders: false,
      weeklyNewsletter: false,
    },
    eventCategories: [],
  };

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    location: user.location,
    createdAt: user.createdAt,
    preferences,
  };
}

export async function getAllEventCategories() {
  const categories = await prisma.event.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  return categories.map((cat) => cat.category).filter(Boolean);
}

export async function updateUserProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const location = formData.get("location") as string;
  const emailNotifications = formData.get("emailNotifications") === "true";
  const smsNotifications = formData.get("smsNotifications") === "true";
  const eventReminders = formData.get("eventReminders") === "true";
  const weeklyNewsletter = formData.get("weeklyNewsletter") === "true";

  const selectedCategories = formData.getAll("eventCategories") as string[];

  if (!name) throw new Error("Name is required");

  // Get current preferences
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferences: true },
  });

  const updatedPreferences = {
    ...((user?.preferences as object) || {}),
    messagePreferences: {
      emailNotifications,
      smsNotifications,
      eventReminders,
      weeklyNewsletter,
    },
    eventCategories: selectedCategories,
  };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      location,
      preferences: updatedPreferences,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function updateUserPassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const currentPassword = formData.get("current-password") as string;
    const newPassword = formData.get("new-password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error("All password fields are required");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("New passwords do not match");
    }

    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Verify the current password and hash the new one
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user || !user.password) {
      throw new Error("User not found or password not set");
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) throw new Error("Current password is incorrect");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update with the properly hashed password
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to update password:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update password"
    );
  }
}
