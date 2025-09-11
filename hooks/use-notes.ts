"use client"

import { useState, useEffect, useCallback } from "react"
import { db, Note } from "@/lib/db"

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load notes from IndexedDB
  useEffect(() => {
    const loadNotes = async () => {
      const allNotes = await db.notes.toArray()
      setNotes(allNotes)

      if (allNotes.length > 0) {
        setCurrentNoteId(allNotes[0].id)
      }
      setIsLoading(false)
    }

    loadNotes()
  }, [])

  const createNote = useCallback(async (): Promise<Note> => {
    const newNote: Note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: "Untitled Note",
      content: "",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await db.notes.add(newNote)
    setNotes((prev) => [newNote, ...prev])
    setCurrentNoteId(newNote.id)
    return newNote
  }, [])

  const updateNote = useCallback(async (noteId: string, updates: Partial<Note>) => {
    const updatedAt = new Date().toISOString()
    await db.notes.update(noteId, { ...updates, updatedAt })
    setNotes((prev) =>
      prev.map((note) => (note.id === noteId ? { ...note, ...updates, updatedAt } : note)),
    )
  }, [])

  const deleteNote = useCallback(async (noteId: string) => {
    await db.notes.delete(noteId)
    setNotes((prev) => {
      const filtered = prev.filter((note) => note.id !== noteId)
      if (noteId === currentNoteId) {
        setCurrentNoteId(filtered.length > 0 ? filtered[0].id : null)
      }
      return filtered
    })
  }, [currentNoteId])

  const setCurrentNote = useCallback((noteId: string) => {
    setCurrentNoteId(noteId)
  }, [])

  const currentNote = notes.find((note) => note.id === currentNoteId) || null

  return {
    notes,
    currentNote,
    currentNoteId,
    createNote,
    updateNote,
    deleteNote,
    setCurrentNote,
    isLoading,
  }
}
