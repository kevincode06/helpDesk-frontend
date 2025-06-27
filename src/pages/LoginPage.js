import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { token, user, loading, error } = useSelector((s) => s.auth);


    // DEBUG LOGS - ADD THESE TO SEE WHAT'S IN YOUR TOKEN
   console.log('Token:', token);
   console.log('User:', user);

   useEffect (() => {
    if (token && user) {
        if (user.role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/dashboard');
        }
    }

   }, [token, user, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(login({ email, password }))
        .unwrap()
        .then(() => toast.success('Logged in'))
        .catch((err) => toast.error(err.message || 'Something went wrong'));
    };

    return (
        <div className="login-page">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
            {/* Email and Password Inputs */}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
        </form>
        {error && <p style={{ color: 'Red'}}>{error}</p>} {/* Show error */}
        <p>No account? <Link to="/register">Register</Link></p>
        </div>
    );
}


export default LoginPage;