// actions/event.ts
"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { EventSchema } from "@/schemas/event";
import { Prisma } from "@prisma/client";

export async function createEvent(values: z.infer<typeof EventSchema>) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const validatedFields = EventSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const {
    title,
    description,
    date,
    time,
    location,
    image,
    category,
    capacity,
  } = validatedFields.data;

  try {
    await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        time,
        location,
        image,
        category,
        capacity,
        createdBy: session.user.id,
      },
    });

    revalidatePath("/events");
    return { success: "Event created successfully!" };
  } catch (error) {
    return { error: "Failed to create event." };
  }
}

export async function updateEvent(
  id: string,
  values: z.infer<typeof EventSchema>
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const validatedFields = EventSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const {
    title,
    description,
    date,
    time,
    location,
    image,
    category,
    capacity,
  } = validatedFields.data;

  try {
    await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        date: new Date(date),
        time,
        location,
        image,
        category,
        capacity,
      },
    });

    revalidatePath(`/events/${id}`);
    revalidatePath("/events");
    return { success: "Event updated successfully!" };
  } catch (error) {
    return { error: "Failed to update event." };
  }
}

export async function deleteEvent(id: string) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.event.delete({
      where: { id },
    });

    revalidatePath("/events");
    return { success: "Event deleted successfully!" };
  } catch (error) {
    return { error: "Failed to delete event." };
  }
}

export async function getEvents(
  query = "",
  category = "",
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;

  const where: Prisma.EventWhereInput = {
    ...(query
      ? {
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
            {
              description: {
                contains: query,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
          ],
        }
      : {}),
    ...(category ? { category } : {}),
  };

  try {
    const events = await prisma.event.findMany({
      where,
      orderBy: { date: "asc" },
      skip,
      take: limit,
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    const total = await prisma.event.count({ where });

    return {
      events: events.map((event) => ({
        ...event,
        attendees: event._count.registrations, // Add the registration count here
      })),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
      },
    };
  } catch (error) {
    throw new Error("Failed to fetch events");
  }
}

export async function getEventById(id: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            name: true,
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) return null;

    return {
      ...event,
      attendeesCount: event._count.registrations,
    };
  } catch (error) {
    throw new Error("Failed to fetch event");
  }
}
