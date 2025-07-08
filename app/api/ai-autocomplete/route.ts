import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { context } = await request.json()

    if (!context) {
      return NextResponse.json({ error: "Context is required" }, { status: 400 })
    }

    const prompt = `Based on the following text context, provide 3 helpful writing suggestions or continuations. Each suggestion should be a complete sentence or phrase that naturally follows the context. Return only the suggestions as a JSON array of strings.

Context: "${context.substring(context.length - 200)}"

Provide suggestions that are:
1. Contextually relevant
2. Helpful for continuing the writing
3. Natural and flowing

Return format: ["suggestion 1", "suggestion 2", "suggestion 3"]`

    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt,
      maxTokens: 200,
    })

    try {
      const suggestions = JSON.parse(text)
      return NextResponse.json({ suggestions })
    } catch {
      // Fallback if JSON parsing fails
      const fallbackSuggestions = [
        "Continue writing your thoughts here...",
        "Let me elaborate on this point.",
        "Here's what I think about this topic.",
      ]
      return NextResponse.json({ suggestions: fallbackSuggestions })
    }
  } catch (error) {
    console.error("AI Autocomplete API Error:", error)
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
