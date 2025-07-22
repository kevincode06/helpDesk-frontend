import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ticketService from '../services/ticketService';

// Initial state
const initialState = {
    tickets: [],
    ticket: null,
    stats: null,
    loading: false,
    aiLoading: false,
    error: null,
    aiError: null,
};

// Get single ticket
export const getTicket = createAsyncThunk(
    'ticket/get', 
    async (id, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            return await ticketService.getTicket(id, token);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Create a ticket
export const createTicket = createAsyncThunk(
    'tickets/create', 
    async (data, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            return await ticketService.createTicket(data, token);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Fetch all tickets for current user
export const getMyTickets = createAsyncThunk(
    'ticket/my', 
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            return await ticketService.getMyTickets(token);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Update ticket
export const updateTicket = createAsyncThunk(
    'tickets/update', 
    async ({ id, data }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            return await ticketService.updateTicket(id, data, token);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Generate AI response
export const generateAIResponse = createAsyncThunk(
    'tickets/ai-response', 
    async (id, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            return await ticketService.generateAIResponse(id, token);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get ticket statistics
export const getTicketStats = createAsyncThunk(
    'tickets/stats', 
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            return await ticketService.getTicketStats(token);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Ticket slice
const ticketSlice = createSlice({
    name: 'tickets',
    initialState,
    reducers: {
        reset: () => initialState,
        clearError: (state) => {
            state.error = null;
            state.aiError = null;
        },
        clearAIError: (state) => {
            state.aiError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create ticket
            .addCase(createTicket.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTicket.fulfilled, (state, action) => {
                state.loading = false;
                state.tickets.push(action.payload);
                state.ticket = action.payload;
            })
            .addCase(createTicket.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Get my tickets
            .addCase(getMyTickets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyTickets.fulfilled, (state, action) => {
                state.loading = false;
                state.tickets = action.payload;
            })
            .addCase(getMyTickets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Get single ticket
            .addCase(getTicket.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTicket.fulfilled, (state, action) => {
                state.loading = false;
                state.ticket = action.payload;
            })
            .addCase(getTicket.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Update ticket
            .addCase(updateTicket.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTicket.fulfilled, (state, action) => {
                state.loading = false;
                state.ticket = action.payload;
                
                // Update ticket in tickets array if it exists
                const index = state.tickets.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.tickets[index] = action.payload;
                }
            })
            .addCase(updateTicket.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Generate AI response
            .addCase(generateAIResponse.pending, (state) => {
                state.aiLoading = true;
                state.aiError = null;
            })
            .addCase(generateAIResponse.fulfilled, (state, action) => {
                state.aiLoading = false;
                
                // Update current ticket with AI response
                if (state.ticket && action.payload.data) {
                    state.ticket = action.payload.data;
                }
                
                // Update ticket in tickets array if it exists
                if (action.payload.data) {
                    const index = state.tickets.findIndex(t => t._id === action.payload.data._id);
                    if (index !== -1) {
                        state.tickets[index] = action.payload.data;
                    }
                }
            })
            .addCase(generateAIResponse.rejected, (state, action) => {
                state.aiLoading = false;
                state.aiError = action.payload;
            })
            
            // Get ticket stats
            .addCase(getTicketStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTicketStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(getTicketStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { reset, clearError, clearAIError } = ticketSlice.actions;
export default ticketSlice.reducer;