import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from 'react-router-dom';
import { logout } from "../redux/authSlice";
import AIChat from '../components/AIChat';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [tickets, setTickets] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showAIChat, setShowAIChat] = useState(false);
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        priority: 'medium',
    });

    const [messageInputs, setMessageInputs] = useState({});
    const [messageLoading, setMessageLoading] = useState({});

    // Helper function to handle API responses with better debugging
    const handleApiResponse = async (response, endpoint = 'unknown') => {
        console.log(`API Response for ${endpoint}:`, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            url: response.url
        });

        const contentType = response.headers.get('content-type');
        
        // Always get the response text first to avoid consuming the stream
        const responseText = await response.text();
        
        if (!response.ok) {
            console.error(`API Error for ${endpoint}:`, {
                status: response.status,
                statusText: response.statusText,
                responseText: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
                contentType
            });
            
            // Try to parse as JSON if content type suggests it
            if (contentType && contentType.includes('application/json')) {
                try {
                    const errorData = JSON.parse(responseText);
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                } catch (parseError) {
                    console.error('Failed to parse error response as JSON:', parseError);
                    throw new Error(`Server error (${response.status}): ${response.statusText}`);
                }
            } else {
                // If we get HTML instead of JSON, it's likely a server error
                throw new Error(`Server error (${response.status}): Received HTML instead of JSON. Check server logs.`);
            }
        }
        
        // Check if response is JSON
        if (!contentType || !contentType.includes('application/json')) {
            console.error(`Expected JSON but got ${contentType || 'unknown content type'} for ${endpoint}:`, responseText.substring(0, 500));
            throw new Error(`Server returned non-JSON response (${contentType || 'unknown'})`);
        }
        
        try {
            return JSON.parse(responseText);
        } catch (parseError) {
            console.error(`Failed to parse JSON response for ${endpoint}:`, parseError);
            console.error('Response text:', responseText.substring(0, 1000));
            throw new Error('Invalid JSON response from server');
        }
    };

    // Fetch user tickets
    useEffect(() => {
        const fetchUserTickets = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/api/v1/tickets/my-tickets', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                const data = await handleApiResponse(response, 'my-tickets');
                setTickets(Array.isArray(data.tickets) ? data.tickets : []);
                setError(null);
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
            const response = await fetch('http://localhost:5000/api/v1/tickets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTicket)
            });

            const responseData = await handleApiResponse(response, 'create-ticket');
            const createdTicket = responseData.ticket || responseData;
            setTickets([createdTicket, ...(tickets || [])]);
            setNewTicket({ title: '', description: '', priority: 'medium' });
            setShowCreateForm(false);
            setError(null);
        } catch (err) {
            console.error('Error creating ticket:', err);
            setError('Error creating ticket: ' + err.message);
        }
    };

    const handleSendMessage = async (ticketId) => {
        const message = messageInputs[ticketId]?.trim();
        if (!message) return;

        setMessageLoading(prev => ({ ...prev, [ticketId]: true }));

        try {
            const response = await fetch('http://localhost:5000/api/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ticketId,
                    message
                })
            });

            await handleApiResponse(response, 'send-message');
            setMessageInputs(prev => ({ ...prev, [ticketId]: '' }));
            setError(null);
            // Optional: You might want to show a success message or refresh ticket data
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Message send failed: ' + err.message);
        } finally {
            setMessageLoading(prev => ({ ...prev, [ticketId]: false }));
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

    const handleAIHelp = () => {
        setShowAIChat(!showAIChat);
    };

    const handleAITicketSuggestion = (suggestion) => {
        setNewTicket({
            title: suggestion.title || '',
            description: suggestion.description || '',
            priority: suggestion.priority || 'medium'
        });
        setShowCreateForm(true);
        setShowAIChat(false);
    };

    if (loading) {
        return <div className="dashboard-container"><div className="loading">Loading your tickets...</div></div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="user-info">
                    <h1>Welcome back, {user?.name}!</h1>
                    <p>Manage your support tickets</p>
                </div>
                <div className="header-actions">
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="btn btn-admin">Admin Dashboard</Link>
                    )}
                    <button onClick={handleAIHelp} className="btn btn-ai">
                        {showAIChat ? 'Close AI Help' : 'AI Help'}
                    </button>
                    <button onClick={handleLogout} className="btn btn-logout">Logout</button>
                </div>
            </div>

            {error && <div className="error-message">{error} <button onClick={() => setError(null)}>×</button></div>}

            {showAIChat && (
                <div className="ai-chat-container">
                    <AIChat
                        user={user}
                        tickets={tickets}
                        onTicketSuggestion={handleAITicketSuggestion}
                        onClose={() => setShowAIChat(false)}
                    />
                </div>
            )}

            <div className="dashboard-content">
                <div className="tickets-section">
                    <div className="section-header">
                        <h2>My Tickets ({tickets?.length || 0})</h2>
                        <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn btn-primary">
                            {showCreateForm ? 'Cancel' : '+ New Ticket'}
                        </button>
                    </div>
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
                                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="priority">Priority</label>
                                <select
                                    id="priority"
                                    value={newTicket.priority}
                                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">Create Ticket</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="tickets-list">
                    {(!tickets || tickets.length === 0) ? (
                        <div className="no-tickets">
                            <h3>No tickets yet</h3>
                            <p>Create your first support ticket to get started.</p>
                        </div>
                    ) : (
                        tickets.map((ticket) => (
                            <div key={ticket._id} className="ticket-card">
                                <div className="ticket-header">
                                    <h3>
                                        <Link to={`/tickets/${ticket._id}`}>{ticket.title}</Link>
                                    </h3>
                                    <div className="ticket-meta">
                                        <span className="priority-badge" style={{ backgroundColor: getPriorityColor(ticket.priority) }}>
                                            {ticket.priority}
                                        </span>
                                        <span className="status-badge" style={{ backgroundColor: getStatusColor(ticket.status) }}>
                                            {ticket.status || 'open'}
                                        </span>
                                    </div>
                                </div>
                                <p className="ticket-description">{ticket.description}</p>
                                <div className="ticket-footer">
                                    <span className="ticket-date">Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                    <Link to={`/tickets/${ticket._id}`} className="btn btn-small">View Details</Link>
                                </div>

                                {/* FIX: Removed unnecessary key prop - the parent div already has the key */}
                                <div className="message-input-section">
                                    <textarea
                                        rows="2"
                                        placeholder="Write a message..."
                                        value={messageInputs[ticket._id] || ''}
                                        onChange={(e) =>
                                            setMessageInputs(prev => ({
                                                ...prev,
                                                [ticket._id]: e.target.value
                                            }))
                                        }
                                        disabled={messageLoading[ticket._id]}
                                    />
                                    <button
                                        onClick={() => handleSendMessage(ticket._id)}
                                        disabled={messageLoading[ticket._id]}
                                        className="btn btn-small"
                                    >
                                        {messageLoading[ticket._id] ? 'Sending...' : 'Send'}
                                    </button>
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