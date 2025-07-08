"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  Send,
  MessageSquare,
  PenTool,
  FileText,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIHelpButtonProps {
  content: string;
  onContentUpdate: (content: string) => void;
}

export function AIHelpButton({ content, onContentUpdate }: AIHelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [action, setAction] = useState<
    "summarize" | "improve" | "custom" | null
  >(null);
  const { toast } = useToast();

  const quickPrompts = [
    {
      icon: <Mail className="w-4 h-4" />,
      label: "Write job application email",
      prompt:
        "Write a professional job application email for a software developer position",
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: "Create meeting agenda",
      prompt:
        "Create a comprehensive meeting agenda for a project planning session",
    },
    {
      icon: <PenTool className="w-4 h-4" />,
      label: "Write blog introduction",
      prompt:
        "Write an engaging introduction for a blog post about productivity tips",
    },
    {
      icon: <MessageSquare className="w-4 h-4" />,
      label: "Draft social media post",
      prompt:
        "Create an engaging social media post about the benefits of AI in writing",
    },
  ];

  const handleAIAction = async (
    actionType: "summarize" | "improve" | "custom",
    prompt?: string
  ) => {
    if (actionType !== "custom" && !content.trim()) {
      toast({
        title: "No content",
        description: "Please write some content first before using AI help.",
        variant: "destructive",
      });
      return;
    }

    if (actionType === "custom" && !prompt?.trim()) {
      toast({
        title: "No prompt",
        description: "Please enter a prompt for the AI to work with.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAction(actionType);
    setAiResponse("");

    try {
      const response = await fetch("/api/ai-help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: actionType === "custom" ? "" : content,
          action: actionType,
          customPrompt: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      setAiResponse(data.result);
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Failed to get AI assistance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setCustomPrompt(prompt);
    handleAIAction("custom", prompt);
  };

  const applyAIResponse = () => {
    if (aiResponse) {
      const html = convertPlainTextToHTML(aiResponse);

      if (action === "custom") {
        // For custom prompts, replace all content
        onContentUpdate(html);
      } else {
        // For summarize/improve, replace existing content
        onContentUpdate(html);
      }
      cleanup();
    }
  };

  const convertPlainTextToHTML = (text: string) => {
    const escaped = text
      .split("\n")
      .map((line) => `<p>${line.trim()}</p>`)
      .join("");
    return escaped;
  };

  const insertAIResponse = () => {
    if (aiResponse) {
      const html = convertPlainTextToHTML(`${content}\n\n${aiResponse}`);
      const newContent = content + "\n\n" + html;
      onContentUpdate(newContent);
      cleanup();
    }
  };

  const cleanup = () => {
    setIsOpen(false);
    setAiResponse("");
    setAction(null);
    setCustomPrompt("");
    toast({
      title: "Content updated",
      description: "AI suggestions have been applied to your note.",
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            size="lg"
          >
            <Sparkles className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              AI Writing Assistant
            </DialogTitle>
            <DialogDescription>
              Get AI help to improve your writing, generate content, or answer
              any questions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="space-y-3">
              <h4 className="font-medium">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleAIAction("summarize")}
                  disabled={isLoading}
                  variant={action === "summarize" ? "default" : "outline"}
                  size="sm"
                >
                  {isLoading && action === "summarize" && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Summarize
                </Button>
                <Button
                  onClick={() => handleAIAction("improve")}
                  disabled={isLoading}
                  variant={action === "improve" ? "default" : "outline"}
                  size="sm"
                >
                  {isLoading && action === "improve" && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Improve Writing
                </Button>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-3">
              <h4 className="font-medium">Quick Prompts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt.prompt)}
                    disabled={isLoading}
                    variant="outline"
                    className="justify-start h-auto p-3 text-left"
                  >
                    <div className="flex items-center gap-2">
                      {prompt.icon}
                      <span className="text-sm">{prompt.label}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="space-y-3">
              <h4 className="font-medium">Ask AI Anything</h4>
              <div className="flex gap-2">
                <Input
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., Write an email for job application, Create a business plan outline..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAIAction("custom", customPrompt);
                    }
                  }}
                />
                <Button
                  onClick={() => handleAIAction("custom", customPrompt)}
                  disabled={isLoading || !customPrompt.trim()}
                >
                  {isLoading && action === "custom" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* AI Response */}
            {aiResponse && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    AI{" "}
                    {action === "summarize"
                      ? "Summary"
                      : action === "improve"
                      ? "Improvement"
                      : "Response"}
                  </Badge>
                </div>
                <Textarea
                  value={aiResponse}
                  onChange={(e) => setAiResponse(e.target.value)}
                  className="min-h-[200px]"
                  placeholder="AI response will appear here..."
                />
                <div className="flex gap-2">
                  <Button onClick={applyAIResponse}>Replace Content</Button>
                  <Button onClick={insertAIResponse} variant="outline">
                    Insert Below
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAiResponse("");
                      setAction(null);
                      setCustomPrompt("");
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>AI is thinking...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
