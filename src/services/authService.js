import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
        console.log('Request with token:', token.substring(0, 20) + '...');
    }
    return req;
});

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

// Send login request

const login = async (data) => {
    console.log('=== AUTH SERVICE LOGIN ===');
    console.log('Login data:', data);

    try {
        const res = await API.post('/auth/login',data);

        console.log('Login response:', res.data);
        console.log('Token received:', res.data.token ? 'Yes' : 'No');
        console.log('User data received:', res.data.user || 'Not in user field');


        // user data is not a user.

        if (!res.data.user && res.data.token) {
            console.log('Checking if user data is in root response...');
            // to decode the token to see what is in it 
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


// send register request

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

export default authService
