import { defineStore } from 'pinia'
import axios from '../axios'

const AUTH_BASE = '/api/v1/auth'

export interface UserStats {
  notes: number
  dueNotes: number
  burnedNotes: number
  timeline: number[][]
  notesPerLevel: number[]
}

export const useUser = defineStore('user', {
  state: () => {
    return { token: localStorage.getItem('token') } as {
      token: string | null
    }
  },
  getters: {
    isAuthenticated: (state) => {
      return !!state.token
    },
  },
  actions: {
    setToken(token: string): void {
      localStorage.setItem('token', token)
      this.token = token
    },
    clearToken(): void {
      localStorage.removeItem('token')
      this.token = null
    },
    logout(): void {
      this.clearToken()
    },
    async login(name: string, password: string): Promise<void> {
      const response = await axios.post(AUTH_BASE + '/login', {
        name,
        password,
      })

      this.setToken(response.data.token)
    },
    async register(name: string, password: string): Promise<void> {
      const response = await axios.post(AUTH_BASE + '/register', {
        name,
        password,
      })

      this.setToken(response.data.token)
    },
    async getStats(): Promise<UserStats> {
      const response = await axios.get('/api/v1/users/my-stats')
      return response.data
    },
  },
})
