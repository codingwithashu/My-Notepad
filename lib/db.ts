"use client"

import Dexie, { Table } from "dexie"

export interface Note {
    id: string
    title: string
    content: string
    tags: string[]
    folder?: string
    createdAt: string
    updatedAt: string
}

export class NotesDB extends Dexie {
    notes!: Table<Note, string>

    constructor() {
        super("NotesDatabase")
        this.version(1).stores({
            notes: "id, title, updatedAt",
        })
    }
}

export const db = new NotesDB()
