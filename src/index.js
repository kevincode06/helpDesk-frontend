import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const container = document.getElementById('root');
const root = createRoot(container);

// Render the app and ToastContainer at the root of the DOM
root.render(
  <>
    <App />
    <ToastContainer />
  </>
);