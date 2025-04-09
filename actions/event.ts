"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { EventSchema } from "@/schemas/event";
import { Prisma } from "@prisma/client";

export async function createEvent(values: z.infer<typeof EventSchema> & { images?: Array<{ url: string, caption?: string, isPrimary: boolean, position: number }> }) {
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
    // Create the event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        time,
        location,
        image, // Keep the primary image in the main event record
        category,
        capacity,
        createdBy: session.user.id,
      },
    });

    // If there are additional images, create them
    if (values.images && values.images.length > 0) {
      await prisma.eventImage.createMany({
        data: values.images.map(img => ({
          eventId: event.id,
          url: img.url,
          caption: img.caption,
          isPrimary: img.isPrimary,
          position: img.position
        }))
      });
    }

    revalidatePath("/events");
    return { success: "Event created successfully!" };
  } catch (error) {
    console.error("Create event error:", error);
    return { error: "Failed to create event." };
  }
}

export async function updateEvent(
  id: string,
  values: z.infer<typeof EventSchema> & { images?: Array<{ id?: string, url: string, caption?: string, isPrimary: boolean, position: number }> }
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
    // Update the main event record
    await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        date: new Date(date),
        time,
        location,
        image, // Keep the primary image in the main event record
        category,
        capacity,
      },
    });

    // Handle the event images (if provided)
    if (values.images) {
      // First, delete existing images for this event
      await prisma.eventImage.deleteMany({
        where: { eventId: id }
      });

      // Then create the new/updated images
      if (values.images.length > 0) {
        await prisma.eventImage.createMany({
          data: values.images.map(img => ({
            eventId: id,
            url: img.url,
            caption: img.caption,
            isPrimary: img.isPrimary,
            position: img.position
          }))
        });
      }
    }

    revalidatePath(`/events/${id}`);
    revalidatePath("/events");
    return { success: "Event updated successfully!" };
  } catch (error) {
    console.error("Update event error:", error);
    return { error: "Failed to update event." };
  }
}

export async function deleteEvent(id: string) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    // The associated EventImage records will be deleted automatically
    // due to the onDelete: Cascade relation in the schema
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
        images: {
          orderBy: {
            position: 'asc',
          },
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