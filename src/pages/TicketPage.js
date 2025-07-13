import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getTicket, updateTicket, generateAIResponse, clearAIError } from "../redux/ticketSlice";
import './TicketPage.css';

const TicketPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { ticket, loading, aiLoading, error, aiError } = useSelector((state) => state.tickets);

    const [submittingMessage, setSubmittingMessage] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [statusUpdating, setStatusUpdating] = useState(false);

    const fetchTicketDetails = useCallback(() => {
        if (id) {
            dispatch(getTicket(id));
        }
    }, [id, dispatch]);

    useEffect(() => {
        fetchTicketDetails();
    }, [fetchTicketDetails]);

    const handleAddMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSubmittingMessage(true);
        try {
            await dispatch(updateTicket({ 
                id, 
                data: { message: newMessage } 
            })).unwrap();
            setNewMessage('');
        } catch (error) {
            console.error('Error adding message:', error);
        } finally {
            setSubmittingMessage(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setStatusUpdating(true);
        try {
            await dispatch(updateTicket({ 
                id, 
                data: { status: newStatus } 
            })).unwrap();
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleAIResponse = async () => {
        dispatch(clearAIError());
        try {
            await dispatch(generateAIResponse(id)).unwrap();
        } catch (error) {
            console.error('AI Error:', error);
        }
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
            case 'awaiting_response': return '#ffa502';
            case 'resolved': return '#2ed573';
            case 'closed': return '#747d8c';
            default: return '#747d8c';
        }
    };

    const getSenderBadgeColor = (sender) => {
        switch (sender) {
            case 'user': return '#3742fa';
            case 'ai': return '#2ed573';
            case 'admin': return '#ff4757';
            default: return '#747d8c';
        }
    };

    const formatSenderName = (sender) => {
        switch (sender) {
            case 'user': return 'You';
            case 'ai': return 'AI Assistant';
            case 'admin': return 'Support Agent';
            default: return sender;
        }
    };

    const getSenderIcon = (sender) => {
        switch (sender) {
            case 'user': return '👤';
            case 'ai': return '🤖';
            case 'admin': return '🛠️';
            default: return '💬';
        }
    };

    if (loading) {
        return (
            <div className="ticket-container">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading ticket details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ticket-container">
                <div className="error-page">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="ticket-container">
                <div className="error-page">
                    <h2>Ticket Not Found</h2>
                    <p>The ticket you're looking for doesn't exist or you don't have permission to view it.</p>
                    <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="ticket-container">
            <div className="ticket-header">
                <div className="breadcrumb">
                    <Link to="/dashboard">Dashboard</Link>
                    <span> / </span>
                    <span>Ticket #{ticket._id?.slice(-6) || 'N/A'}</span>
                </div>

                <div className="ticket-actions">
                    {(user?.role === 'admin' || user?.id === ticket.user?._id) && (
                        <div className="status-action">
                            <label>Status:</label>
                            <select
                                value={ticket.status || 'open'}
                                onChange={(e) => handleStatusUpdate(e.target.value)}
                                className="status-select"
                                disabled={statusUpdating}
                            >
                                <option value="open">Open</option>
                                <option value="awaiting_response">Awaiting Response</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                            {statusUpdating && <span className="updating-text">Updating...</span>}
                        </div>
                    )}
                </div>
            </div>

            <div className="ticket-content">
                <div className="ticket-details">
                    <div className="ticket-title-section">
                        <h1>{ticket.title}</h1>
                        <div className="ticket-badges">
                            <span className="priority-badge" style={{ backgroundColor: getPriorityColor(ticket.priority) }}>
                                {ticket.priority || 'medium'} priority
                            </span>
                            <span className="status-badge" style={{ backgroundColor: getStatusColor(ticket.status) }}>
                                {ticket.status || 'open'}
                            </span>
                        </div>
                    </div>

                    <div className="ticket-meta">
                        <div className="meta-item">
                            <strong>Created by:</strong> {ticket.user?.name || 'Unknown'}
                        </div>
                        <div className="meta-item">
                            <strong>Email:</strong> {ticket.user?.email || 'Unknown'}
                        </div>
                        <div className="meta-item">
                            <strong>Created:</strong> {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                        <div className="meta-item">
                            <strong>Last updated:</strong> {new Date(ticket.updatedAt).toLocaleDateString()}
                        </div>
                    </div>

                    <div className="ticket-description">
                        <h3>Description</h3>
                        <p>{ticket.description}</p>
                    </div>
                </div>

                <div className="conversation-section">
                    <h3>Conversation ({ticket.conversation?.length || 0})</h3>

                    <div className="conversation-list">
                        {ticket.conversation && ticket.conversation.length > 0 ? (
                            ticket.conversation.map((message, index) => (
                                <div key={index} className={`message ${message.sender}`}>
                                    <div className="message-header">
                                        <span
                                            className="sender-badge"
                                            style={{ backgroundColor: getSenderBadgeColor(message.sender) }}
                                        >
                                            {getSenderIcon(message.sender)} {formatSenderName(message.sender)}
                                        </span>
                                        <span className="message-time">
                                            {new Date(message.sentAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="message-content">
                                        <p>{message.message}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-messages">No messages yet.</p>
                        )}
                    </div>

                    {ticket.status !== 'closed' && (
                        <>
                            <div className="ai-suggestion-box">
                                <button 
                                    onClick={handleAIResponse} 
                                    className="btn btn-secondary" 
                                    disabled={aiLoading}
                                >
                                    {aiLoading ? '🤖 Thinking...' : '🤖 Get AI Suggestion'}
                                </button>
                                {aiError && <p className="error-message">{aiError}</p>}
                            </div>

                            <form onSubmit={handleAddMessage} className="add-message-form">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    rows="3"
                                    required
                                    disabled={submittingMessage}
                                />
                                <button 
                                    type="submit" 
                                    disabled={submittingMessage || !newMessage.trim()} 
                                    className="btn btn-primary"
                                >
                                    {submittingMessage ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketPage;