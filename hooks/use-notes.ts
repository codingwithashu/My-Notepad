"use client"

import { useState, useEffect, useCallback } from "react"

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  folder?: string
  createdAt: string
  updatedAt: string
}

const NOTES_STORAGE_KEY = "notepad-notes"
const CURRENT_NOTE_KEY = "notepad-current-note"

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY)
    const savedCurrentNoteId = localStorage.getItem(CURRENT_NOTE_KEY)

    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes)
        setNotes(parsedNotes)

        if (savedCurrentNoteId && parsedNotes.find((note: Note) => note.id === savedCurrentNoteId)) {
          setCurrentNoteId(savedCurrentNoteId)
        } else if (parsedNotes.length > 0) {
          setCurrentNoteId(parsedNotes[0].id)
        }
      } catch (error) {
        console.error("Error parsing saved notes:", error)
      }
    }

    setIsLoading(false)
  }, [])

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes))
    }
  }, [notes, isLoading])

  // Save current note ID to localStorage
  useEffect(() => {
    if (currentNoteId) {
      localStorage.setItem(CURRENT_NOTE_KEY, currentNoteId)
    }
  }, [currentNoteId])

  const createNote = useCallback((): Note => {
    const newNote: Note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: "Untitled Note",
      content: "",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setNotes((prev) => [newNote, ...prev])
    return newNote
  }, [])

  const updateNote = useCallback((noteId: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === noteId ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note)),
    )
  }, [])

  const deleteNote = useCallback(
    (noteId: string) => {
      setNotes((prev) => {
        const filtered = prev.filter((note) => note.id !== noteId)

        // If we're deleting the current note, switch to another note
        if (noteId === currentNoteId) {
          const remainingNotes = filtered
          if (remainingNotes.length > 0) {
            setCurrentNoteId(remainingNotes[0].id)
          } else {
            setCurrentNoteId(null)
          }
        }

        return filtered
      })
    },
    [currentNoteId],
  )

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
