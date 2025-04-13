"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { revalidatePath } from "next/cache"

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// System prompt to give context to the AI about your application
const SYSTEM_PROMPT = `
You are an AI assistant for a Community Event Hub application. 
Your name is EventBuddy.

The application allows users to:
- Browse community events
- Register for events
- Create and manage their own events (if they have admin privileges)
- View their registered events
- Update their profile and preferences

Be helpful, concise, and friendly. If you don't know something specific about the application, 
you can make reasonable assumptions based on typical event platforms.

Current date: ${new Date().toLocaleDateString()}
`

export async function generateAIResponse(messages: { role: "user" | "assistant"; content: string }[]) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured")
    }

    // Get the model - use the correct model name (gemini-1.5-pro or gemini-1.0-pro)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro"  // Updated model name
    })
    
    // Format messages for Gemini's content generation
    const formattedMessages = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));
    
    // Add system message at the beginning
    formattedMessages.unshift({
      role: "model",
      parts: [{ text: SYSTEM_PROMPT }]
    });

    // Generate content
    const result = await model.generateContent({
      contents: formattedMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
        topP: 1,
      },
    });

    const responseText = result.response.text();

    // Revalidate the path to ensure fresh data
    revalidatePath("/")

    return { success: true, data: responseText }
  } catch (error: any) {
    console.error("Error generating AI response:", error)
    return {
      success: false,
      error: error.message || "Failed to generate AI response",
    }
  }
}