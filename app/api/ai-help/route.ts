import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { content, action, customPrompt } = await request.json()

    let prompt = ""

    if (action === "summarize") {
      if (!content) {
        return NextResponse.json({ error: "Content is required for summarization" }, { status: 400 })
      }
      prompt = `Please provide a concise summary of the following text. Keep it clear and to the point:\n\n${content}`
    } else if (action === "improve") {
      if (!content) {
        return NextResponse.json({ error: "Content is required for improvement" }, { status: 400 })
      }
      prompt = `Please improve the following text by making it clearer, more engaging, and better structured. Maintain the original meaning and tone:\n\n${content}`
    } else if (action === "custom") {
      if (!customPrompt) {
        return NextResponse.json({ error: "Custom prompt is required" }, { status: 400 })
      }
      prompt = customPrompt
      if (content) {
        prompt += `\n\nContext (if relevant): ${content}`
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt,
      maxTokens: 1000,
    })

    return NextResponse.json({ result: text })
  } catch (error) {
    console.error("AI Help API Error:", error)
    return NextResponse.json({ error: "Failed to process AI request" }, { status: 500 })
  }
}
