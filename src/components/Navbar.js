import React  from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { logout as logoutAction } from "../redux/authSlice";

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token, user } = useSelector((state) => state.auth);

    const logout = () => {
        dispatch(logoutAction());
        navigate('/login');
    };

    return (
        <nav style={{ padding: '1em', backgroundColor: '#eee'  }}>
            <Link to="/">Home</Link>
            { token ? (
                <>
                <Link to="/dashboard" style={{ marginLeft: '1em' }}>Dashboard</Link>
                {user && user.role === 'admin' && (
                     <Link to="/admin" style={{ marginLeft: '1em' }}>Admin</Link>
                )}
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