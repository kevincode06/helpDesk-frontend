import axios from 'axios';

console.log('=== AUTH SERVICE DEBUG ===');
console.log('Environment variables:');
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('All env vars starting with REACT_APP_:', 
  Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'))
);

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
});

// Debug the axios instance
console.log('Axios baseURL:', API.defaults.baseURL);

API.interceptors.request.use((req) => {
    console.log('=== AXIOS REQUEST INTERCEPTOR ===');
    console.log('Request URL:', req.url);
    console.log('Request baseURL:', req.baseURL);
    console.log('Final URL will be:', `${req.baseURL}${req.url}`);
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request data:', req.data);
    
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
        console.log('Request with token:', token.substring(0, 20) + '...');
    }
    return req;
});

API.interceptors.response.use(
    (response) => {
        console.log('=== AXIOS RESPONSE INTERCEPTOR ===');
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        console.log('Response data:', response.data);
        return response;
    },
    (error) => {
        console.log('=== AXIOS ERROR INTERCEPTOR ===');
        console.log('Error status:', error.response?.status);
        console.log('Error headers:', error.response?.headers);
        console.log('Error data:', error.response?.data);
        console.log('Error message:', error.message);
        console.log('Error config:', error.config);
        return Promise.reject(error);
    }
);

// Send login request
const login = async (data) => {
    console.log('=== AUTH SERVICE LOGIN ===');
    console.log('Login data:', data);
    console.log('About to make request to:', '/auth/login');
    console.log('With baseURL:', API.defaults.baseURL);
    console.log('Final URL should be:', `${API.defaults.baseURL}/auth/login`);

    try {
        const res = await API.post('/auth/login', data);

        console.log('Login response:', res.data);
        console.log('Token received:', res.data.token ? 'Yes' : 'No');
        console.log('User data received:', res.data.user || 'Not in user field');

        if (!res.data.user && res.data.token) {
            console.log('Checking if user data is in root response...');
            try {
                const tokenPayload = JSON.parse(atob(res.data.token.split('.')[1]));
                console.log('Token payload:', tokenPayload);
            } catch (e) {
                console.log('Could not decode token:', e.message);
            }
        }

        return res.data;
    } catch (error) {
        console.error('Login service error:', error.response?.data || error.message);
        throw error;
    }
};

// Send register request
const register = async (data) => {
    console.log('=== AUTH SERVICE REGISTER ===');
    console.log('Register data:', data);

    try {
        const res = await API.post('/auth/register', data);
        console.log('Register response:', res.data);
        console.log('Token received:', res.data.token ? 'Yes' : 'No');
        console.log('User data received:', res.data.user || 'Not in user field');

        return res.data;
    } catch (error) {
        console.error('Register service error:', error.response?.data || error.message);
        throw error;
    }
}; 

const authService = { login, register };

export default authService;