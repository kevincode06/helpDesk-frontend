import React, { useState, useEffect, useRef, useCallback } from 'react';
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

    const fetchSuggestions = useCallback(async () => {
        try {
            const response = await aiService.getSuggestions(token);
            if (response.success) {
                setSuggestions(response.data.suggestions);
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
            setSuggestions([
                "How do I reset my password?",
                "How can I contact support?",
                "What are your business hours?",
                "How do I update my profile?"
            ]);
        }
    }, [token]); // token is a dependency of fetchSuggestions

    useEffect(() => {
        if (isOpen && suggestions.length === 0) {
            fetchSuggestions();
        }
    }, [isOpen, suggestions.length, fetchSuggestions]); 

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
            const response = await aiService.sendChatMessage(messageText, messages, token);
            
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
            await aiService.sendFeedback(messageId, rating, token);
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
        if (!isOpen && messages.length === 0) {
            const welcomeMessage = {
                id: Date.now(),
                text: "Hi! I'm your AI support assistant. I can help you with common questions about passwords, account settings, billing, and more. How can I help you today?",
                sender: 'ai',
                timestamp: new Date().toISOString()
            };
            setMessages([welcomeMessage]);
        }
    };

    return (
        <div className="ai-chat-container">
            {!isOpen && (
                <button onClick={toggleChat} className="ai-chat-toggle" title="Open AI Support Chat">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                </button>
            )}

            {isOpen && (
                <div className="ai-chat-window">
                    <div className="ai-chat-header">
                        <div className="ai-chat-title">
                            <h3>AI Support</h3>
                        </div>
                        <button onClick={toggleChat} className="ai-chat-close" title="Close chat">
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="ai-chat-error">
                            {error}
                            <button onClick={() => setError(null)}>×</button>
                        </div>
                    )}

                    <div className="ai-chat-messages">
                        {messages.length === 0 && (
                            <div className="ai-chat-welcome">
                                <p>Hi! I'm here to help with common questions.</p>
                                <div className="ai-chat-suggestions">
                                    {suggestions.slice(0, 3).map((suggestion, index) => (
                                        <button key={index} onClick={() => handleSuggestionClick(suggestion)} className="ai-chat-suggestion">
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((message) => (
                            <div key={message.id} className={`ai-chat-message ${message.sender === 'user' ? 'user' : 'ai'}`}>
                                <div className="ai-chat-message-content">
                                    <div className="ai-chat-message-text">{message.text}</div>
                                    {message.sender === 'ai' && (
                                        <div className="ai-chat-message-actions">
                                            <button onClick={() => handleFeedback(message.id, 'positive')} className="ai-chat-feedback-btn" title="Helpful">👍</button>
                                            <button onClick={() => handleFeedback(message.id, 'negative')} className="ai-chat-feedback-btn" title="Not helpful">👎</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="ai-chat-message ai">
                                <div className="ai-chat-message-content">
                                    <div className="ai-chat-typing">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

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
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2"/>
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