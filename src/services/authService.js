import axios from 'axios';
const API_URL = '/api/v1/auth/';

// Send login request

const login = async (data) => {
    const res = await axios.post(API_URL + 'login', data);
    return res.data;
};

// send register request 

const register = async (data) => {
    const res = await axios.post(API_URL + 'register', data);
    return res.data;
};

export default { login, register };