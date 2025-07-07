import React, {useState, useEffect, useCallback} from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import './TicketPage.css';

const TicketPage = () => {
    const { id } = useParams();
    const { user, token } = useSelector((state) => state.auth);
    
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submittingComment, setSubmitComment] = useState(false);
    const [newComment, setNewComment] = useState('');

    const fetchTicketDetails = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/tickets/${id}`, {
                headers : {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTicket(data.ticket || data);
            } else if (response.status === 404) {
                setError('Ticket not found');
            } else if (response.status === 403) {
                setError('You do not have permission to view this ticket');
            } else {
                setError('Failed to fetch ticket details');
            }
        } catch (err) {
            setError('Error fetching tickets: ' + err.message);
        } finally {
            setLoading(false);
        } 
    }, [id, token]);



    const fetchComments = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/tickets/${id}/comments`, {
                headers: {
                     'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }, {id, token});

            if (response.ok) {
                const data = await response.json();
                setComments(data.comments || data || []);
            }
        } catch (err) {
            console.err('Error fetch comments:', err);
        }
    }, [id, token]);


    useEffect(() => {
        fetchTicketDetails();
        fetchComments();
    }, [fetchTicketDetails, fetchComments]);;


    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitComment(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/tickets/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({ content: newComment })
            });

            if (response.ok) {
                const data = await response.json();
                const newCommentData = data.comment || data;
                setComments([...comments, newCommentData]);
                setComments('');
        } else {
            const errorData = await response.json();
            setError(errorData.message || 'Failed to add comment');
        } 
    }  catch (err) {
        setError('Error Adding comment: ' + err.message);
    }  finally {
        setSubmitComment(false);
    }

    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/tickets/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                const data = await response.json();
                setTicket(data.ticket || { ...ticket, status: newStatus });
        } else {
            const errorData = await response.json();
            setError(errorData.message || 'Failed to update status');
        } 
        } catch (err) {
            setError('Error updating status: ' + err.message);
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
            case 'in-progress': return '#ffa502';
            case 'resolved': return '#2ed573';
            case 'closed': return '#747d8c';
            default: return '#747d8c';
        }
    };

    if (loading) {
        return (
            <div className="ticket-container">
                <div className="loading">Loading ticket details</div>
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
                    <p>The ticket you're looking for doesn't exist or you don't have permission to view it. </p>
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
                    <span>Ticket #{ticket._id?.slice(-6) || ticket}</span>
                </div>

                <div className="ticket-actions">
                    {(user?.role === 'admin' || user?.id === ticket.userId) && (
                        <div className="status-action">
                            <label>Status:</label>
                            <select value={ticket.status || 'open'} onChange={(e) => handleStatusUpdate(e.target.value)} className="status-select">
                                    <option value="open">Open</option>
                                    <option value="in-progress">In progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="close">Closed</option>
                            </select>
                        </div>
                    )}
                </div> 
            </div>

            <div className="ticket-content">
                <div className="ticket-details">
                    <div className="ticket-title-section">
                        <h1>{ticket.tile}</h1>
                        <div className="ticket-badges">
                            <span className="priority-badge" style={{ backgroundColor: getPriorityColor(ticket.priority) }}>
                                {ticket.priority} priority
                            </span>
                            <span className="status-badge" style={{ backgroundColor: getStatusColor(ticket.status) }}>
                                {ticket.status || 'open'}
                            </span>
                        </div>
                    </div>
                    <div className="ticket-meta">
                        <div className="meta-item">
                            <strong>Created by:</strong> {ticket.UserName || ticket.user?.name || 'Unknown'}
                        </div>
                        <div className="meta-item">
                        <strong>Created:</strong> {new Date(ticket.createdAt || ticket.created_at).toLocaleDateString()}
                        </div>
                        <div className="meta-item">
                        <strong>Last updated</strong> {new Date(ticket.UpdatedAt || ticket.created_at).toLocaleDateString()}
                        </div>
                    </div>

                    <div className="ticket-description">
                        <h3>Description</h3>
                        <p>{ticket.description}</p>
                    </div>
                </div>

                <div className="comments-section">
                    <h3>Comment ({comments.length})</h3>

                    <form onSubmit={handleAddComment} className="add-comment-form">
                        <textarea value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows="3"
                        required
                        ></textarea>
                        <button type="submit" disabled={submittingComment} className="btn btn-primary"> 
                            {submittingComment ? 'Adding..' : 'Add Comment'}
                        </button>
                    </form>

                    <div className="comments-list">
                        {comments.length === 0 ? (
                            <p className="no-comments">No comment yet. Be the first to comment!</p>
                        ): (
                            comments.map((comment, index) => (
                                <div key={comment._id || comment.id || index} className="comment">
                                    <div className="comment-header">
                                        <strong>{comment.UserName || comment.user?.name || 'Anonymous'}</strong>
                                        <span className="comment-date">
                                            {new Date(comment.createdAt || comment.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="comment-content">
                                        <p>{comment.content || comment.message}</p>
                                </div>
                            </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketPage;