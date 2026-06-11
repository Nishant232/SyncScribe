import axios, { AxiosError } from 'axios'
import { createClient } from '@/lib/supabase/client'
import type { Document, Collaborator, ShareLink } from '@/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token interceptor
api.interceptors.request.use(
  async (config) => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// Document API
export const documentAPI = {
  getAll: () => api.get<{ documents: Document[] }>('/api/documents'),
  
  getOne: (id: string) => api.get<{ document: Document }>(`/api/documents/${id}`),
  
  create: (data: { title?: string; content?: string }) =>
    api.post<{ document: Document }>('/api/documents', data),
  
  update: (id: string, data: { title?: string; content?: string }) =>
    api.patch<{ document: Document }>(`/api/documents/${id}`, data),
  
  delete: (id: string) => api.delete(`/api/documents/${id}`),
}

// Sharing API
export const sharingAPI = {
  createShareLink: (
    documentId: string,
    data: { role: 'editor' | 'viewer'; expiresInDays?: number }
  ) =>
    api.post<{ share: ShareLink; link: string }>(`/api/documents/${documentId}/share`, data),
  
  joinViaToken: (token: string) =>
    api.get<{ documentId: string; role: string }>(`/api/join/${token}`),
  
  getCollaborators: (documentId: string) =>
    api.get<{ collaborators: Collaborator[] }>(`/api/documents/${documentId}/collaborators`),
  
  removeCollaborator: (documentId: string, userId: string) =>
    api.delete(`/api/documents/${documentId}/collaborators/${userId}`),
}

export default api
