"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Base system prompt for all users
const BASE_PROMPT = `
You are EventBuddy, an AI assistant for the Community Event Hub application.

The application allows users to:
- Browse community events
- Register for events
- Create and manage their own events (if they have permissions)
- View their registered events
- Update their profile and preferences

Be helpful, concise, and friendly. If you don't know something specific about the application, 
you can make reasonable assumptions based on typical event platforms.

When displaying structured data like user lists, format your response using markdown:
- Use bullet points for lists
- Use tables for tabular data
- Use bold text for emphasis
- Use headings for sections (### for headings)
- Format user roles with appropriate emphasis (e.g., **ADMIN** or **USER**)
- Don't answer questions that are not related to the application or its features
- Don't answer any questions that related to db schema or internal implementation details

When asked about popular events:
- If popularEvents data is provided in your context, use this to directly answer which events have the most registrations
- List the top events by registration count in descending order
- Include the event title, creator name, and registration count for each event
- For questions like "which event is most popular" - always respond with specific data from the context if available

When asked about the user's registered events:
- IMPORTANT: Always check the userRegistrations data in the context
- If userRegistrations data is provided, list all events the user is registered for in a clear format
- Include event titles, dates, locations, and categories
- If userRegistrations is an empty array, inform the user they are not registered for any events
- If there's a userAuthError, explain that the user needs to be logged in to view this information
- NEVER say you don't have access to this information if userRegistrations data exists in the context

Current date: ${new Date().toLocaleDateString()}
`;

// Additional prompt content for admins
const ADMIN_PROMPT_EXTENSION = `
You're speaking with an ADMIN user who has access to platform statistics and insights.
You can reference the provided database statistics in your answers.

When the admin asks for statistics or insights, refer to the data in the CONTEXT section
of your prompt, which contains real statistics from the platform database.

If you don't have certain data, suggest what specific statistics might answer their question.

When displaying user information, format it clearly with:
- User name in bold
- Email in parentheses
- Role clearly marked (e.g., **ADMIN** or **USER**)
- Organize users by role when listing multiple users

Important instructions for handling user registrations:
- When showing which events users are registered for, create a clear list with user names and their registered events
- Format this as a hierarchical list with user names as main items and their events as sub-items
- Include relevant event details (title, date, location) for each registration

Important instructions for stats and analytics:
- When showing platform statistics, organize the data in clear sections with headings
- Use tables for comparison data
- Use bullet points for sequential lists of statistics
- Include percentage calculations when relevant (e.g., registration rates, growth rates)
- For time-based data, format in chronological order
`;

// Additional prompt to help the AI understand how to format registration data
const REGISTRATION_EXAMPLE = `
Example of how to format user registration data:

When userRegistrations data is available:
---
### Your Registered Events

${/* This is just an example format to show the AI */ ``}
You are registered for 3 events:

1. **Summer Tech Conference**
   - Date: June 15, 2025
   - Location: Downtown Convention Center
   - Category: Technology

2. **Community Garden Workshop**
   - Date: May 23, 2025
   - Location: Greenfield Park
   - Category: Environment

3. **Local Art Exhibition**
   - Date: July 5, 2025
   - Location: City Gallery
   - Category: Arts
---

When user is not registered for any events:
---
### Your Registered Events

You are not currently registered for any events. Browse our upcoming events to find something that interests you!
---

When user is not logged in:
---
You need to be logged in to view your registered events. Please sign in to access this information.
---
`;

// Extract keywords from a message to determine what data to fetch
function extractKeywords(message: string): string[] {
  const lowercaseMessage = message.toLowerCase();
  const keywords: string[] = [];

  // Keywords mapping
  const keywordMap: Record<string, string[]> = {
    registrations: [
      "registered",
      "registrations",
      "sign up",
      "signed up",
      "my events",
      "attending",
    ],
    events: ["events", "event", "happening", "activities", "schedule"],
    popular: [
      "popular",
      "trending",
      "most attended",
      "best",
      "top",
      "favorite",
    ],
    profile: [
      "profile",
      "account",
      "my info",
      "my details",
      "my preferences",
      "settings",
    ],
    users: ["users", "people", "attendees", "participants", "members"],
    categories: ["categories", "types", "interests", "topics", "themes"],
    statistics: [
      "statistics",
      "stats",
      "numbers",
      "figures",
      "metrics",
      "analytics",
      "dashboard",
    ],
    search: ["search", "find", "look for", "seeking", "looking for"],
    recent: ["recent", "new", "latest", "just added", "upcoming"],
    location: ["location", "place", "venue", "where", "city"],
    date: ["date", "when", "time", "schedule", "calendar"],
    admin: ["admin", "management", "administration", "moderate", "system"],
  };

  // Check for each keyword group
  Object.entries(keywordMap).forEach(([key, synonyms]) => {
    if (synonyms.some((synonym) => lowercaseMessage.includes(synonym))) {
      keywords.push(key);
    }
  });

  // Extract search terms if applicable
  if (keywords.includes("search")) {
    const searchRegex = /search(?:\s+for)?\s+(.+?)(?:\s+in|$)/i;
    const findRegex = /find\s+(.+?)(?:\s+in|$)/i;
    const lookingForRegex = /looking\s+for\s+(.+?)(?:\s+in|$)/i;

    const searchMatch =
      lowercaseMessage.match(searchRegex) ||
      lowercaseMessage.match(findRegex) ||
      lowercaseMessage.match(lookingForRegex);

    if (searchMatch && searchMatch[1]) {
      keywords.push(`search_term:${searchMatch[1].trim()}`);
    }
  }

  return keywords;
}

// Analyze message to detect question types
function detectQuestionType(message: string): string[] {
  const lowercaseMessage = message.toLowerCase();
  const questionTypes: string[] = [];

  // Question pattern detection
  if (/how many|count of|total number/i.test(lowercaseMessage)) {
    questionTypes.push("count");
  }

  if (
    /compare|versus|vs\.|comparison between|difference between|similarities/i.test(
      lowercaseMessage
    )
  ) {
    questionTypes.push("comparison");
  }

  if (/most|top|highest|best|popular|trending/i.test(lowercaseMessage)) {
    questionTypes.push("ranking");
  }

  if (/when|what time|what date|schedule for/i.test(lowercaseMessage)) {
    questionTypes.push("time");
  }

  if (/where|location|venue|place/i.test(lowercaseMessage)) {
    questionTypes.push("location");
  }

  if (/who created|who made|organizer|creator|host/i.test(lowercaseMessage)) {
    questionTypes.push("creator");
  }

  if (/list all|show all|display all|give me all/i.test(lowercaseMessage)) {
    questionTypes.push("list_all");
  }

  if (
    /my profile|my account|my information|my details/i.test(lowercaseMessage)
  ) {
    questionTypes.push("user_profile");
  }

  return questionTypes;
}

export async function generateAIResponse(
  messages: { role: "user" | "assistant"; content: string }[]
) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    // Check user authentication and role
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";
    const userId = session?.user?.id;

    // Select appropriate system prompt based on user role
    let systemPrompt = `${BASE_PROMPT}\n\n${REGISTRATION_EXAMPLE}`;
    if (isAdmin) {
      systemPrompt = `${BASE_PROMPT}\n\n${ADMIN_PROMPT_EXTENSION}\n\n${REGISTRATION_EXAMPLE}`;
    }

    // Get the model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    // Initialize context data object
    let contextData: Record<string, any> = {};

    // Get the last user message to determine what data to fetch
    const lastUserMessage = messages[messages.length - 1].content;

    // Extract keywords and detect question type
    const keywords = extractKeywords(lastUserMessage);
    const questionTypes = detectQuestionType(lastUserMessage);

    // Add metadata about the question to help the AI understand what's being asked
    contextData.questionMetadata = {
      keywords,
      questionTypes,
      isAdminUser: isAdmin,
      isAuthenticated: !!userId,
    };

    try {
      // Common data that is needed for most questions (user & session info)
      if (userId) {
        const userInfo = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            location: true,
            _count: {
              select: {
                events: true,
                registrations: true,
              },
            },
          },
        });

        contextData.currentUser = userInfo;
      }

      // USER REGISTRATIONS - Always fetch for authenticated users
      if (
        userId &&
        (keywords.includes("registrations") ||
          questionTypes.includes("user_profile"))
      ) {
        const userRegistrations = await prisma.registration.findMany({
          where: { userId },
          include: {
            event: {
              include: {
                creator: { select: { name: true } },
              },
            },
          },
        });

        contextData.userRegistrations = userRegistrations;
        contextData.isUserAuthenticated = true;
        contextData.registrationMessage =
          userRegistrations.length === 0
            ? "You are not currently registered for any events."
            : `You are registered for ${userRegistrations.length} events.`;
      } else if (!userId && keywords.includes("registrations")) {
        // If no userId, explicitly note this in the context
        contextData.userRegistrations = [];
        contextData.isUserAuthenticated = false;
        contextData.userAuthError =
          "User is not authenticated or userId is not available";
      }

      // POPULAR EVENTS - Available to both users and admins
      if (keywords.includes("popular") || questionTypes.includes("ranking")) {
        // First get all events with their registration counts
        const events = await prisma.event.findMany({
          include: {
            creator: { select: { name: true } },
            _count: { select: { registrations: true } },
          },
        });

        // Sort by registration count (descending)
        const popularEvents = events
          .sort(
            (a, b) =>
              (b._count?.registrations || 0) - (a._count?.registrations || 0)
          )
          .slice(0, 10); // Get top 10 most popular

        // Add to context
        contextData.popularEvents = popularEvents;
      }

      // UPCOMING EVENTS - Always fetch for event-related questions
      if (keywords.includes("events") || keywords.includes("recent")) {
        const allEvents = await prisma.event.findMany({
          where: {
            date: { gte: new Date() },
          },
          include: {
            creator: { select: { name: true } },
            _count: { select: { registrations: true } },
            images: true,
          },
          orderBy: { date: "asc" },
          take: 20, // Limit to 20 upcoming events
        });

        contextData.upcomingEvents = allEvents;

        // Also get past events if needed
        if (
          keywords.includes("past") ||
          lastUserMessage.toLowerCase().includes("past")
        ) {
          const pastEvents = await prisma.event.findMany({
            where: {
              date: { lt: new Date() },
            },
            include: {
              creator: { select: { name: true } },
              _count: { select: { registrations: true } },
            },
            orderBy: { date: "desc" },
            take: 10, // Limit to 10 past events
          });

          contextData.pastEvents = pastEvents;
        }
      }

      // CATEGORIES - Useful for many questions
      if (keywords.includes("categories")) {
        const eventCategories = await prisma.event.findMany({
          select: { category: true },
          distinct: ["category"],
        });

        contextData.eventCategories = eventCategories.map((ec) => ec.category);

        // Add category statistics
        const categoryStats = await prisma.event.groupBy({
          by: ["category"],
          _count: { _all: true },
        });

        contextData.categoryStats = categoryStats;
      }

      // USER PROFILE - Always fetch for authenticated users
      if (
        userId &&
        (keywords.includes("profile") || questionTypes.includes("user_profile"))
      ) {
        const userProfile = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            name: true,
            email: true,
            role: true,
            location: true,
            preferences: true,
            createdAt: true,
            _count: {
              select: {
                events: true,
                registrations: true,
              },
            },
          },
        });

        contextData.userProfile = userProfile;

        // Also fetch events created by this user
        const userCreatedEvents = await prisma.event.findMany({
          where: { createdBy: userId },
          include: {
            _count: { select: { registrations: true } },
          },
          orderBy: { date: "desc" },
        });

        contextData.userCreatedEvents = userCreatedEvents;
      }

      // SEARCH FUNCTIONALITY
      const searchTermKeyword = keywords.find((k) =>
        k.startsWith("search_term:")
      );
      if (searchTermKeyword) {
        const searchTerms = searchTermKeyword.replace("search_term:", "");

        if (searchTerms) {
          const searchResults = await prisma.event.findMany({
            where: {
              OR: [
                { title: { contains: searchTerms, mode: "insensitive" } },
                { description: { contains: searchTerms, mode: "insensitive" } },
                { category: { contains: searchTerms, mode: "insensitive" } },
                { location: { contains: searchTerms, mode: "insensitive" } },
              ],
            },
            include: {
              creator: { select: { name: true } },
              _count: { select: { registrations: true } },
            },
          });

          contextData.searchResults = searchResults;
          contextData.searchQuery = searchTerms;
        }
      }

      // LOCATION-BASED QUERIES
      if (questionTypes.includes("location")) {
        const locationMatch = lastUserMessage.match(
          /in\s+([a-zA-Z\s]+?)(?:\s+on|\s+at|\s+during|\?|$)/i
        );

        if (locationMatch && locationMatch[1]) {
          const locationQuery = locationMatch[1].trim();

          const locationEvents = await prisma.event.findMany({
            where: {
              location: { contains: locationQuery, mode: "insensitive" },
            },
            include: {
              creator: { select: { name: true } },
              _count: { select: { registrations: true } },
            },
            orderBy: { date: "asc" },
          });

          contextData.locationEvents = locationEvents;
          contextData.locationQuery = locationQuery;
        }
      }

      // DATE/TIME-BASED QUERIES
      if (questionTypes.includes("time")) {
        // Extract date patterns
        const dateMatch = lastUserMessage.match(
          /(today|tomorrow|this week|this month|next week|next month)/i
        );

        if (dateMatch) {
          const dateQuery = dateMatch[1].toLowerCase();
          const now = new Date();
          let startDate = new Date();
          let endDate = new Date();

          // Set appropriate date ranges
          if (dateQuery === "today") {
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
          } else if (dateQuery === "tomorrow") {
            startDate.setDate(now.getDate() + 1);
            startDate.setHours(0, 0, 0, 0);
            endDate.setDate(now.getDate() + 1);
            endDate.setHours(23, 59, 59, 999);
          } else if (dateQuery === "this week") {
            const dayOfWeek = now.getDay();
            startDate.setDate(now.getDate() - dayOfWeek);
            startDate.setHours(0, 0, 0, 0);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
          } else if (dateQuery === "next week") {
            const dayOfWeek = now.getDay();
            startDate.setDate(now.getDate() - dayOfWeek + 7);
            startDate.setHours(0, 0, 0, 0);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
          } else if (dateQuery === "this month") {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            );
          } else if (dateQuery === "next month") {
            startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            endDate = new Date(
              now.getFullYear(),
              now.getMonth() + 2,
              0,
              23,
              59,
              59,
              999
            );
          }

          const timeEvents = await prisma.event.findMany({
            where: {
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
            include: {
              creator: { select: { name: true } },
              _count: { select: { registrations: true } },
            },
            orderBy: { date: "asc" },
          });

          contextData.timeEvents = timeEvents;
          contextData.timeQuery = dateQuery;
          contextData.timeRange = { startDate, endDate };
        }
      }

      // ADMIN-ONLY ACCESS
      if (isAdmin) {
        // USER REGISTRATIONS - Special handling for this specific query
        if (keywords.includes("users") && keywords.includes("registrations")) {
          // Get all users with their registrations and event details
          const usersWithRegistrations = await prisma.user.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              registrations: {
                select: {
                  id: true,
                  status: true,
                  createdAt: true,
                  event: {
                    select: {
                      id: true,
                      title: true,
                      date: true,
                      location: true,
                      category: true,
                    },
                  },
                },
              },
            },
          });

          contextData.usersWithRegistrations = usersWithRegistrations;
        }

        // ADMIN DASHBOARD - Complete statistics
        if (
          keywords.includes("statistics") ||
          lastUserMessage.toLowerCase().includes("dashboard")
        ) {
          const [
            userCount,
            eventCount,
            registrationCount,
            categoryStats,
            recentRegistrations,
            upcomingEvents,
            userGrowth,
            eventsByMonth,
          ] = await Promise.all([
            prisma.user.count(),
            prisma.event.count(),
            prisma.registration.count(),
            prisma.event.groupBy({
              by: ["category"],
              _count: true,
            }),
            prisma.registration.findMany({
              take: 10,
              orderBy: { createdAt: "desc" },
              include: {
                user: { select: { name: true, email: true } },
                event: { select: { title: true } },
              },
            }),
            prisma.event.findMany({
              where: { date: { gte: new Date() } },
              take: 10,
              orderBy: { date: "asc" },
              include: {
                creator: { select: { name: true } },
                _count: { select: { registrations: true } },
              },
            }),
            // Monthly user growth (last 6 months)
            prisma.$queryRaw`
              SELECT 
                DATE_TRUNC('month', "createdAt") as month,
                COUNT(*) as count
              FROM "User"
              WHERE "createdAt" > NOW() - INTERVAL '6 months'
              GROUP BY month
              ORDER BY month
            `,
            // Events by month (last 6 months)
            prisma.$queryRaw`
              SELECT 
                DATE_TRUNC('month', date) as month,
                COUNT(*) as count
              FROM "Event"
              WHERE date > NOW() - INTERVAL '6 months'
              GROUP BY month
              ORDER BY month
            `,
          ]);

          contextData.dashboardStats = {
            userCount,
            eventCount,
            registrationCount,
            categoryStats,
            recentRegistrations,
            upcomingEvents,
            userGrowth,
            eventsByMonth,
          };

          // Add registration rate (registrations per event)
          if (eventCount > 0) {
            contextData.dashboardStats.registrationRate =
              registrationCount / eventCount;
          }

          // Get user roles distribution
          const userRoleDistribution = await prisma.user.groupBy({
            by: ["role"],
            _count: true,
          });

          contextData.dashboardStats.userRoleDistribution =
            userRoleDistribution;

          // Most active users (by registrations)
          const mostActiveUsers = await prisma.user.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              _count: {
                select: {
                  registrations: true,
                },
              },
            },
            orderBy: {
              registrations: {
                _count: "desc",
              },
            },
            take: 10,
          });

          contextData.dashboardStats.mostActiveUsers = mostActiveUsers;

          // Most productive event creators
          const mostProductiveCreators = await prisma.user.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              _count: {
                select: {
                  events: true,
                },
              },
            },
            orderBy: {
              events: {
                _count: "desc",
              },
            },
            take: 10,
          });

          contextData.dashboardStats.mostProductiveCreators =
            mostProductiveCreators;
        }

        // RECENT EVENTS
        if (keywords.includes("recent") && keywords.includes("events")) {
          const recentEvents = await prisma.event.findMany({
            take: 15,
            orderBy: { createdAt: "desc" },
            include: {
              creator: { select: { name: true, email: true } },
              _count: { select: { registrations: true } },
            },
          });

          contextData.recentEvents = recentEvents;
        }

        // USER MANAGEMENT
        if (keywords.includes("users")) {
          const allUsers = await prisma.user.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              location: true,
              createdAt: true,
              _count: {
                select: {
                  events: true,
                  registrations: true,
                },
              },
            },
          });

          contextData.allUsers = allUsers;

          // Group users by role
          const usersByRole = allUsers.reduce((acc, user) => {
            const role = user.role;
            if (!acc[role]) acc[role] = [];
            acc[role].push(user);
            return acc;
          }, {} as Record<string, any[]>);

          contextData.usersByRole = usersByRole;
        }

        // REGISTRATION MANAGEMENT
        if (
          keywords.includes("registrations") &&
          questionTypes.includes("list_all")
        ) {
          // Get all registrations
          const allRegistrations = await prisma.registration.findMany({
            include: {
              user: { select: { name: true, email: true, role: true } },
              event: { select: { title: true, date: true, location: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 50, // Limit to most recent 50
          });

          contextData.allRegistrations = allRegistrations;

          // Group registrations by status
          const registrationsByStatus = allRegistrations.reduce((acc, reg) => {
            const status = reg.status;
            if (!acc[status]) acc[status] = [];
            acc[status].push(reg);
            return acc;
          }, {} as Record<string, any[]>);

          contextData.registrationsByStatus = registrationsByStatus;
        }

        // ACTIVITY LOGS
        if (
          keywords.includes("activities") ||
          lastUserMessage.toLowerCase().includes("logs")
        ) {
          const recentActivities = await prisma.activity.findMany({
            take: 30,
            orderBy: { createdAt: "desc" },
            include: {
              user: { select: { name: true, email: true, role: true } },
            },
          });

          contextData.recentActivities = recentActivities;

          // Group activities by type
          const activitiesByType = recentActivities.reduce((acc, activity) => {
            const type = activity.targetType || "OTHER";
            if (!acc[type]) acc[type] = [];
            acc[type].push(activity);
            return acc;
          }, {} as Record<string, any[]>);

          contextData.activitiesByType = activitiesByType;
        }

        // EVENT DETAILS (for specific event)
        const eventIdMatch = lastUserMessage.match(/event (\d+|[a-f0-9-]+)/i);
        if (eventIdMatch) {
          const eventId = eventIdMatch[1];
          const eventDetails = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
              creator: { select: { name: true, email: true } },
              _count: { select: { registrations: true } },
              registrations: {
                include: {
                  user: { select: { name: true, email: true } },
                },
                take: 20,
              },
              images: true,
            },
          });

          if (eventDetails) {
            contextData.specificEventDetails = eventDetails;
          }
        }

        // USER DETAILS (for specific user)
        const userIdMatch = lastUserMessage.match(/user (\d+|[a-f0-9-]+)/i);
        if (userIdMatch) {
          const userIdToLookup = userIdMatch[1];
          const userDetails = await prisma.user.findUnique({
            where: { id: userIdToLookup },
            include: {
              events: {
                include: {
                  _count: { select: { registrations: true } },
                },
              },
              registrations: {
                include: {
                  event: {
                    select: { title: true, date: true, location: true },
                  },
                },
              },
              activities: {
                take: 10,
                orderBy: { createdAt: "desc" },
              },
            },
          });

          if (userDetails) {
            contextData.specificUserDetails = userDetails;
          }
        }
      }
    } catch (dbError) {
      console.error("Error fetching data from database:", dbError);
      // Continue with the conversation even if data fetching fails
      contextData.dataFetchError =
        "There was an error retrieving some data from the database.";
    }

    // Format messages for Gemini's content generation
    const formattedMessages = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Add system message at the beginning
    formattedMessages.unshift({
      role: "model",
      parts: [{ text: systemPrompt }],
    });

    // Add a specific instruction for handling registration data
    if (Object.keys(contextData).length > 0) {
      // First, prepare a special instruction for user registration queries
      if (contextData.hasOwnProperty("userRegistrations")) {
        const authStatus = contextData.isUserAuthenticated
          ? "authenticated"
          : "not authenticated";
        const regCount = contextData.userRegistrations?.length || 0;

        formattedMessages.push({
          role: "model",
          parts: [
            {
              text: `
IMPORTANT INSTRUCTION: The user has asked about their registered events. 
- Authentication status: User is ${authStatus}
- Registration count: ${regCount}

Please follow these guidelines exactly:
- If the user is NOT authenticated (isUserAuthenticated is false), tell them they need to log in first
- If the user IS authenticated (isUserAuthenticated is true):
  - If userRegistrations array is empty, tell them they are not registered for any events
  - If userRegistrations has events, list each event with complete details (title, date, location, category)

DO NOT say you don't have access to registration information if isUserAuthenticated is true.
`,
            },
          ],
        });
      }

      // Then add comprehensive instructions for complex queries
      if (questionTypes.length > 0) {
        formattedMessages.push({
          role: "model",
          parts: [
            {
              text: `
QUERY ANALYSIS: I've analyzed the user's query:
- Question types: ${questionTypes.join(", ")}
- Keywords detected: ${keywords.join(", ")}

Special instructions for this query type:
- Be direct and precise in your answer
- Use headings and formatting to organize complex information
- Include specific numbers, dates, and names from the provided context
`,
            },
          ],
        });
      }
      // Then add the actual context data
      formattedMessages.push({
        role: "model",
        parts: [{ text: `CONTEXT: ${JSON.stringify(contextData, null, 2)}` }],
      });
    }

    // Generate content
    const result = await model.generateContent({
      contents: formattedMessages,
      generationConfig: {
        temperature: isAdmin ? 0.2 : 0.6, // Lower temperature for admin responses (more factual)
        maxOutputTokens: 1000, // Increased token limit for more comprehensive responses
        topP: 1,
      },
    });

    const responseText = result.response.text();

    // Revalidate the path to ensure fresh data
    revalidatePath("/");

    return { success: true, data: responseText };
  } catch (error: any) {
    console.error("Error generating AI response:", error);
    return {
      success: false,
      error: error.message || "Failed to generate AI response",
    };
  }
}
