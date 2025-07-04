import axios from 'axios';

// Create an axios instance with the baseURL from env variable
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // e.g., "http://localhost:5000/api/v1" or your deployed backend URL
});

// Add a request interceptor to attach token if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
    console.log('Request with token:', token.substring(0, 20) + '...');
  }
  return req;
});

// Add a response interceptor to log responses or errors globally
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.data);
    return response;
  },
  (error) => {
    console.error('API error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// LOGIN function: send POST /auth/login with login data (e.g., {email, password})
const login = async (data) => {
  console.log('=== AUTH SERVICE LOGIN ===');
  console.log('Login data:', data);

  try {
    const res = await API.post('/auth/login', data);

    console.log('Login response:', res.data);
    console.log('Token received:', res.data.token ? 'Yes' : 'No');
    console.log('User data received:', res.data.user || 'Not in user field');

    // If user data not explicitly provided, try decoding token payload (optional)
    if (!res.data.user && res.data.token) {
      try {
        const tokenPayload = JSON.parse(atob(res.data.token.split('.')[1]));
        console.log('Token payload:', tokenPayload);
      } catch (e) {
        console.log('Could not decode token:', e.message);
      }
    }

    return res.data; // typically { token, user }
  } catch (error) {
    console.error('Login service error:', error.response?.data || error.message);
    throw error;
  }
};

// REGISTER function: send POST /auth/register with registration data (e.g., {name, email, password})
const register = async (data) => {
  console.log('=== AUTH SERVICE REGISTER ===');
  console.log('Register data:', data);

  try {
    const res = await API.post('/auth/register', data);

    console.log('Register response:', res.data);
    console.log('Token received:', res.data.token ? 'Yes' : 'No');
    console.log('User data received:', res.data.user || 'Not in user field');

    return res.data; // typically { token, user }
  } catch (error) {
    console.error('Register service error:', error.response?.data || error.message);
    throw error;
  }
};

const authService = { login, register };

export default authService;
