import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance for AI endpoints
const AI_API = axios.create({
    baseURL: `${API_URL}/ai`
});

// Add request interceptor to include token
AI_API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Send chat message to AI
const sendChatMessage = async (message, conversationHistory = []) => {
    try {
        const response = await AI_API.post('/chat', {
            message,
            conversationHistory
        });
        return response.data;
    } catch (error) {
        console.error('AI Chat error:', error.response?.data || error.message);
        throw error;
    }
};

// Get conversation suggestions
const getSuggestions = async () => {
    try {
        const response = await AI_API.get('/suggestions');
        return response.data;
    } catch (error) {
        console.error('AI Suggestions error:', error.response?.data || error.message);
        throw error;
    }
};

// Send feedback on AI response
const sendFeedback = async (messageId, rating, feedback = '') => {
    try {
        const response = await AI_API.post('/feedback', {
            messageId,
            rating,
            feedback
        });
        return response.data;
    } catch (error) {
        console.error('AI Feedback error:', error.response?.data || error.message);
        throw error;
    }
};

const aiService = {
    sendChatMessage,
    getSuggestions,
    sendFeedback
};

export default aiService;