import { createSlice, createAsyncThunk, } from "@reduxjs/toolkit";
import authService from '../services/authService';

// to decode JWT token from Local Storage
const decodeToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded JWT payload:', payload);
        return payload;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};


const token = localStorage.getItem('token');
const userData = localStorage.getItem('user');
console.log('Token:', token);
console.log('Stored User Data:', userData);



// initial auth state. 

const initialState = {
    token: token || null,
    user: userData ? JSON.parse(userData) : null,
    loading: false,
    error: null,
};

// to log in the user

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
    try {
        const response = await authService.login(credentials);
        console.log('== LOGIN SERVICE RESPONSE ===');
        console.log('Full response:', response);
        return response;
    } catch (err) {
        console.error('Login error:', err);
        return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
});

// to register the user

export const register = createAsyncThunk('auth/register', async (data, thunkAPI) => {
    try {
        const response = await authService.register(data);
        console.log('==  REGISTER SERVICE RESPONSE ===');
        console.log('Full response:', response);
        return response;
    } catch (err) {
        console.error('Register error:', err);
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
            localStorage.removeItem('user');
            state.token = null;
            state.user = null;
            state.error = null;
        },
        clearError(state) {
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder 
        // login 
        .addCase(login.pending, (state) => {
             state.loading = true; 
             state.error = null;
             })
        .addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;

            console.log('=== LOGIN FULFILLED ===');
            console.log('Action payload:', action.payload);

            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);
           

            let userData = null;

            // user data

            if (action.payload.user) {
                userData = action.payload.user;
                console.log('User data from responses.user:', userData);
            }

            // user data from decoded token
            else if (action.payload.token) {
                const decoded = decodeToken(action.payload.token);
                if (decoded) {
                    userData = {
                        id: decoded.userId || decoded.id,
                        name: decoded.name,
                        email: decoded.email,
                        role: decoded.role
                    };
                    console.log('User data from decoded token:', userData);
                }
            }
            
            // fallback 

            else {
                userData = action.payload;
                console.log('User Data from entire payload:', userData);
            }

            if (userData) {
                state.user = userData;
                localStorage.setItem('user', JSON.stringify(userData));

                console.log('=== FINAL USER DATA ===');
                console.log('User stored in state:', state.user);
                console.log('User role:', state.user.role);
                console.log('Is admin?:', state.user.role === 'admin');
                console.log('=======================');
            } else {
                console.error('No user data found in login response!');
            }
        })

        
        .addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.token = null;
            state.user = null;
        })
        

        // register 

        .addCase(register.pending, (state) => {
            state.loading = true;
            state.error = null;
        })

        .addCase(register.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;

            console.log('=== REGISTER FULFILLED ===');
            console.log('Action payload:', action.payload);


            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);

            let userData = null;

            if (action.payload.user) {
                userData = action.payload.user;
            } else if (action.payload.token) {
                const decoded = decodeToken(action.payload.token);
                if (decoded) {
                    userData = {
                        id: decoded.userId || decoded.id,
                        name: decoded.name,
                        email: decoded.email,
                        role: decoded.role
                    };
                }
            } else {
                userData = action.payload;
            }

            if (userData) {
                state.user = userData
                localStorage.setItem('user', JSON.stringify(userData));
                console.log('Register - User stored:', state.user);
            }
            
        })

        .addCase(register.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.token = null;
            state.user = null;
        });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;