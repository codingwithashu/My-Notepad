"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TipTapEditor } from "@/components/tiptap-editor";
import { ThemeToggle } from "@/components/theme-toggle";
import { AIHelpButton } from "@/components/ai-help-button";
import { ExportButton } from "@/components/export-button";
import { TemplateSelector } from "@/components/template-selector";
import { NoteManager } from "@/components/note-manager";
import { WordCount } from "@/components/word-count";
import { PremiumFeatures } from "@/components/premium-features";
import {
  RotateCcw,
  Sparkles,
  Loader2,
  FileText,
  FolderOpen,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useToast } from "@/hooks/use-toast";
import { useNotes } from "@/hooks/use-notes";
import { marked } from "marked";
import { JsonViewer } from "./json-viewer";
import { JsonModal } from "./json-modal";

export function Notepad() {
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [showNoteManager, setShowNoteManager] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showJsonViewer, setShowJsonViewer] = useState(false);

  const { toast } = useToast();

  const {
    currentNote,
    notes,
    createNote,
    updateNote,
    deleteNote,
    setCurrentNote,
    isLoading,
  } = useNotes();

  // Handle content changes with auto-save
  const handleContentChange = useCallback(
    async (newContent: string) => {
      if (currentNote) {
        await updateNote(currentNote.id, { content: newContent });
      }
    },
    [currentNote, updateNote]
  );

  // Handle title changes
  const handleTitleChange = (newTitle: string) => {
    if (currentNote) {
      updateNote(currentNote.id, { title: newTitle });
    }
  };

  // Generate AI title
  const generateAITitle = async () => {
    if (!currentNote?.content.trim()) {
      toast({
        title: "No content",
        description:
          "Please write some content first before generating a title.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingTitle(true);

    try {
      const response = await fetch("/api/generate-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: currentNote.content }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate title");
      }

      const data = await response.json();
      handleTitleChange(data.title);
      toast({
        title: "Title generated",
        description: "AI has generated a title for your note.",
      });
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Failed to generate title. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  // Reset function
  const handleReset = async () => {
    if (currentNote) {
      await updateNote(currentNote.id, {
        title: "Untitled Note",
        content: "",
        tags: [],
      });
      toast({
        title: "Note cleared",
        description: "Your note has been reset successfully.",
      });
    }
  };

  // Create new note
  const handleNewNote = async () => {
    const newNote = await createNote();
    setCurrentNote(newNote.id);
    toast({
      title: "New note created",
      description: "A new note has been created.",
    });
  };

  // Apply template
  const handleApplyTemplate = async (template: any) => {
    if (currentNote) {
      const htmlContent = marked.parse(template.content) as string;
      await updateNote(currentNote.id, {
        title: template.title,
        content: htmlContent,
        tags: template.tags || [],
      });
      setShowTemplates(false);
      toast({
        title: "Template applied",
        description: `${template.name} template has been applied.`,
      });
    }
  };

  // Format last saved time
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-muted rounded mb-4 w-48 mx-auto"></div>
          <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show note manager if no current note or if user wants to see all notes
  if (!currentNote || showNoteManager) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">My Notepad</span>
              <div className="text-xs text-muted-foreground">
                AI-Powered Writing
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleNewNote}>
              <FileText className="w-4 h-4 mr-2" />
              New Note
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Notes Grid */}
        <div className="flex-1 p-6">
          {notes.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Welcome to My Notepad</h2>
                <p className="text-muted-foreground text-lg">
                  Start your writing journey with AI-powered assistance. Create
                  your first note to get started.
                </p>
                <Button
                  onClick={handleNewNote}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Create Your First Note
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">
                  Your Notes ({notes.length})
                </h1>
                <Button
                  onClick={() => setShowNoteManager(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="group cursor-pointer"
                    onClick={() => {
                      setCurrentNote(note.id);
                      setShowNoteManager(false);
                    }}
                  >
                    <div className="bg-card border rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 h-48 flex flex-col">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {note.title}
                      </h3>
                      <div className="text-sm text-muted-foreground mb-3 flex-1 overflow-hidden">
                        <div className="line-clamp-4">
                          {note.content
                            .replace(/<[^>]*>/g, "")
                            .substring(0, 150) || "No content"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatLastSaved(new Date(note.updatedAt))}</span>
                        {note.tags.length > 0 && (
                          <div className="flex gap-1">
                            {note.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {note.tags.length > 2 && (
                              <span>+{note.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNoteManager(true)}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Notes ({notes.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Input
              value={currentNote.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
              placeholder="Enter note title..."
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateAITitle}
                    disabled={isGeneratingTitle}
                    className="shrink-0"
                  >
                    {isGeneratingTitle ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="z-[9999]"
                  avoidCollisions={false}
                >
                  <p>Generate an AI-powered title</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {currentNote.updatedAt && (
            <Badge variant="secondary" className="text-xs shrink-0">
              Last saved: {formatLastSaved(new Date(currentNote.updatedAt))}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <WordCount content={currentNote.content} />
          <ExportButton
            content={currentNote.content}
            title={currentNote.title}
          />
          <JsonModal />
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewNote}
            className="hidden sm:flex bg-transparent"
          >
            <FileText className="w-4 h-4 mr-2" />
            New
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <TipTapEditor
          key={currentNote.id}
          content={currentNote.content}
          onChange={handleContentChange}
          noteId={currentNote.id}
        />
      </div>

      {/* Floating AI Help Button */}
      <AIHelpButton
        content={currentNote.content}
        onContentUpdate={handleContentChange}
      />

      {/* Premium Features */}
      <PremiumFeatures />

      {/* Note Manager Modal */}
      <NoteManager
        isOpen={showNoteManager}
        onClose={() => setShowNoteManager(false)}
        notes={notes}
        currentNoteId={currentNote.id}
        onSelectNote={setCurrentNote}
        onDeleteNote={async (noteId) => {
          await deleteNote(noteId);
        }}
        onCreateNote={handleNewNote}
        onUpdateNote={updateNote}
      />

      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onApplyTemplate={handleApplyTemplate}
      />
    </div>
  );
}
