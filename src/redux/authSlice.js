import { createSlice, createAsyncThunk  } from "@reduxjs/toolkit";

import authService from '../services/authService';

// to decode JWT token from Local Storage

const token = localStorage.getItem('token');
const user = token ? JSON.parse(atob(token.split('.')[1])) : null;

// initial auth state. 

const initialState = {
    token: token || null,
    user: user || null,
    loading: false,
    error: null,
};

// to log in the user

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
    try {
        return await authService.login(credentials); 
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
});

// to register the user

export const register = createAsyncThunk('auth/register', async (data, thunkAPI) => {
    try {
        return await authService.register(data);
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
});

// auth definition 

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // reduce to log out & clear localstorage
        logout(state) {
            localStorage.removeItem('token');
            state.token = null;
            state.user = null;
        },
    },

    extraReducers: (builder) => {
        builder 
        // login 
        .addCase(login.pending, (state) => {
             state.loading = true; state.error = null;
             })
        .addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);
            state.user = JSON.parse(atob(action.payload.token.split('.')[1]));
        })
        .addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        // register 

        .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(register.fulfilled, (state, action) => {
            state.loading = false;
            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);
            state.user = JSON.parse(atob(action.payload.token.split('.')[1]));
        })
        .addCase(register.rejected, (state, action) =>{
            state.loading = false;
            state.error = action.payload;
        });


    },

});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
