"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Tag, Folder, Trash2, Plus } from "lucide-react"
import type { Note } from "@/hooks/use-notes"

interface NoteManagerProps {
  isOpen: boolean
  onClose: () => void
  notes: Note[]
  currentNoteId: string
  onSelectNote: (noteId: string) => void
  onDeleteNote: (noteId: string) => void
  onCreateNote: () => void
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void
}

export function NoteManager({
  isOpen,
  onClose,
  notes,
  currentNoteId,
  onSelectNote,
  onDeleteNote,
  onCreateNote,
  onUpdateNote,
}: NoteManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags)))

  // Get all unique folders
  const allFolders = Array.from(new Set(notes.map((note) => note.folder).filter(Boolean)))

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      !searchQuery ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTag = !selectedTag || note.tags.includes(selectedTag)
    const matchesFolder = !selectedFolder || note.folder === selectedFolder

    return matchesSearch && matchesTag && matchesFolder
  })

  const handleSelectNote = (noteId: string) => {
    onSelectNote(noteId)
    onClose()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Note Manager</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Notes</TabsTrigger>
            <TabsTrigger value="tags">By Tags</TabsTrigger>
            <TabsTrigger value="folders">By Folders</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 my-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={onCreateNote}>
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    note.id === currentNoteId ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteNote(note.id)
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent onClick={() => handleSelectNote(note.id)}>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground line-clamp-3">
                        {stripHtml(note.content).substring(0, 150) || "No content"}
                      </div>

                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {note.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{note.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(note.updatedAt)}</span>
                        {note.folder && (
                          <Badge variant="secondary" className="text-xs">
                            <Folder className="w-3 h-3 mr-1" />
                            {note.folder}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tags" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={selectedTag === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(null)}
              >
                All Tags
              </Button>
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    note.id === currentNoteId ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleSelectNote(note.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {stripHtml(note.content).substring(0, 100) || "No content"}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="folders" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={selectedFolder === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFolder(null)}
              >
                All Folders
              </Button>
              {allFolders.map((folder) => (
                <Button
                  key={folder}
                  variant={selectedFolder === folder ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFolder(folder)}
                >
                  <Folder className="w-3 h-3 mr-1" />
                  {folder}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    note.id === currentNoteId ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleSelectNote(note.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {stripHtml(note.content).substring(0, 100) || "No content"}
                      </div>
                      {note.folder && (
                        <Badge variant="secondary" className="text-xs">
                          <Folder className="w-3 h-3 mr-1" />
                          {note.folder}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
