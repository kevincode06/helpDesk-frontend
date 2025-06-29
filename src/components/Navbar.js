import React  from "react";
import { Link } from 'react-router-dom';
import { useSelector } from "react-redux";


const Navbar = () => {

    const { token, user } = useSelector((state) => state.auth);

    

    return (
        <nav style={{ padding: '1em', backgroundColor: '#eee'  }}>
            <Link to="/">Home</Link>
            { token ? (
                <>
                <Link to="/dashboard" style={{ marginLeft: '1em' }}>Dashboard</Link>
                {user && user.role === 'admin' && (
                     <Link to="/admin" style={{ marginLeft: '1em' }}>Admin</Link>
                )}
                
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