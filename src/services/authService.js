import axios from 'axios';



const API = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});


// Send login request

const login = async (data) => {
    const res = await API.post('/auth/login', data);
    return res.data;
};

// send register request 

const register = async (data) => {
    const res = await API.post('/auth/register', data);
    return res.data;
};

const authService = { login, register };

export default authService
