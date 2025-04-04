// actions/admin.ts
'use server';

import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    const now = new Date();

    const [
      totalEvents,
      upcomingEvents,
      totalUsers,
      totalRegistrations,
      categoryStats,
      registrationTrend
    ] = await Promise.all([
      prisma.event.count(),
      prisma.event.count({
        where: {
          date: {
            gte: now,
          },
        },
      }),
      prisma.user.count(),
      prisma.registration.count(),
      prisma.event.groupBy({
        by: ['category'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      }),
      prisma.registration.groupBy({
        by: ['createdAt'],
        _count: {
          id: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: 30, // Last 30 days
      }),
    ]);

    return {
      totalEvents,
      upcomingEvents,
      totalUsers,
      totalRegistrations,
      categoryStats,
      registrationTrend,
    };
  } catch (error) {
    throw new Error("Failed to fetch dashboard stats");
  }
}

export async function getAllUsers(page = 1, limit = 20) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const skip = (page - 1) * limit;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        location: true,
        createdAt: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.user.count();

    return {
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
      },
    };
  } catch (error) {
    throw new Error("Failed to fetch users");
  }
}

export async function getEventWithRegistrations(eventId: string) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  } catch (error) {
    throw new Error("Failed to fetch event registrations");
  }
}

// Add this to your actions/admin.ts file

export async function getRecentEvents(limit = 5) {
    const session = await auth();
  
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }
  
    try {
      const events = await prisma.event.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          title: true,
          date: true,
          time: true,
          _count: {
            select: {
              registrations: true
            }
          }
        }
      });
  
      // Transform the data to match the expected format
      return events.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        attendees: event._count.registrations
      }));
    } catch (error) {
      throw new Error("Failed to fetch recent events");
    }
  }
  
  export async function getPopularEvents(limit = 5) {
    const session = await auth();
  
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }
  
    try {
      const events = await prisma.event.findMany({
        take: limit,
        orderBy: {
          registrations: {
            _count: 'desc'
          }
        },
        select: {
          id: true,
          title: true,
          date: true,
          time: true,
          _count: {
            select: {
              registrations: true
            }
          }
        }
      });
  
      // Transform the data to match the expected format
      return events.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        attendees: event._count.registrations
      }));
    } catch (error) {
      throw new Error("Failed to fetch popular events");
    }
  }
  
  export async function getNextEvent() {
    const session = await auth();
  
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }
  
    try {
      const now = new Date();
      
      const nextEvent = await prisma.event.findFirst({
        where: {
          date: {
            gte: now,
          },
        },
        orderBy: {
          date: 'asc',
        },
        select: {
          date: true,
        },
      });
  
      return nextEvent;
    } catch (error) {
      throw new Error("Failed to fetch next event");
    }
  }