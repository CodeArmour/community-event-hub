'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { 
  getDashboardStats, 
  getRecentEvents, 
  getPopularEvents,
  getAllUsers,
  getAllEvents
} from "./admin-ai";

import {
  getCurrentAdmin,
  updateAdminProfile,
  updateNotificationPreferences,
  updateAdminPassword,
  updateTwoFactorAuth,
} from './users';

import {
  getCurrentUserForProfile,
  getAllEventCategories,
  updateUserProfile,
  updateUserPassword,
} from './profile';

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

Current date: ${new Date().toLocaleDateString()}
`;

// Additional prompt content for admins
const ADMIN_PROMPT_EXTENSION = `
You're speaking with an ADMIN user who has access to platform statistics and insights.
You can reference the provided database statistics in your answers.

When the admin asks for statistics or insights, refer to the data in the CONTEXT section
of your prompt, which contains real statistics from the platform database.

If you don't have certain data, suggest what specific statistics might answer their question.
`;

export async function generateAIResponse(messages: { role: "user" | "assistant"; content: string }[]) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    // Check user authentication and role
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";
    
    // Select appropriate system prompt based on user role
    let systemPrompt = BASE_PROMPT;
    if (isAdmin) {
      systemPrompt = `${BASE_PROMPT}\n\n${ADMIN_PROMPT_EXTENSION}`;
    }
    
    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro"
    });
    
    // Initialize context data object (will be populated only for admins)
    let contextData = {};
    
    // If admin, fetch relevant data based on the query
    if (isAdmin) {
      const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
      
      // Determine what data to fetch based on the user's query
      if (
        lastUserMessage.includes("dashboard") || 
        lastUserMessage.includes("overview") || 
        lastUserMessage.includes("statistics") ||
        lastUserMessage.includes("stats")
      ) {
        contextData = await getDashboardStats();
      }
      
      if (
        lastUserMessage.includes("recent event") || 
        lastUserMessage.includes("new event")
      ) {
        const recentEvents = await getRecentEvents();
        contextData = { ...contextData, recentEvents };
      }
      
      if (
        lastUserMessage.includes("popular") || 
        lastUserMessage.includes("top event") ||
        lastUserMessage.includes("best event")
      ) {
        const popularEvents = await getPopularEvents();
        contextData = { ...contextData, popularEvents };
      }
      
      // If admin is asking about data but we haven't fetched anything specific yet,
      // get dashboard stats as a default
      if (
        Object.keys(contextData).length === 0 && 
        (lastUserMessage.includes("data") || 
         lastUserMessage.includes("numbers") || 
         lastUserMessage.includes("metrics") ||
         lastUserMessage.includes("how many"))
      ) {
        contextData = await getDashboardStats();
      }
      
      if (
        lastUserMessage.includes('profile') ||
        lastUserMessage.includes('my info') ||
        lastUserMessage.includes('personal') ||
        lastUserMessage.includes('settings')
      ) {
        const userProfile = await getCurrentAdmin(); // fetch the admin's profile
        contextData = { ...contextData, userProfile };
      }
    
      if (
        lastUserMessage.includes('categories') ||
        lastUserMessage.includes('interests') ||
        lastUserMessage.includes('preferences')
      ) {
        const eventCategories = await getAllEventCategories();
        contextData = { ...contextData, eventCategories };
      }

      if (
        lastUserMessage.includes("users") ||
        lastUserMessage.includes("all users") ||
        lastUserMessage.includes("user list")
      ) {
        const allUsers = await getAllUsers();
        contextData = { ...contextData, allUsers };
      }
    
      if (
        lastUserMessage.includes("events") ||
        lastUserMessage.includes("all events") ||
        lastUserMessage.includes("event list")
      ) {
        const allEvents = await getAllEvents();
        contextData = { ...contextData, allEvents };
      }
    }
    
    // Format messages for Gemini's content generation
    const formattedMessages = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));
    
    // Add system message at the beginning
    formattedMessages.unshift({
      role: "model",
      parts: [{ text: systemPrompt }]
    });
    
    // If admin with context data, add it to the messages
    if (isAdmin && Object.keys(contextData).length > 0) {
      formattedMessages.push({
        role: "model",
        parts: [{ text: `CONTEXT: ${JSON.stringify(contextData, null, 2)}` }]
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
