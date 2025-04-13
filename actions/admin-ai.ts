"use server";

import { prisma } from '@/lib/prisma';
import { auth } from '@/app/auth';
import { revalidatePath } from 'next/cache';

// Admin-only guard
async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access only');
  }
  return session;
}

// Dashboard statistics for AI context
export async function getDashboardStats() {
  await assertAdmin();

  const [users, events, registrations] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.registration.count(),
  ]);

  return {
    userCount: users,
    eventCount: events,
    registrationCount: registrations,
  };
}

// Latest created events
export async function getRecentEvents(limit = 5) {
  await assertAdmin();

  return prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      title: true,
      date: true,
      location: true,
      category: true,
      createdAt: true,
    },
  });
}

// Most popular events (by number of registrations)
export async function getPopularEvents(limit = 5) {
  await assertAdmin();

  return prisma.event.findMany({
    orderBy: {
      registrations: {
        _count: 'desc',
      },
    },
    take: limit,
    select: {
      id: true,
      title: true,
      category: true,
      registrations: {
        select: { id: true },
      },
    },
  });
}

// All users
export async function getAllUsers() {
  await assertAdmin();
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

// All events with creator and registration count
export async function getAllEvents() {
  await assertAdmin();
  return prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      creator: { select: { id: true, name: true } },
      _count: {
        select: { registrations: true },
      },
    },
  });
}

// Create a new event (admin override)
export async function createEvent(data: {
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  category: string;
  capacity: number;
  image?: string;
  createdBy: string;
}) {
  await assertAdmin();

  const event = await prisma.event.create({
    data: {
      ...data,
    },
  });

  revalidatePath('/events');
  return event;
}

// Delete a user (admin only)
export async function deleteUser(userId: string) {
  await assertAdmin();

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath('/admin/users');
  return { success: true };
}

// Delete an event (admin only)
export async function deleteEvent(eventId: string) {
  await assertAdmin();

  await prisma.event.delete({
    where: { id: eventId },
  });

  revalidatePath('/admin/events');
  return { success: true };
}

// Log an admin activity
export async function logAdminActivity({
  userId,
  action,
  targetType,
  targetId,
  targetName,
  link,
}: {
  userId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  targetName: string;
  link?: string;
}) {
  return prisma.activity.create({
    data: {
      userId,
      action,
      targetType,
      targetId,
      targetName,
      link,
    },
  });
}

// Get registrations for a specific user
export async function getUserRegistrations(userId: string) {
  await assertAdmin();  // Ensure the user is an admin

  // Fetch registrations for the user
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
          location: true,
        },
      },
    },
  });

  return registrations;
}


// Get all registrations with user and event details (admin-only)
// Get all registrations with user and event details
export async function getAllRegistrations() {
  await assertAdmin();  // Ensure the user is an admin

  // Fetch all registrations
  const registrations = await prisma.registration.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          date: true,
          location: true,
        },
      },
    },
  });

  return registrations;
}


