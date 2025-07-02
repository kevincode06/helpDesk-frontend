import axios from 'axios';

const API = axios.create({
  baseURL: 'https://help-desk-backend-esr3.onrender.com/api/v1',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
