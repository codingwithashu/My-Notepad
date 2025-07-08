import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const prompt = `Generate a concise, descriptive title for the following text content. The title should be no more than 8 words and capture the main topic or theme. Only return the title, nothing else:\n\n${content.substring(0, 1000)}`

    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt,
      maxTokens: 50,
    })

    return NextResponse.json({ title: text.trim() })
  } catch (error) {
    console.error("Generate Title API Error:", error)
    return NextResponse.json({ error: "Failed to generate title" }, { status: 500 })
  }
}
