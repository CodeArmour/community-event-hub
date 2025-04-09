// app/actions/settings.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for role update
const roleUpdateSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER", "ADMIN", "user", "admin"]).transform(val => 
    val.toUpperCase() as "USER" | "ADMIN"
  ),
});

/**
 * Get all users with their registration counts
 */
export async function getUsers() {
  try {
    const session = await auth();

    // Check if the current user is an admin
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            registrations: true,
          },
        },
        sessions: {
          orderBy: {
            expires: "desc",
          },
          take: 1,
          select: {
            expires: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match our frontend needs
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      registeredEventsCount: user._count.registrations,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.sessions[0]?.expires.toISOString() || null,
    }));
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to fetch users");
  }
}

/**
 * Get user registrations with event details
 */
export async function getUserRegistrations(userId: string) {
  try {
    const session = await auth();

    // Check if current user is admin or the user themself
    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.id !== userId)
    ) {
      throw new Error("Unauthorized access");
    }

    const registrations = await prisma.registration.findMany({
      where: {
        userId: userId,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            time: true,
            location: true,
            category: true,
          },
        },
      },
    });

    return registrations.map((reg) => ({
      id: reg.id,
      status: reg.status,
      createdAt: reg.createdAt.toISOString(),
      event: {
        id: reg.event.id,
        title: reg.event.title,
        date: reg.event.date.toISOString(),
        time: reg.event.time,
        location: reg.event.location,
        category: reg.event.category,
      },
    }));
  } catch (error) {
    console.error("Failed to fetch user registrations:", error);
    throw new Error("Failed to fetch user registrations");
  }
}

/**
 * Update user role
 */
export async function updateUserRole({
  userId,
  role,
}: {
  userId: string;
  role: string;
}) {
  try {
    const session = await auth();

    // Check if current user is an admin
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    // Check if userId and role are provided
    if (!userId || !role) {
      throw new Error("User ID and role are required");
    }

    // Parse and validate the input
    const result = roleUpdateSchema.safeParse({
      userId,
      role, // The transform will handle normalization
    });

    if (!result.success) {
      console.error("Validation error:", result.error);
      throw new Error("Invalid role value");
    }

    const { userId: validUserId, role: normalizedRole } = result.data;

    // Get user before update
    const user = await prisma.user.findUnique({
      where: { id: validUserId },
      select: { name: true, role: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Update the user's role in the database
    const updatedUser = await prisma.user.update({
      where: { id: validUserId },
      data: { role: normalizedRole },
    });

    // Log the activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_USER_ROLE",
        targetType: "USER",
        targetId: null,
        targetName: user.name,
        link: `/admin/settings`,
      },
    });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    throw new Error("Failed to update user role");
  }
}

/**
 * Safely delete a user and all related data
 */
export async function deleteUser(userId: string) {
  try {
    const session = await auth();

    // Check if current user is an admin
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    // Check if trying to delete self
    if (session.user.id === userId) {
      throw new Error("Cannot delete your own account");
    }

    // Get user details before deletion
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Due to cascade deletion set up in the schema,
    // deleting a user will automatically delete:
    // - Their accounts
    // - Their sessions
    // - Their registrations
    // - Their activities

    // We need to handle events created by the user separately
    // Option 1: Delete all events created by the user
    // await prisma.event.deleteMany({
    //   where: { createdBy: userId }
    // })

    // Option 2: Transfer events to admin (current user)
    await prisma.event.updateMany({
      where: { createdBy: userId },
      data: { createdBy: session.user.id },
    });

    // Now delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    // Log the activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        action: "DELETE_USER",
        targetType: "USER",
        targetId: null, // User no longer exists
        targetName: user.name,
        link: `/admin/settings`,
      },
    });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw new Error("Failed to delete user");
  }
}