// actions/recommendation.ts
"use server";

import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";

interface Coordinates {
  latitude: number;
  longitude: number;
}

// Calculate distance between two coordinates in kilometers using Haversine formula
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.latitude - coord1.latitude) * (Math.PI / 180);
  const dLon = (coord2.longitude - coord1.longitude) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.latitude * (Math.PI / 180)) *
    Math.cos(coord2.latitude * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Convert location string to coordinates
// In a real app, you would use a geocoding API
function getCoordinatesFromLocation(location: string): Coordinates | null {
  // This would be replaced with actual geocoding
  // For now, we'll parse strings in format "City Name (lat,lng)"
  const match = location.match(/\((-?\d+\.\d+),(-?\d+\.\d+)\)$/);
  if (match) {
    return {
      latitude: parseFloat(match[1]),
      longitude: parseFloat(match[2])
    };
  }
  return null;
}

interface UserProfile {
  preferences: {
    categories?: string[];
    maxDistance?: number;
    preferredLocations?: string[];
    timePreferences?: {
      preferredDays?: string[];
      preferredTimeOfDay?: string[];
    };
  };
  pastCategories: string[];
  categoryWeights: Map<string, number>;
  userLocation: string | null;
  userCoordinates: Coordinates | null;
  timePatterns: {
    preferredDays: Map<string, number>;
    preferredHours: Map<number, number>;
  };
  socialScore: Map<string, number>; // Event popularity among user's network
  engagementLevel: number; // 0-1 indicating how active the user is
  lastActive: Date;
}

// Analyze which days and times the user prefers for events
async function analyzeUserTimePreferences(userId: string) {
  const userAttendance = await prisma.registration.findMany({
    where: { 
      userId,
      status: { in: ["REGISTERED", "ATTENDED"] }
    },
    select: {
      event: {
        select: {
          date: true,
          time: true
        }
      }
    }
  });

  const dayPreferences = new Map<string, number>();
  const hourPreferences = new Map<number, number>();
  
  // Default values for days of week
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  days.forEach(day => dayPreferences.set(day, 0));
  
  // Default values for hours (0-23)
  for (let i = 0; i < 24; i++) {
    hourPreferences.set(i, 0);
  }

  // Count occurrences of each day and hour
  userAttendance.forEach(reg => {
    const eventDate = new Date(reg.event.date);
    const day = days[eventDate.getDay()];
    dayPreferences.set(day, (dayPreferences.get(day) || 0) + 1);
    
    // Extract hour from time string (assuming format like "18:00" or "6:00 PM")
    let hour = 0;
    if (reg.event.time) {
      const timeMatch = reg.event.time.match(/(\d+):/);
      if (timeMatch) {
        hour = parseInt(timeMatch[1]);
        // Adjust for PM if needed
        if (reg.event.time.toLowerCase().includes('pm') && hour < 12) {
          hour += 12;
        }
      }
    }
    hourPreferences.set(hour, (hourPreferences.get(hour) || 0) + 1);
  });

  return {
    preferredDays: dayPreferences,
    preferredHours: hourPreferences
  };
}

// Calculate user engagement metrics
async function calculateUserEngagement(userId: string): Promise<number> {
  // Get user registration data
  const userData = await prisma.registration.findMany({
    where: { userId },
    select: {
      status: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  if (userData.length === 0) return 0.5; // Default engagement
  
  // Check attendance rate
  const totalEvents = userData.length;
  const attendedEvents = userData.filter(reg => reg.status === "ATTENDED").length;
  const attendanceRate = totalEvents > 0 ? attendedEvents / totalEvents : 0;
  
  // Check recency (when was the last activity)
  const lastActivity = userData[0]?.createdAt || new Date();
  const daysSinceLastActivity = Math.floor((new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate engagement score (0-1)
  // Higher attendance rate and recent activity = higher engagement
  const recencyFactor = Math.max(0.1, 1 - (daysSinceLastActivity / 90)); // Decay over 90 days
  const engagementScore = (attendanceRate * 0.7) + (recencyFactor * 0.3);
  
  return engagementScore;
}

// Get user's social connections and their interests
async function getUserSocialGraph(userId: string): Promise<Map<string, number>> {
  const socialEventScores = new Map<string, number>();
  
  // Find events that the user's network has attended
  // First, get events the user attended
  const userEvents = await prisma.registration.findMany({
    where: { userId },
    select: { eventId: true }
  });
  
  const userEventIds = userEvents.map(reg => reg.eventId);
  
  // Find other users who attended the same events
  const networkUsers = await prisma.registration.findMany({
    where: {
      eventId: { in: userEventIds },
      userId: { not: userId }
    },
    select: {
      userId: true
    },
    distinct: ['userId']
  });
  
  const networkUserIds = networkUsers.map(u => u.userId);
  
  // Find events that these network users have registered for
  if (networkUserIds.length > 0) {
    const networkEvents = await prisma.registration.findMany({
      where: {
        userId: { in: networkUserIds },
        event: {
          date: { gte: new Date() }
        }
      },
      select: {
        eventId: true,
        userId: true,
      }
    });
    
    // Count how many network users registered for each event
    networkEvents.forEach(reg => {
      socialEventScores.set(
        reg.eventId,
        (socialEventScores.get(reg.eventId) || 0) + 1
      );
    });
  }
  
  return socialEventScores;
}

async function buildUserProfile(userId: string): Promise<UserProfile> {
  // Get user with preferences and past events
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      preferences: true,
      location: true,
      registrations: {
        select: {
          event: {
            select: {
              id: true,
              category: true,
              location: true,
              date: true,
              time: true,
            }
          },
          status: true,
          createdAt: true,
        },
        where: {
          status: {
            in: ["REGISTERED", "ATTENDED"]
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  if (!user) {
    return {
      preferences: {},
      pastCategories: [],
      categoryWeights: new Map(),
      userLocation: null,
      userCoordinates: null,
      timePatterns: {
        preferredDays: new Map(),
        preferredHours: new Map()
      },
      socialScore: new Map(),
      engagementLevel: 0.5,
      lastActive: new Date()
    };
  }

  // Extract user preferences
  const userPreferences = user.preferences as {
    categories?: string[];
    maxDistance?: number;
    preferredLocations?: string[];
    timePreferences?: {
      preferredDays?: string[];
      preferredTimeOfDay?: string[];
    };
  } || {};

  // Calculate category weights based on recent registrations
  // More recent registrations have higher weight
  const categoryWeights = new Map<string, number>();
  const now = new Date();

  user.registrations.forEach((reg, index) => {
    const category = reg.event.category;
    const eventDate = new Date(reg.event.date);
    
    // Calculate recency factor (1.0 for recent events, decreases for older events)
    // Events in the future (upcoming) get full weight
    const isUpcoming = eventDate > now;
    const daysPassed = isUpcoming ? 0 : Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
    const recencyFactor = isUpcoming ? 1.0 : Math.max(0.1, 1.0 - (daysPassed / 365));
    
    // Calculate attendance status factor
    // ATTENDED events get higher weight than just REGISTERED
    const statusFactor = reg.status === "ATTENDED" ? 1.2 : 1.0;
    
    // Calculate weight and add to map
    const weight = recencyFactor * statusFactor;
    categoryWeights.set(
      category, 
      (categoryWeights.get(category) || 0) + weight
    );
  });

  // Sort categories by weight and take top ones
  const pastCategories = Array.from(categoryWeights.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);

  // Get user coordinates from location
  const userCoordinates = user.location ? getCoordinatesFromLocation(user.location) : null;
  
  // Get time preferences
  const timePatterns = await analyzeUserTimePreferences(userId);
  
  // Get social graph
  const socialScore = await getUserSocialGraph(userId);
  
  // Calculate engagement level
  const engagementLevel = await calculateUserEngagement(userId);
  
  // Get last active date
  const lastActive = user.registrations[0]?.createdAt || new Date();

  return {
    preferences: userPreferences,
    pastCategories,
    categoryWeights,
    userLocation: user.location,
    userCoordinates,
    timePatterns,
    socialScore,
    engagementLevel,
    lastActive: new Date(lastActive)
  };
}

// Matrix factorization for collaborative filtering (simplified implementation)
async function getMatrixFactorizationRecommendations(userId: string, limit = 20): Promise<string[]> {
  // In a real implementation, you would use a more sophisticated algorithm
  // This is a simplified version that mimics the results of matrix factorization
  
  // Get all users who share events with our target user
  const userEvents = await prisma.registration.findMany({
    where: { userId },
    select: { eventId: true }
  });
  
  const userEventIds = userEvents.map(reg => reg.eventId);
  
  if (userEventIds.length === 0) {
    return [];
  }
  
  // Find users who attended the same events
  const similarUsers = await prisma.registration.findMany({
    where: {
      eventId: { in: userEventIds },
      userId: { not: userId }
    },
    select: {
      userId: true,
      eventId: true
    }
  });
  
  // Calculate similarity scores
  const userSimilarityScore = new Map<string, number>();
  
  similarUsers.forEach(reg => {
    userSimilarityScore.set(
      reg.userId,
      (userSimilarityScore.get(reg.userId) || 0) + 1
    );
  });
  
  // Get top similar users
  const topSimilarUsers = Array.from(userSimilarityScore.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([userId]) => userId);
    
  if (topSimilarUsers.length === 0) {
    return [];
  }
  
  // Get events these similar users attended
  const recommendedEvents = await prisma.registration.findMany({
    where: {
      userId: { in: topSimilarUsers },
      event: {
        date: { gte: new Date() }
      },
      NOT: {
        eventId: { in: userEventIds }
      }
    },
    select: {
      eventId: true,
      userId: true
    }
  });
  
  // Calculate event scores based on user similarity
  const eventScores = new Map<string, number>();
  
  recommendedEvents.forEach(reg => {
    const similarityScore = userSimilarityScore.get(reg.userId) || 0;
    eventScores.set(
      reg.eventId,
      (eventScores.get(reg.eventId) || 0) + similarityScore
    );
  });
  
  // Return top scored events
  return Array.from(eventScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([eventId]) => eventId);
}

// Content-based filtering with more sophisticated features
async function getContentBasedRecommendations(
  userProfile: UserProfile,
  limit = 20
): Promise<string[]> {
  const { pastCategories, categoryWeights, timePatterns, userCoordinates } = userProfile;
  
  if (pastCategories.length === 0) {
    return [];
  }
  
  // Get upcoming events in user's preferred categories
  const upcomingEvents = await prisma.event.findMany({
    where: {
      date: { gte: new Date() },
      category: { in: pastCategories }
    },
    select: {
      id: true,
      category: true,
      date: true,
      time: true,
      location: true,
      _count: {
        select: { registrations: true }
      }
    },
    take: limit * 2
  });
  
  // Score events based on multiple factors
  const eventScores = upcomingEvents.map(event => {
    let score = 1.0;
    
    // Factor 1: Category preference (from user history)
    const categoryWeight = categoryWeights.get(event.category) || 0;
    score *= (1 + categoryWeight);
    
    // Factor 2: Time preference match
    const eventDate = new Date(event.date);
    const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][eventDate.getDay()];
    const dayPreference = timePatterns.preferredDays.get(dayOfWeek) || 0;
    
    // Extract hour from time
    let hour = 12; // Default to noon if not specified
    if (event.time) {
      const timeMatch = event.time.match(/(\d+):/);
      if (timeMatch) {
        hour = parseInt(timeMatch[1]);
        if (event.time.toLowerCase().includes('pm') && hour < 12) {
          hour += 12;
        }
      }
    }
    const hourPreference = timePatterns.preferredHours.get(hour) || 0;
    
    // Apply time preference boost
    score *= (1 + (dayPreference * 0.2) + (hourPreference * 0.2));
    
    // Factor 3: Location proximity
    if (userCoordinates) {
      const eventCoordinates = getCoordinatesFromLocation(event.location);
      if (eventCoordinates) {
        const distance = calculateDistance(userCoordinates, eventCoordinates);
        // Apply proximity factor (closer is better)
        if (distance < 10) {
          score *= 1.5; // Very close events (within 10km)
        } else if (distance < 30) {
          score *= 1.2; // Nearby events (within 30km)
        }
      }
    }
    
    // Factor 4: Event popularity
    const popularity = event._count.registrations;
    score *= (1 + Math.log10(1 + popularity) * 0.1);
    
    return { eventId: event.id, score };
  });
  
  // Sort by score and return IDs
  return eventScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.eventId);
}

// Function to calculate personalized event scores with more factors
function calculateEventScores(
  events: any[],
  userProfile: UserProfile
): [any, number][] {
  const {
    preferences,
    pastCategories,
    categoryWeights,
    userCoordinates,
    timePatterns,
    socialScore,
    engagementLevel,
    lastActive
  } = userProfile;

  const preferredCategories = preferences.categories || [];
  const maxDistance = preferences.maxDistance || 50; // Default 50km
  const now = new Date();
  
  return events.map(event => {
    let score = 1.0; // Base score
    
    // Factor 1: Category match with preferences (highest weight)
    if (preferredCategories.includes(event.category)) {
      score *= 2.0;
    }
    
    // Factor 2: Category match with past registrations (high weight)
    const categoryWeight = categoryWeights.get(event.category) || 0;
    score *= (1 + categoryWeight);
    
    // Factor 3: Location proximity if user has location set (medium weight)
    if (userCoordinates) {
      const eventCoordinates = getCoordinatesFromLocation(event.location);
      if (eventCoordinates) {
        const distance = calculateDistance(userCoordinates, eventCoordinates);
        // Closer events get higher scores, with steep dropoff beyond maxDistance
        if (distance <= maxDistance) {
          score *= 1.0 + ((maxDistance - distance) / maxDistance);
        } else {
          score *= 0.5; // Penalty for events outside preferred range
        }
      }
    }
    
    // Factor 4: Time preference match
    const eventDate = new Date(event.date);
    const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][eventDate.getDay()];
    const dayPreference = timePatterns.preferredDays.get(dayOfWeek) || 0;
    
    // Extract hour from time
    let hour = 12; // Default to noon if not specified
    if (event.time) {
      const timeMatch = event.time.match(/(\d+):/);
      if (timeMatch) {
        hour = parseInt(timeMatch[1]);
        if (event.time.toLowerCase().includes('pm') && hour < 12) {
          hour += 12;
        }
      }
    }
    const hourPreference = timePatterns.preferredHours.get(hour) || 0;
    
    // Apply time preference boost
    score *= (1 + (dayPreference * 0.1) + (hourPreference * 0.1));
    
    // Factor 5: Event popularity (lower weight)
    // More attendees = more popular
    if (event.attendees > 0) {
      // Logarithmic scaling to prevent very popular events from dominating
      score *= (1 + Math.log10(event.attendees) * 0.2);
    }
    
    // Factor 6: Social popularity (events popular in user's network)
    const socialPopularity = socialScore.get(event.id) || 0;
    if (socialPopularity > 0) {
      score *= (1 + (socialPopularity * 0.3));
    }
    
    // Factor 7: User engagement level adjustment
    // More engaged users might prefer more niche events
    if (engagementLevel > 0.7) {
      // For highly engaged users, boost less popular events
      if (event.attendees < 10) {
        score *= 1.2;
      }
    } else if (engagementLevel < 0.3) {
      // For less engaged users, boost more popular events
      if (event.attendees > 20) {
        score *= 1.2;
      }
    }
    
    // Factor 8: Recency boost for newer events
    const daysUntil = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Events in the next week get a boost
    if (daysUntil >= 0 && daysUntil <= 7) {
      score *= 1.3;
    }
    
    // Adjust based on user's activity level - if user hasn't been active recently
    // prefer events that are further in the future
    const daysSinceLastActive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastActive > 14 && daysUntil > 14) {
      score *= 1.2; // Boost events further away for inactive users
    }
    
    return [event, score];
  });
}

export async function getRecommendedEvents(limit = 4) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { events: [] };
  }
  
  try {
    const userId = session.user.id;
    
    // Build enhanced user profile with preferences and behavior
    const userProfile = await buildUserProfile(userId);
    
    // Use more advanced collaborative filtering (matrix factorization)
    const collaborativeEventIds = await getMatrixFactorizationRecommendations(userId);
    
    // Use more advanced content-based recommendations
    const contentBasedEventIds = await getContentBasedRecommendations(userProfile);
    
    // Combine both approaches
    const recommendationIds = Array.from(new Set([
      ...collaborativeEventIds,
      ...contentBasedEventIds
    ]));
    
    // If we have no data at all, return random upcoming events
    if (recommendationIds.length === 0) {
      const randomEvents = await prisma.event.findMany({
        where: {
          date: { gte: new Date() },
          // Exclude events the user is already registered for
          NOT: {
            registrations: {
              some: {
                userId
              }
            }
          }
        },
        orderBy: [
          { date: 'asc' }
        ],
        take: limit,
        include: {
          _count: {
            select: { registrations: true },
          },
        }
      });
      
      return {
        events: randomEvents.map(event => ({
          ...event,
          attendees: event._count.registrations,
        }))
      };
    }
    
    // Get full event details for recommendations
    const recommendedEvents = await prisma.event.findMany({
      where: {
        OR: [
          { id: { in: recommendationIds } },
          // Add fallback for categories if we have few recommendations
          recommendationIds.length < limit ? {
            category: { in: userProfile.pastCategories },
            date: { gte: new Date() }
          } : {}
        ],
        // Exclude events the user is already registered for
        NOT: {
          registrations: {
            some: {
              userId
            }
          }
        }
      },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      take: limit * 3 // Get more than needed for final scoring
    });
    
    // Transform events for scoring
    const eventsWithAttendees = recommendedEvents.map(event => ({
      ...event,
      attendees: event._count.registrations,
    }));
    
    // Score events with enhanced algorithm
    const scoredEvents = calculateEventScores(
      eventsWithAttendees,
      userProfile
    );
    
    // Sort by score and take top events
    const topEvents = scoredEvents
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([event]) => event);
    
    return { events: topEvents };
    
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return { events: [] };
  }
}