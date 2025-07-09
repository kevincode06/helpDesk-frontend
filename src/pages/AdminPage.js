import React, {useState, useEffect, useCallback } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout} from '../redux/authSlice';
import './AdminPage.css';

const AdminPage = () => {
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalTickets: 0,
        openTickets: 0,
        awaitingResponseTickets: 0,
        resolvedTickets: 0,
        totalUsers: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');

    const calculateStatsFromData = useCallback(() => {
        const totalTickets = tickets.length;
        const openTickets = tickets.filter(t => t.status === 'open').length;
        const awaitingResponseTickets = tickets.filter(t => t.status === 'awaiting_response').length;
        const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
        const totalUsers = users.length;

        setStats({
            totalTickets,
            openTickets,
            awaitingResponseTickets,
            resolvedTickets,
            totalUsers
        });
    }, [tickets, users]); 

    useEffect(() => {
        if (tickets.length > 0 || users.length > 0) {
            calculateStatsFromData();
        }
    }, [tickets, users, calculateStatsFromData]);

    const fetchAllTickets = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/tickets`, {
                headers : {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        
            if (response.ok) {
                const data = await response.json();
                setTickets(data.data || []);
            } else {
                throw new Error('Failed to fetch tickets');
            }
        } catch (err) {
            console.error('Error fetching tickets:', err);
            setError('Failed to fetch tickets');
        }
    }, [token]); 

    const fetchAllUsers = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/users`, {
                headers : {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.data || []);
            } else {
                throw new Error('Failed to fetch users');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users');
        }
    }, [token]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/tickets/stats`, {
                headers : {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Process stats data to match our format
                const processedStats = {
                    totalTickets: 0,
                    openTickets: 0,
                    awaitingResponseTickets: 0,
                    resolvedTickets: 0,
                    closedTickets: 0,
                    totalUsers: users.length
                };

                if (data.data && Array.isArray(data.data)) {
                    data.data.forEach(stat => {
                        processedStats.totalTickets += stat.count;
                        switch(stat._id) {
                            case 'open':
                                processedStats.openTickets = stat.count;
                                break;
                            case 'awaiting_response':
                                processedStats.awaitingResponseTickets = stat.count;
                                break;
                            case 'resolved':
                                processedStats.resolvedTickets = stat.count;
                                break;
                            case 'closed':
                                processedStats.closedTickets = stat.count;
                                break;
                        }
                    });
                }

                setStats(processedStats);
            } else {
                throw new Error('Failed to fetch stats');
            } 
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError('Failed to fetch stats');
        }
    }, [token, users.length]);

    const fetchDashboardData = useCallback(async() => {
        try {
            setLoading(true);
            await Promise.all([
                fetchAllTickets(),
                fetchAllUsers()
            ]);
            // Fetch stats after tickets and users are loaded
            await fetchStats();
        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [fetchAllTickets, fetchAllUsers, fetchStats]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleTicketStatusUpdate = async (ticketId, newStatus) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/tickets/${ticketId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                const data = await response.json();
                setTickets(prevTickets =>
                    prevTickets.map(ticket => 
                        ticket._id === ticketId ? data.data : ticket
                    )
                );
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to update ticket status');
            } 
        } catch (err) {
            setError('Error updating ticket: ' + err.message);
        }
    };

    const handleDeleteTicket = async (ticketId) => {
        if (!window.confirm('Are you sure you want to delete this ticket?')) return;

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/tickets/${ticketId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                   'Content-Type': 'application/json'
               },
            });

            if (response.ok) {
                setTickets(prevTickets =>
                    prevTickets.filter(ticket => ticket._id !== ticketId)
                );
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to delete ticket');
            }
        } catch (err) {
            setError('Error deleting ticket: ' + err.message);
        }
    };

    const handleUserRoleUpdate = async (userId, newRole) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({ role: newRole })
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(prevUsers => 
                    prevUsers.map(u => 
                        u._id === userId ? data.data : u
                    )
                );
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to update user role');
            }
        } catch (err) {
            setError('Error updating user role: ' + err.message);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return '#ff4757';
            case 'medium': return '#ffa502';
            case 'low': return '#2ed573';
            default: return '#747d8c';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return '#3742fa';
            case 'awaiting_response': return '#ffa502';
            case 'resolved': return '#2ed573';
            case 'closed': return '#747d8c';
            default: return '#747d8c';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="admin-container">
                <div className="loading">Loading admin dashboard...</div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div className="admin-title">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome, {user?.name || 'Admin'}</p>
                </div>
                <div className="admin-actions">
                    <Link to="/dashboard" className="btn btn-secondary">User Dashboard</Link>
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <div className="admin-tabs">
                <button 
                    className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    Dashboard
                </button>
                <button 
                    className={`tab ${activeTab === 'tickets' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tickets')}
                >
                    All Tickets
                </button>
                <button 
                    className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
            </div>

            <div className="admin-content">
                {activeTab === 'dashboard' && (
                    <div className="dashboard-tab">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Tickets</h3>
                                <div className="stat-number">{stats.totalTickets}</div>
                            </div>
                            <div className="stat-card">
                                <h3>Open Tickets</h3>
                                <div className="stat-number" style={{color: '#3742fa'}}>{stats.openTickets}</div>
                            </div>
                            <div className="stat-card">
                                <h3>Awaiting Response</h3>
                                <div className="stat-number" style={{color: '#ffa502'}}>{stats.awaitingResponseTickets}</div>
                            </div>
                            <div className="stat-card">
                                <h3>Resolved</h3>
                                <div className="stat-number" style={{color: '#2ed573'}}>{stats.resolvedTickets}</div>
                            </div>
                            <div className="stat-card">
                                <h3>Total Users</h3>
                                <div className="stat-number">{stats.totalUsers}</div>
                            </div>
                        </div>
                        
                        <div className="recent-tickets">
                            <h2>Recent Tickets</h2>
                            {tickets.length === 0 ? (
                                <p>No tickets found</p>
                            ) : (
                                <div className="tickets-table">
                                    {tickets.slice(0, 10).map((ticket) => (
                                        <div key={ticket._id} className="ticket-row">
                                            <div className="ticket-info">
                                                <h4>
                                                    <Link to={`/tickets/${ticket._id}`}>
                                                        {ticket.title || 'Untitled Ticket'}
                                                    </Link>
                                                </h4>
                                                <p>By: {ticket.user?.name || 'Unknown'}</p>
                                                <p>Created: {formatDate(ticket.createdAt)}</p>
                                            </div>
                                            <div className="ticket-meta">
                                                <span className="priority-badge" style={{backgroundColor: getPriorityColor(ticket.priority)}}> 
                                                    {ticket.priority || 'medium'}
                                                </span>
                                                <span className="status-badge" style={{backgroundColor: getStatusColor(ticket.status)}}> 
                                                    {ticket.status || 'open'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'tickets' && (
                    <div className="tickets-tab">
                        <div className="tab-header">
                            <h2>All Tickets ({tickets.length})</h2>
                            <button onClick={fetchAllTickets} className="btn btn-secondary" disabled={loading}>
                                Refresh
                            </button>
                        </div>

                        {tickets.length === 0 ? (
                            <p>No tickets found.</p>
                        ) : (
                            <div className="tickets-table">
                                {tickets.map((ticket) => (
                                    <div key={ticket._id} className="admin-ticket-card">
                                        <div className="ticket-header">
                                            <h3>
                                                <Link to={`/tickets/${ticket._id}`}>
                                                    {ticket.title || 'Untitled Ticket'}
                                                </Link>
                                            </h3>
                                            <div className="ticket-actions">
                                                <select 
                                                    value={ticket.status || 'open'}
                                                    onChange={(e) => handleTicketStatusUpdate(ticket._id, e.target.value)}
                                                    className="status-select"
                                                >
                                                    <option value="open">Open</option>
                                                    <option value="awaiting_response">Awaiting Response</option>
                                                    <option value="resolved">Resolved</option>
                                                    <option value="closed">Closed</option>
                                                </select>
                                                <button 
                                                    onClick={() => handleDeleteTicket(ticket._id)}
                                                    className="btn btn-danger btn-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        <div className="ticket-body">
                                            <p><strong>Description:</strong> {ticket.description || 'No description provided'}</p>
                                            <p><strong>Created by:</strong> {ticket.user?.name || 'Unknown'}</p>
                                            <p><strong>Created:</strong> {formatDate(ticket.createdAt)}</p>
                                            <p><strong>Last Update:</strong> {formatDate(ticket.updatedAt)}</p>
                                            <p><strong>Messages:</strong> {ticket.conversation?.length || 0}</p>
                                        </div>
                                        <div className="ticket-meta">
                                            <span 
                                                className="priority-badge" 
                                                style={{backgroundColor: getPriorityColor(ticket.priority)}}
                                            > 
                                                {ticket.priority || 'medium'}
                                            </span>
                                            <span 
                                                className="status-badge" 
                                                style={{backgroundColor: getStatusColor(ticket.status)}}
                                            > 
                                                {ticket.status || 'open'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="users-tab">
                        <div className="tab-header">
                            <h2>All Users ({users.length})</h2>
                            <button onClick={fetchAllUsers} className="btn btn-secondary" disabled={loading}>
                                Refresh
                            </button>
                        </div>
                        {users.length === 0 ? (
                            <p>No users found.</p>
                        ) : (
                            <div className="users-table">
                                {users.map((user) => (
                                    <div key={user._id} className="user-card">
                                        <div className="user-info">
                                            <h3>{user.name || 'Unknown User'}</h3>
                                            <p>Email: {user.email || 'No email provided'}</p>
                                            <p>Joined: {formatDate(user.createdAt)}</p>
                                        </div>
                                        <div className="user-actions">
                                            <select 
                                                value={user.role || 'user'}
                                                onChange={(e) => handleUserRoleUpdate(user._id, e.target.value)} 
                                                className="role-select"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                <option value="moderator">Moderator</option>
                                            </select>
                                        </div>
                                        <div className="user-meta">
                                            <span className={`role-badge role-${user.role || 'user'}`}>
                                                {user.role || 'user'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;