// configure the redux store with reducers

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import ticketReducer from './ticketSlice';

// create & export the store
export const store = configureStore({
    reducer: {
        auth: authReducer,
        tickets: ticketReducer,
    },
});

