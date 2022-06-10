import { defineStore } from 'pinia'
import axios from '../axios'

export interface NewNote {
  text: string
  meanings: string[]
  readings: string[]
  description?: string
  exampleSentences: string[]
  tags: string[]
  type: 'word' | 'kanji'
}

export interface Note {
  _id: string
  creator: string
  text: string
  meanings: string[]
  readings: string[]
  description?: string
  exampleSentences: string[]
  tags: string[]
  type: 'word' | 'kanji'
  level: number
  dueAt?: string
  burnedAt?: string
  createdAt: string
}

export interface KanjiNote extends Note {
  type: 'kanji'
}

export interface WordNote extends Note {
  type: 'word'
}

export const useNotes = defineStore('notes', {
  actions: {
    async getDueNotes(): Promise<Note[]> {
      const response = await axios.get('/api/v1/notes?due=true')
      return response.data
    },
    async progressNote(noteId: string, amount: number): Promise<void> {
      await axios.patch(`/api/v1/notes/${noteId}/progress/${amount}`)
    },
    async createNote(note: NewNote): Promise<void> {
      await axios.post('/api/v1/notes', note)
    },
  },
})
