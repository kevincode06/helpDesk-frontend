import React from "react";
import {Link } from 'react-router-dom';
import '../style/global.css';


const LandingPage = () => (
    <div className="container">
        <h1>Welcome to K-TECH Help Desk</h1>
        <p>Submit and track support ticket with us </p>
        <Link to="/register"><button style={{ marginLeft: '1em'}}>Submit a ticket</button></Link>
    </div>
)


export default LandingPage; 