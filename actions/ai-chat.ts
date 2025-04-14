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
    let contextData = {};

    // Get the last user message to determine what data to fetch
    const lastUserMessage = messages[messages.length - 1].content.toLowerCase();

    try {
      // Check if the user is asking about their registered events
      if (
        lastUserMessage.includes("my events") ||
        lastUserMessage.includes("registered") ||
        lastUserMessage.includes("my registrations") ||
        lastUserMessage.includes("which events i registered") ||
        lastUserMessage.includes("events i registered in") ||
        lastUserMessage.includes("what events am i registered for") ||
        lastUserMessage.includes("list the event that i registered in")
      ) {
        if (userId) {
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

          // Always add this data to the context, even if empty array
          contextData = {
            ...contextData,
            userRegistrations,
            isUserAuthenticated: true,
            // Add explicit message for empty registrations
            registrationMessage:
              userRegistrations.length === 0
                ? "You are not currently registered for any events."
                : `You are registered for ${userRegistrations.length} events.`,
          };
        } else {
          // If no userId, explicitly note this in the context
          contextData = {
            ...contextData,
            userRegistrations: [],
            isUserAuthenticated: false,
            userAuthError:
              "User is not authenticated or userId is not available",
          };
        }
      }

      // POPULAR EVENTS - Available to both users and admins
      if (
        lastUserMessage.includes("popular") ||
        lastUserMessage.includes("most popular") ||
        lastUserMessage.includes("top event") ||
        lastUserMessage.includes("best event") ||
        lastUserMessage.includes("which event is most") ||
        lastUserMessage.includes("which events are") ||
        lastUserMessage.includes("most registered") ||
        lastUserMessage.includes("most attendees")
      ) {
        try {
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
            .slice(0, 5); // Get top 5 most popular

          // Add to context
          contextData = { ...contextData, popularEvents };
        } catch (error) {
          console.error("Error fetching popular events:", error);
        }
      }

      // Data accessible to both admins and regular users
      if (
        lastUserMessage.includes("events") ||
        lastUserMessage.includes("all events") ||
        lastUserMessage.includes("event list") ||
        lastUserMessage.includes("upcoming events")
      ) {
        const allEvents = await prisma.event.findMany({
          include: {
            creator: { select: { name: true } },
            _count: { select: { registrations: true } },
            images: true,
          },
          orderBy: { date: "asc" },
        });
        contextData = { ...contextData, allEvents };
      }

      if (
        lastUserMessage.includes("categories") ||
        lastUserMessage.includes("interests") ||
        lastUserMessage.includes("preferences")
      ) {
        const eventCategories = await prisma.event.findMany({
          select: { category: true },
          distinct: ["category"],
        });
        contextData = {
          ...contextData,
          eventCategories: eventCategories.map((ec) => ec.category),
        };
      }

      if (
        lastUserMessage.includes("my profile") ||
        lastUserMessage.includes("profile") ||
        lastUserMessage.includes("my info") ||
        lastUserMessage.includes("my account")
      ) {
        if (userId) {
          const userProfile = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              name: true,
              email: true,
              role: true,
              location: true,
              preferences: true,
              createdAt: true,
            },
          });
          contextData = { ...contextData, userProfile };
        }
      }

      // Search functionality
      if (
        lastUserMessage.includes("search for") ||
        lastUserMessage.includes("find events")
      ) {
        const searchTerms = lastUserMessage
          .replace(/search for|find events|with|about|related to/gi, "")
          .trim();
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
          contextData = { ...contextData, searchResults };
        }
      }

      // Admin-only data access
      if (isAdmin) {
        // USER REGISTRATIONS - Special handling for this specific query
        if (
          (lastUserMessage.includes("users") ||
            lastUserMessage.includes("people")) &&
          (lastUserMessage.includes("registered") ||
            lastUserMessage.includes("registrations") ||
            lastUserMessage.includes("which events"))
        ) {
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

          contextData = { ...contextData, usersWithRegistrations };
        }

        if (
          lastUserMessage.includes("dashboard") ||
          lastUserMessage.includes("overview") ||
          lastUserMessage.includes("statistics") ||
          lastUserMessage.includes("stats")
        ) {
          const [
            userCount,
            eventCount,
            registrationCount,
            categoryStats,
            recentRegistrations,
            upcomingEvents,
          ] = await Promise.all([
            prisma.user.count(),
            prisma.event.count(),
            prisma.registration.count(),
            prisma.event.groupBy({
              by: ["category"],
              _count: true,
            }),
            prisma.registration.findMany({
              take: 5,
              orderBy: { createdAt: "desc" },
              include: {
                user: { select: { name: true, email: true } },
                event: { select: { title: true } },
              },
            }),
            prisma.event.findMany({
              where: { date: { gte: new Date() } },
              take: 5,
              orderBy: { date: "asc" },
              include: {
                creator: { select: { name: true } },
                _count: { select: { registrations: true } },
              },
            }),
          ]);

          contextData = {
            ...contextData,
            dashboardStats: {
              userCount,
              eventCount,
              registrationCount,
              categoryStats,
              recentRegistrations,
              upcomingEvents,
            },
          };
        }

        if (
          lastUserMessage.includes("recent event") ||
          lastUserMessage.includes("new event")
        ) {
          const recentEvents = await prisma.event.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              creator: { select: { name: true } },
              _count: { select: { registrations: true } },
            },
          });
          contextData = { ...contextData, recentEvents };
        }

        if (
          lastUserMessage.includes("users") ||
          lastUserMessage.includes("all users") ||
          lastUserMessage.includes("user list")
        ) {
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
          contextData = { ...contextData, allUsers };
        }

        if (
          lastUserMessage.includes("registrations") ||
          lastUserMessage.includes("all registrations")
        ) {
          // Check if looking for a specific user's registrations
          const userIdMatch = lastUserMessage.match(/user (\d+)/);
          if (userIdMatch) {
            const targetUserId = userIdMatch[1];
            const userRegistrations = await prisma.registration.findMany({
              where: { userId: targetUserId },
              include: {
                user: { select: { name: true, email: true } },
                event: { select: { title: true, date: true } },
              },
            });
            contextData = { ...contextData, userRegistrations };
          } else {
            // Get all registrations
            const allRegistrations = await prisma.registration.findMany({
              include: {
                user: { select: { name: true, email: true } },
                event: { select: { title: true, date: true } },
              },
            });
            contextData = { ...contextData, allRegistrations };
          }
        }

        if (
          lastUserMessage.includes("activities") ||
          lastUserMessage.includes("recent activities") ||
          lastUserMessage.includes("admin activities")
        ) {
          const recentActivities = await prisma.activity.findMany({
            take: 20,
            orderBy: { createdAt: "desc" },
            include: {
              user: { select: { name: true } },
            },
          });
          contextData = { ...contextData, recentActivities };
        }
      }
    } catch (dbError) {
      console.error("Error fetching data from database:", dbError);
      // Continue with the conversation even if data fetching fails
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
        temperature: isAdmin ? 0.3 : 0.7, // Lower temperature for admin responses (more factual)
        maxOutputTokens: 800,
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
