import React  from "react";
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav style={{ padding: '1em', backgroundColor: '#eee'  }}>
            <Link to="/">Home</Link>
            { token ? (
                <>
                <Link to="/dashboard" style={{ marginLeft: '1em' }}>Dashboard</Link>
                <Link to="/admin" style={{ marginLeft: '1em' }}>Admin</Link>
                <button style={{float: 'right' }} onClick={logout}>Logout</button>
                </>
) : (

    <>
    <Link to="/login" style={{ marginLeft: '1em' }}>Login</Link>
    </>
)}
   </nav>
  );
};

export default Navbar;