import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API请求失败:', error)
    return Promise.reject(error)
  }
)

// API 接口定义
export const apiClient = {
  // State 相关
  getState: async () => {
    const res = await api.get('/api/state')
    return res.data
  },

  updateState: async (data: { categories: any[]; links: any[] }) => {
    const res = await api.put('/api/state', data)
    return res.data
  },

  // Categories CRUD
  getCategories: async () => {
    const res = await api.get('/api/categories')
    return res.data
  },

  createCategory: async (data: { name: string }) => {
    const res = await api.post('/api/categories', data)
    return res.data
  },

  updateCategory: async (id: string, data: { name?: string }) => {
    const res = await api.put(`/api/categories/${id}`, data)
    return res.data
  },

  deleteCategory: async (id: string) => {
    const res = await api.delete(`/api/categories/${id}`)
    return res.data
  },

  // Links CRUD
  getLinks: async (categoryId?: string) => {
    const res = await api.get('/api/links', {
      params: categoryId ? { categoryId } : {},
    })
    return res.data
  },

  createLink: async (data: { name: string; url: string; categoryId: string; iconType?: string }) => {
    const res = await api.post('/api/links', data)
    return res.data
  },

  updateLink: async (id: string, data: { name?: string; url?: string; categoryId?: string; iconType?: string }) => {
    const res = await api.put(`/api/links/${id}`, data)
    return res.data
  },

  deleteLink: async (id: string) => {
    const res = await api.delete(`/api/links/${id}`)
    return res.data
  },

  // Health check
  healthCheck: async () => {
    const res = await api.get('/api/health')
    return res.data
  },
}

export default apiClient

