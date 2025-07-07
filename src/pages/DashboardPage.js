import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from 'react-router-dom';
import { logout } from "../redux/authSlice";
import './DashboardPage.css';

const DashboardPage = () => {
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [tickets, setTickets] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        priority: 'medium',
    });

    // fetch user's tickets
    useEffect(() => {
        const fetchUserTickets = async () => {
            try {
                setLoading(true);
                console.log('Fetching tickets with token:', token ? 'Token present' : 'No token');
                
                const response = await fetch('http://localhost:5000/api/v1/tickets/my-tickets', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                console.log('Fetch tickets response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched tickets data:', data);
                    setTickets(Array.isArray(data.tickets) ? data.tickets : []);
                } else {
                    console.error('Failed to fetch tickets, status:', response.status);
                    setError('Failed to fetch tickets');
                }
            } catch (err) {
                console.error('Error fetching tickets:', err);
                setError('Error fetching tickets: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserTickets();
    }, [token]);

    const handleCreateTicket = async (e) => {
        e.preventDefault();

        try {
            console.log('Using token:', token ? 'Token present' : 'No token');
            console.log('Creating ticket:', newTicket);
            
            const response = await fetch('http://localhost:5000/api/v1/tickets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }, 
                body: JSON.stringify(newTicket)
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                const responseData = await response.json();
                console.log('Full response data:', responseData);
                
                const createdTicket = responseData.ticket || responseData.data || responseData;
                console.log('Created ticket:', createdTicket);
                
                setTickets([createdTicket, ...(tickets || [])]);
                setNewTicket({ title: '', description: '', priority: 'medium' });
                setShowCreateForm(false);
                setError(null); // Clear previous errors
                
                console.log('Ticket created successfully!');
            } else {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                setError(errorData.message || `Failed to create ticket (Status: ${response.status})`);
            } 
        } catch (err) {
            console.error('Network/Fetch error:', err);
            setError('Network error creating ticket: ' + err.message);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ff4757';
            case 'medium': return '#ffa502';
            case 'low': return '#2ed573';
            default: return '#747d8c';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return '#3742fa';
            case 'in-progress': return '#ffa502';
            case 'resolved': return '#2ed573';
            case 'closed': return '#747d8c';
            default: return '#747d8c';
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading">loading your tickets...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="user-info">
                    <h1>Welcome back, {user?.name}!</h1>
                    <p>Manage your support tickets</p>
                </div>
                <div className="header-action">
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="btn btn-admin">Admin Dashboard</Link>
                    )}
                    <button onClick={handleLogout} className="btn btn-logout">Logout</button>
                </div>
            </div>
            {error && (
                <div className="error-message">
                    {error} 
                    <button onClick={() => setError(null)}>x</button>
                </div>
            )}

            <div className="dashboard-container">
                <div className="tickets-section">
                    <h2>My Tickets ({tickets?.length || 0})</h2>
                    <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn btn-primary">
                        {showCreateForm ? 'Cancel' : ' +New Ticket'}
                    </button>
                </div>
                {showCreateForm && (
                    <div className="create-ticket-form">
                        <h3>Create New Ticket</h3>
                        <form onSubmit={handleCreateTicket}>
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input 
                                    type="text"
                                    id="title"
                                    value={newTicket.title}
                                    onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                                    required
                                    placeholder="Brief description of your issue"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea 
                                    id="description"
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                                    required
                                    rows="4"
                                    placeholder="Detailed description of your issue"
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label htmlFor="priority">Priority</label>
                                <select 
                                    id="priority"
                                    value={newTicket.priority}
                                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                    Create Ticket
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="tickets-list">
                    {!tickets || tickets.length === 0 ? (
                        <div className="no-tickets">
                            <h3>No tickets yet</h3>
                            <p>Create your first support ticket to get started.</p>
                        </div>
                    ) : (
                        tickets.map((ticket, index) => ( 
                            <div key={ticket._id || ticket.id || index} className="ticket-card">
                                <div className="ticket-header">
                                    <h3>
                                        <Link to={`/tickets/${ticket._id || ticket.id}`}>
                                            {ticket.title}
                                        </Link>
                                    </h3>
                                    <div className="ticket-meta">
                                        <span className="priority-badge" style={{ backgroundColor: getPriorityColor(ticket.priority) }}>
                                            {ticket.priority}
                                        </span>
                                        <span className="status-badge" style={{backgroundColor: getStatusColor(ticket.status) }}>
                                            {ticket.status || 'open'}
                                        </span>
                                    </div>
                                </div>

                                <p className="ticket-description">
                                    {ticket.description?.length > 100 ? `${ticket.description.substring(0, 100)}...` : ticket.description}
                                </p>

                                <div className="ticket-footer">
                                    <span className="ticket-date">
                                        created: {ticket.createdAt || ticket.created_at ? new Date(ticket.createdAt || ticket.created_at).toLocaleDateString() : 'N/A'}
                                    </span>
                                    <Link to={`/tickets/${ticket._id || ticket.id}`} className="btn btn-small">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;