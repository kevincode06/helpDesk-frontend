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

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [submittingMessage, setSubmittingMessage] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchTicketDetails = useCallback(() => {
    dispatch(getTicket(id));
  }, [dispatch, id]);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/messages/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      }
    });
    const data = await res.json();
    setMessages(data.data || data);
  }, [id]);

  useEffect(() => {
    fetchTicketDetails();
    fetchMessages();
  }, [fetchTicketDetails, fetchMessages]);

  const handleAddMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSubmittingMessage(true);
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ticketId: id, message: newMessage })
    });
    const saved = await res.json();
    setMessages(prev => [...prev, saved.data || saved]);
    setNewMessage('');
    setSubmittingMessage(false);
  };

  const handleStatusUpdate = async (newStatus) => {
    setStatusUpdating(true);
    await dispatch(updateTicket({ id, data: { status: newStatus } })).unwrap();
    setStatusUpdating(false);
  };

  const handleAIResponse = async () => {
    dispatch(clearAIError());
    await dispatch(generateAIResponse(id)).unwrap();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!ticket) return <div>Ticket not found.</div>;

  return (
    <div className="ticket-page">
      <div className="breadcrumb">
        <Link to="/dashboard">Dashboard</Link> / Ticket #{ticket._id.slice(-6)}
      </div>

      <div className="ticket-header">
        <h1>{ticket.title}</h1>
        {["admin", ticket.user._id].includes(user._id) && (
          <select value={ticket.status} onChange={e => handleStatusUpdate(e.target.value)} disabled={statusUpdating}>
            {["open","awaiting_response","resolved","closed"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      <div className="conversation">
        <h3>Conversation ({messages.length})</h3>
        {messages.map((msg) => (
          <div key={msg._id} className="message">
            <strong>{msg.sender.name}:</strong> {msg.message}
            <div className="time">{new Date(msg.sentAt).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {ticket.status !== 'closed' && (
        <form onSubmit={handleAddMessage} className="message-form">
          <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} required rows="3"/>
          <button type="submit" disabled={submittingMessage}>{submittingMessage ? 'Sending…' : 'Send'}</button>
        </form>
      )}

      <div className="ai-suggestion">
        <button onClick={handleAIResponse} disabled={aiLoading}>
          {aiLoading ? 'Thinking…' : 'Get AI Response '}
        </button>
        {aiError && <div className="error">{aiError}</div>}
      </div>
    </div>
  );
};

export default TicketPage;

