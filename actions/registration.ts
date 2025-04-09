// actions/registration.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { RegistrationStatus } from "@prisma/client";

export async function createRegistration(eventId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Check if the event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: { where: { status: "REGISTERED" } } },
        },
      },
    });

    if (!event) {
      return { error: "Event not found" };
    }

    // Check if event is at capacity
    if (event._count.registrations >= event.capacity) {
      return { error: "Event is at full capacity" };
    }

    // Check if user is already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingRegistration) {
      if (existingRegistration.status === "CANCELLED") {
        // If previously cancelled, reactivate the registration
        const registration = await prisma.registration.update({
          where: {
            id: existingRegistration.id,
          },
          data: {
            status: "REGISTERED",
            // Generate new QR code data
            qrCodeData: JSON.stringify({
              registrationId: existingRegistration.id,
              userId,
              eventId,
              eventTitle: event.title,
              timestamp: new Date().toISOString(),
            }),
          },
          include: {
            event: {
              select: {
                title: true,
              },
            },
          },
        });

        revalidatePath(`/events/${eventId}`);
        revalidatePath("/dashboard/my-events");
        return { 
          success: "Registration reactivated!",
          registration
        };
      }
      
      return { error: "You are already registered for this event" };
    }

    // Generate unique registration ID
    const registrationId = crypto.randomUUID();
    
    // Generate QR code data
    const qrCodeData = JSON.stringify({
      registrationId,
      userId,
      eventId,
      eventTitle: event.title,
      timestamp: new Date().toISOString(),
    });

    // Create new registration
    const registration = await prisma.registration.create({
      data: {
        id: registrationId,
        userId,
        eventId,
        status: "REGISTERED",
        qrCodeData, // Store QR code data
      },
      include: {
        event: {
          select: {
            title: true,
          },
        },
      },
    });

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/dashboard/my-events");
    return { 
      success: "Successfully registered for the event!",
      registration
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to register for event" };
  }
}

// 3. Update getRegistrationById to include QR code data
export async function getRegistrationById(registrationId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: true,
      },
    });

    // Only allow the registration owner or admins to view it
    if (
      !registration ||
      (registration.userId !== session.user.id && session.user.role !== "ADMIN")
    ) {
      throw new Error("Registration not found or access denied");
    }

    return registration;
  } catch (error) {
    throw new Error("Failed to fetch registration");
  }
}
export async function cancelRegistration(eventId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Check if registration exists
    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (!registration) {
      return { error: "Registration not found" };
    }

    if (registration.status === "CANCELLED") {
      return { error: "Registration is already cancelled" };
    }

    // Update registration status to CANCELLED
    await prisma.registration.update({
      where: {
        id: registration.id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/dashboard/my-events");
    return { success: "Registration cancelled successfully" };
  } catch (error) {
    console.error("Cancellation error:", error);
    return { error: "Failed to cancel registration" };
  }
}

export async function markAttended(registrationId: string) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      return { error: "Registration not found" };
    }

    if (registration.status === "CANCELLED") {
      return { error: "Cannot mark a cancelled registration as attended" };
    }

    await prisma.registration.update({
      where: { id: registrationId },
      data: { status: "ATTENDED" },
    });

    revalidatePath(`/events/${registration.eventId}`);
    revalidatePath("/dashboard/events");
    return { success: "Attendance marked successfully" };
  } catch (error) {
    return { error: "Failed to mark attendance" };
  }
}

export async function getUserRegistrations(
  status?: RegistrationStatus,
  page = 1,
  limit = 10
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const skip = (page - 1) * limit;
  const userId = session.user.id;

  try {
    const where = {
      userId,
      ...(status ? { status } : {}),
    };

    const registrations = await prisma.registration.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        event: true,
      },
    });

    const total = await prisma.registration.count({ where });

    return {
      registrations,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
      },
    };
  } catch (error) {
    throw new Error("Failed to fetch registrations");
  }
}

export async function getEventRegistrations(
  eventId: string,
  status?: RegistrationStatus,
  page = 1,
  limit = 10
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const skip = (page - 1) * limit;

  try {
    const where = {
      eventId,
      ...(status ? { status } : {}),
    };

    const registrations = await prisma.registration.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const total = await prisma.registration.count({ where });

    return {
      registrations,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
      },
    };
  } catch (error) {
    throw new Error("Failed to fetch event registrations");
  }
}

export async function checkRegistrationStatus(eventId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return null; // No user logged in
  }

  const userId = session.user.id;

  try {
    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    // Return null if no registration exists
    if (!registration) {
      return null;
    }

    // Return the registration status
    return {
      isRegistered: registration.status === "REGISTERED" || registration.status === "ATTENDED",
      status: registration.status,
      id: registration.id,
    };
  } catch (error) {
    console.error("Error checking registration:", error);
    return null;
  }
}