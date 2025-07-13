import axios from "axios";

const API_URL = '/api/v1/tickets/';

// create a new ticket 
const createTicket = async (data, token) => {
    const res = await axios.post(API_URL, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data; 
};

// get all tickets for logged-in user
const getMyTickets = async (token) => {
    const res = await axios.get(API_URL + 'my-tickets', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
};

// get a ticket by ID
const getTicket = async (id, token) => {
    const res = await axios.get(API_URL + id, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
};

// update ticket 
const updateTicket = async (id, data, token) => {
    const res = await axios.put(API_URL + id, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
};

// Generate AI response for a ticket
const generateAIResponse = async (id, token) => {
    const res = await axios.post(API_URL + id + '/ai-response', {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Get ticket statistics (admin only)
const getTicketStats = async (token) => {
    const res = await axios.get(API_URL + 'stats', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
};

const ticketService = { 
    createTicket, 
    getMyTickets, 
    getTicket, 
    updateTicket, 
    generateAIResponse,
    getTicketStats
};

export default ticketService;
