"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FileText } from "lucide-react"

interface WordCountProps {
  content: string
}

export function WordCount({ content }: WordCountProps) {
  const stripHtml = (html: string) => {
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  const plainText = stripHtml(content)
  const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0
  const characters = plainText.length
  const charactersNoSpaces = plainText.replace(/\s/g, "").length
  const paragraphs = plainText.trim() ? plainText.split(/\n\s*\n/).length : 0

  // Estimate reading time (average 200 words per minute)
  const readingTime = Math.ceil(words / 200)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
          <FileText className="w-3 h-3 mr-1" />
          {words} words
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Document Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Words:</span>
                <span className="font-medium">{words.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Characters:</span>
                <span className="font-medium">{characters.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Characters (no spaces):</span>
                <span className="font-medium">{charactersNoSpaces.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Paragraphs:</span>
                <span className="font-medium">{paragraphs}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Reading time:</span>
                <span className="font-medium">
                  {readingTime} min{readingTime !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
