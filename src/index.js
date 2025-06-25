import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Render the app and ToastContainer at the root of the DOM
ReactDOM.render(
  <>
    <App />
    <ToastContainer />
  </>,
  document.getElementById('root')
);