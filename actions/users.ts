// actions/users.ts
"use server";

import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createActivity } from "./activities";
import bcrypt from "bcryptjs";

export async function getCurrentAdmin() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        preferences: true, // Include preferences to access phone and notifications
        location: true,
        createdAt: true,
        sessions: {
          orderBy: {
            expires: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    if (!admin) {
      throw new Error("Admin not found");
    }

    // Calculate total attendees across all created events
    const eventsWithAttendees = await prisma.event.findMany({
      where: {
        createdBy: admin.id,
      },
      select: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    const totalAttendees = eventsWithAttendees.reduce(
      (sum, event) => sum + event._count.registrations,
      0
    );

    // Format the creation date
    const joinDate = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(admin.createdAt);

    // Get the last login time from sessions
    let lastLogin = "Never";
    if (admin.sessions.length > 0) {
      const lastSession = admin.sessions[0];
      const now = new Date();
      const sessionDate = new Date(lastSession.expires);
      sessionDate.setHours(sessionDate.getHours() - 2); // Approximate login time (2 hours before expiry)

      // Format the last login time
      if (sessionDate.toDateString() === now.toDateString()) {
        lastLogin = `Today at ${sessionDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}`;
      } else if (
        new Date(now.getTime() - 86400000).toDateString() ===
        sessionDate.toDateString()
      ) {
        lastLogin = `Yesterday at ${sessionDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}`;
      } else {
        lastLogin = sessionDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    }

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.preferences?.phone || "", // Get phone from preferences
      role: admin.role,
      joinDate,
      avatar: `/api/avatar/${admin.id}?fallback=true`, // Add fallback parameter
      eventsCreated: admin._count.events,
      totalAttendees,
      lastLogin,
      preferences: admin.preferences, // Include the full preferences object
    };
  } catch (error) {
    console.error("Failed to fetch admin data:", error);
    throw new Error("Failed to fetch admin profile");
  }
}

export async function updateAdminProfile(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const skipActivityLog = formData.get("skipActivityLog") === "true";

    // Get notification preferences from the form
    const emailNotifications = formData.get("emailNotifications") === "true";
    const smsNotifications = formData.get("smsNotifications") === "true";

    // Validate inputs
    if (!name || !email) {
      throw new Error("Name and email are required");
    }

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        throw new Error("Email is already taken");
      }
    }

    // Get current user preferences
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    });

    // Update user data first
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        preferences: {
          ...((user?.preferences as object) || {}),
          phone, // Store phone in preferences
          notifications: {
            email: emailNotifications,
            sms: smsNotifications,
            // Save specific notification types
            newRegistrations: emailNotifications,
            eventUpdates: emailNotifications,
            importantAlerts: smsNotifications,
            reminders: smsNotifications,
          },
        },
        updatedAt: new Date(),
      },
    });

   // Create an activity record for this action if not skipped
if (!skipActivityLog) {
  try {
    const activityResult = await createActivity({
      action: "Updated profile", // Use consistent uppercase format like other actions
      targetType: "USER",
      targetId: null,
      targetName: name, // Use the updated name value
      link: "/admin/profile",
    });

    console.log("Activity creation result:", activityResult);
  } catch (activityError) {
    console.error("Failed to record profile update activity:", activityError);
  }
}

    revalidatePath("/admin/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to update admin profile:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update profile"
    );
  }
}

export async function updateNotificationPreferences(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    // Extract the notification preferences from the form
    const emailNotifications = formData.get("emailNotifications") === "true";
    const smsNotifications = formData.get("smsNotifications") === "true";
    const skipActivityLog = formData.get("skipActivityLog") === "true";

    // Get current preferences
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    });

    // Update notification preferences
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferences: {
          ...((user?.preferences as object) || {}),
          notifications: {
            email: emailNotifications,
            sms: smsNotifications,
            // Save specific notification types
            newRegistrations: emailNotifications,
            eventUpdates: emailNotifications,
            importantAlerts: smsNotifications,
            reminders: smsNotifications,
          },
        },
        updatedAt: new Date(),
      },
    });

    // Create an activity record for this action if not skipped
    if (!skipActivityLog) {
      try {
        const activityResult = await createActivity({
          action: "Updated notification preferences",
          targetType: "USER",
          targetId: null,
          targetName: "Notification Settings",
          link: "/admin/profile",
        });

        console.log("Activity created:", activityResult);
      } catch (activityError) {
        console.error(
          "Failed to record notification update activity:",
          activityError
        );
        // Continue execution even if activity recording fails
      }
    }

    revalidatePath("/admin/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to update notification preferences:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to update notification preferences"
    );
  }
}

export async function updateAdminPassword(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

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

    // Create an activity record for this action
    try {
      await createActivity({
        action: "Changed password",
        targetType: "SECURITY",
        targetId: null,
        targetName: "Password",
        link: "/admin/profile",
      });
    } catch (activityError) {
      console.error(
        "Failed to record password change activity:",
        activityError
      );
      // Continue execution even if activity recording fails
    }

    revalidatePath("/admin/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to update password:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update password"
    );
  }
}

export async function updateTwoFactorAuth(enabled: boolean) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    // Get current preferences
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    });

    // Update 2FA preferences
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferences: {
          ...((user?.preferences as object) || {}),
          security: {
            twoFactorEnabled: enabled,
          },
        },
      },
    });

    // Create an activity record for this action
    try {
      await createActivity({
        action: enabled
          ? "Enabled two-factor authentication"
          : "Disabled two-factor authentication",
        targetType: "SECURITY",
        targetId: null,
        targetName: "Two-Factor Authentication",
        link: "/admin/profile",
      });
    } catch (activityError) {
      console.error("Failed to record 2FA change activity:", activityError);
      // Continue execution even if activity recording fails
    }

    revalidatePath("/admin/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to update 2FA settings:", error);
    throw new Error("Failed to update two-factor authentication settings");
  }
}
