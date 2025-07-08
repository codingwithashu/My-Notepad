import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const formData = await req.formData()
    // Solution 1: Type assertion
    const file = (formData as any).get("image") as File | null

    if (!file) {
        return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
    const filePath = path.join(uploadsDir, fileName)

    await writeFile(filePath, buffer)

    const url = `/uploads/${fileName}`
    return NextResponse.json({ url })
}