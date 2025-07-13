import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import aiService from '../services/aiService.js';
import './AIChat.css';

const AIChat = () => {
    const { token } = useSelector((state) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && suggestions.length === 0) {
            fetchSuggestions();
        }
    }, [isOpen]);

    const fetchSuggestions = async () => {
        try {
            const response = await aiService.getSuggestions();
            if (response.success) {
                setSuggestions(response.data.suggestions);
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
            // Fallback suggestions if API fails
            setSuggestions([
                "How do I reset my password?",
                "How can I contact support?",
                "What are your business hours?",
                "How do I update my profile?"
            ]);
        }
    };

    const sendMessage = async (messageText = inputMessage) => {
        if (!messageText.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: messageText,
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await aiService.sendChatMessage(messageText, messages);
            
            if (response.success) {
                const aiMessage = {
                    id: Date.now() + 1,
                    text: response.data.response,
                    sender: 'ai',
                    timestamp: response.data.timestamp || new Date().toISOString()
                };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                throw new Error(response.error || 'Failed to get AI response');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setError('Sorry, I\'m having trouble responding right now. Please try again or create a support ticket.');
            
            const errorMessage = {
                id: Date.now() + 1,
                text: "I'm sorry, I'm having trouble responding right now. Please try again or create a support ticket for personalized help.",
                sender: 'ai',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        sendMessage(suggestion);
    };

    const handleFeedback = async (messageId, rating) => {
        try {
            await aiService.sendFeedback(messageId, rating);
            console.log('Feedback sent successfully');
        } catch (error) {
            console.error('Failed to send feedback:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Add welcome message when opening chat for first time
            if (messages.length === 0) {
                const welcomeMessage = {
                    id: Date.now(),
                    text: "Hi! I'm your AI support assistant. I can help you with common questions about passwords, account settings, billing, and more. How can I help you today?",
                    sender: 'ai',
                    timestamp: new Date().toISOString()
                };
                setMessages([welcomeMessage]);
            }
        }
    };

    return (
        <div className="ai-chat-container">
            {/* Chat Toggle Button */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="ai-chat-toggle"
                    title="Open AI Support Chat"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="ai-chat-window">
                    {/* Header */}
                    <div className="ai-chat-header">
                        <div className="ai-chat-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                            </svg>
                            <h3>AI Support</h3>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="ai-chat-close"
                            title="Close chat"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="ai-chat-error">
                            {error}
                            <button onClick={() => setError(null)}>×</button>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="ai-chat-messages">
                        {messages.length === 0 && (
                            <div className="ai-chat-welcome">
                                <div className="ai-chat-welcome-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                                    </svg>
                                </div>
                                <p>Hi! I'm here to help with common questions.</p>
                                <div className="ai-chat-suggestions">
                                    {suggestions.slice(0, 3).map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="ai-chat-suggestion"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`ai-chat-message ${message.sender === 'user' ? 'user' : 'ai'}`}
                            >
                                <div className="ai-chat-message-content">
                                    <div className="ai-chat-message-text">
                                        {message.text}
                                    </div>
                                    {message.sender === 'ai' && (
                                        <div className="ai-chat-message-actions">
                                            <button
                                                onClick={() => handleFeedback(message.id, 'positive')}
                                                className="ai-chat-feedback-btn"
                                                title="Helpful"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleFeedback(message.id, 'negative')}
                                                className="ai-chat-feedback-btn"
                                                title="Not helpful"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="ai-chat-message ai">
                                <div className="ai-chat-message-content">
                                    <div className="ai-chat-typing">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="ai-chat-input">
                        <div className="ai-chat-input-wrapper">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                disabled={isLoading}
                                className="ai-chat-input-field"
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={isLoading || !inputMessage.trim()}
                                className="ai-chat-send-btn"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        <p className="ai-chat-help-text">
                            Press Enter to send • For complex issues, create a support ticket
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIChat;