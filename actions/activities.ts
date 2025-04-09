// actions/activities.ts
"use server";

import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";

type ActivityData = {
  action: string;
  targetType: string;
  targetId?: string;
  targetName: string;
  link?: string;
};

export async function createActivity(data: ActivityData) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    // Validate required fields
    if (!data.action || !data.targetType || !data.targetName) {
      throw new Error("Missing required activity data fields");
    }

    // Create the activity with explicit typing for each field
    const activity = await prisma.activity.create({
      data: {
        userId: session.user.id,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId || null,
        targetName: data.targetName,
        link: data.link || null,
      },
    });

    console.log("Activity created successfully:", activity.id);
    return { success: true, activityId: activity.id };
  } catch (error) {
    console.error("Failed to create activity record:", error);
    // Return a more specific error message for debugging
    const errorMessage =
      error instanceof Error
        ? `Failed to record activity: ${error.message}`
        : "Failed to record activity";

    throw new Error(errorMessage);
  }
}

export async function getRecentActivities(limit = 10) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    const activities = await prisma.activity.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    // Transform activities into the format expected by the UI
    return activities.map((activity) => {
      // Calculate relative time
      const now = new Date();
      const activityDate = new Date(activity.createdAt);
      const diffInSeconds = Math.floor(
        (now.getTime() - activityDate.getTime()) / 1000
      );

      let relativeTime;
      if (diffInSeconds < 60) {
        relativeTime = "Just now";
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        relativeTime = `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        relativeTime = `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
      } else if (diffInSeconds < 172800) {
        relativeTime = "Yesterday";
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        relativeTime = `${days} ${days === 1 ? "day" : "days"} ago`;
      } else if (diffInSeconds < 2419200) {
        const weeks = Math.floor(diffInSeconds / 604800);
        relativeTime = `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
      } else {
        relativeTime = activityDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }

      return {
        id: activity.id,
        action: activity.action,
        target: activity.targetName,
        time: relativeTime,
        link: activity.link || "#",
      };
    });
  } catch (error) {
    console.error("Failed to fetch recent activities:", error);
    throw new Error("Failed to fetch recent activities");
  }
}

export async function getAllActivities(page = 1, limit = 20) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const skip = (page - 1) * limit;

  try {
    const activities = await prisma.activity.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const total = await prisma.activity.count({
      where: {
        userId: session.user.id,
      },
    });

    // Format the activities
    const formattedActivities = activities.map((activity) => {
      return {
        id: activity.id,
        action: activity.action,
        target: activity.targetName,
        targetType: activity.targetType,
        time: activity.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        date: activity.createdAt,
        link: activity.link || "#",
      };
    });

    return {
      activities: formattedActivities,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
      },
    };
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    throw new Error("Failed to fetch activities");
  }
}

export async function deleteActivity(activityId: string) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    // Ensure the activity belongs to the user
    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId,
      },
    });

    if (!activity || activity.userId !== session.user.id) {
      throw new Error("Activity not found or unauthorized");
    }

    await prisma.activity.delete({
      where: {
        id: activityId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete activity:", error);
    throw new Error("Failed to delete activity");
  }
}

export async function clearAllActivities() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.activity.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to clear activities:", error);
    throw new Error("Failed to clear activities");
  }
}
