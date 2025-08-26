// https://chatter-topaz-five.vercel.app/api

import axios from 'axios'

const BASE_URL = import.meta.env.MODE==='development'? 'http://localhost:5001/api' : 'https://chatter-topaz-five.vercel.app/api'

export const axiosInstance = axios.create({
    baseURL: 'https://chatter-topaz-five.vercel.app/api',
    withCredentials: true,

})