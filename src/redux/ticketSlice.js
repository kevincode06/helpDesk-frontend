import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ticketService from '../services/ticketService';

// 

const initialSlate = {
    tickets: [],
    ticket: null,
    loading: false,
    error: null,
};

// create a ticket 

export const createTicket = createAsyncThunk('tickets/create', async (data, thunkAPI) => {
    const token = thunkAPI.getState().auth.token; 
    return ticketService.createTicket(data, token);
});

// fetch all tickets for current user

export const getMyTickets = createAsyncThunk('ticket/my', async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token; 
    return ticketService.getMyTicket(token);
});

// update ticket

export const closeTicket = createAsyncThunk('tickets/close', async ({id, statusData}, thunkAPI) => {
    const token = thunkAPI.getState().auth.token; 
    return ticketService.updateTicket(id, statusData, token);
});

// ticket slice 

const ticketSlice = createSlice({
    name: 'tickets',
    initialState,
    reducers: {
        rest: () => initialSlate, 
    },
    extraReducers: (builder) => {
        builder
        .addCase(createTicket.pending, (state) => { state.loading = true; })
        .addCase(closeTicket.fulfilled, (state, action) => {
            state.loading = false;
            state.tickets.push(action.payload);
        })
        .addCase(createTicket.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(createTicket.pending, (state) => { state.loading = true; })
        .addCase(closeTicket.fulfilled, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(getMyTickets.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(getMyTickets.fulfilled, (state, action) => {
            state.ticket = action.payload;
        }) 


        .addCase(closeTickets.fulfilled, (state, action) => {
            state.ticket = action.payload;
        });
        


    },
});

export const { rest } = ticketSlice.actions;
export default ticketSlice.reducer