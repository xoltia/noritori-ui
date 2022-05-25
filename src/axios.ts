import axios from 'axios'
import { useUser } from './stores/useUser'

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use((config) => {
  const token = useUser().token
  if (!token) {
    return config
  }

  if (!config.headers) {
    config.headers = { Authorization: `Bearer ${token}` }
  } else {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default axiosInstance
