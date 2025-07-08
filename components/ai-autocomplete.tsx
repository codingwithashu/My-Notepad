"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Type, List, FileText } from "lucide-react"

interface AIAutocompleteProps {
  position: { x: number; y: number }
  onSelect: (suggestion: string) => void
  onClose: () => void
  context: string
}

export function AIAutocomplete({ position, onSelect, onClose, context }: AIAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    generateSuggestions()
  }, [context])

  const generateSuggestions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai-autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ context }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error("AI autocomplete error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const quickActions = [
    {
      icon: <List className="w-4 h-4" />,
      label: "Create bullet list",
      content: "• \n• \n• ",
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: "Add heading",
      content: "## ",
    },
    {
      icon: <Type className="w-4 h-4" />,
      label: "Continue writing",
      content: "",
      action: "continue",
    },
  ]

  return (
    <Card
      className="absolute z-50 w-80 shadow-lg border"
      style={{
        left: Math.min(position.x, window.innerWidth - 320),
        top: position.y + 10,
      }}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">AI Suggestions</span>
          <Badge variant="secondary" className="text-xs">
            Beta
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Generating suggestions...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Quick Actions */}
            <div className="space-y-1">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-2"
                  onClick={() => {
                    if (action.action === "continue") {
                      // Generate continuation
                      onSelect(" ")
                    } else {
                      onSelect(action.content)
                    }
                  }}
                >
                  {action.icon}
                  <span className="ml-2 text-sm">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* AI Generated Suggestions */}
            {suggestions.length > 0 && (
              <>
                <div className="border-t pt-2">
                  <span className="text-xs text-muted-foreground mb-2 block">Smart completions</span>
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2 whitespace-normal"
                      onClick={() => onSelect(suggestion)}
                    >
                      <span className="text-sm line-clamp-2">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </>
            )}

            <div className="border-t pt-2">
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={onClose}>
                Press Esc to close
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
