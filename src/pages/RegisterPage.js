import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../redux/authSlice';
import { Navigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';


function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const dispatch = useDispatch();
    const { token, loading, error } = useSelector((s) => s.auth);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(register({ ...form, role: 'user' }))
        .unwrap()
        .then(() => toast.success('Registered successfully '))
        .catch((err) => toast.error(err.message || 'Something went wrong'));
    };


    if (token) return <Navigate to="/dashboard" />
 
    return (
        <div className="Register-page">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
            <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value })} required />
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value})} required />
            <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            <button disabled={loading}>{loading ? 'Loading...' : 'Register'}</button>
        </form>
        {error && <p style={{ color: 'Red'}}>{error}</p>} {/* Show error */}
        <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    );
}


export default RegisterPage