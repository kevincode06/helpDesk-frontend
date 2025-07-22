import { GoogleGenerativeAI } from '@google/generative-ai';

class AIService {
    constructor() {
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY || 'your-api-key-here';
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = null;
        this.totalRequests = 0;
        this.successfulResponses = 0;
        this.failedResponses = 0;
        this.averageResponseTime = 0;
        this.lastUsed = null;
        this.initializeModel();
    }

    async initializeModel() {
        try {
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        } catch (error) {
            console.error('Failed to initialize AI model:', error);
        }
    }

    async getSuggestions(token) {
        try {
            this.totalRequests++;
            const startTime = Date.now();

            if (!this.model) {
                throw new Error('AI model not initialized');
            }

            const prompt = `Generate 6 helpful support chat suggestions that users commonly ask about. Format them as simple questions. Examples:
            - "How do I reset my password?"
            - "How can I update my profile?"
            - "What are your business hours?"
            
            Provide 6 similar helpful suggestions.`;

            const result = await this.model.generateContent([{ text: prompt }]);
            const response = await result.response;
            const text = response.text();

            const suggestions = text.split('\n')
                .filter(line => line.trim() && (line.includes('?') || line.includes('How') || line.includes('What')))
                .map(line => line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
                .slice(0, 6);

            if (suggestions.length === 0) {
                return { success: true, data: { suggestions: this.getFallbackSuggestions() } };
            }

            const endTime = Date.now();
            this.averageResponseTime = ((this.averageResponseTime * (this.totalRequests - 1)) + (endTime - startTime)) / this.totalRequests;
            this.successfulResponses++;
            this.lastUsed = new Date().toISOString();

            return { success: true, data: { suggestions } };
        } catch (error) {
            console.error('AI Suggestions Error:', error);
            this.failedResponses++;
            return { success: true, data: { suggestions: this.getFallbackSuggestions() } };
        }
    }

    async sendChatMessage(message, conversationHistory = [], token) {
        try {
            this.totalRequests++;
            const startTime = Date.now();

            if (!this.model) {
                throw new Error('AI model not initialized');
            }

            const response = await this.generateChatResponse(message, conversationHistory);

            const endTime = Date.now();
            this.averageResponseTime = ((this.averageResponseTime * (this.totalRequests - 1)) + (endTime - startTime)) / this.totalRequests;
            this.successfulResponses++;
            this.lastUsed = new Date().toISOString();

            return {
                success: true,
                data: {
                    response,
                    timestamp: new Date().toISOString(),
                    needsEscalation: this.checkEscalationNeeded(message),
                    category: this.analyzeMessageCategory(message),
                    priority: this.analyzePriority(message)
                }
            };
        } catch (error) {
            console.error('AI Chat Error:', error);
            this.failedResponses++;
            return {
                success: false,
                error: error.message,
                data: {
                    response: this.generateFallbackChatResponse(message),
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    async sendFeedback(messageId, rating, token) {
        try {
            console.log('Feedback received:', { messageId, rating, timestamp: new Date().toISOString() });
            return { success: true, message: 'Feedback received successfully' };
        } catch (error) {
            console.error('Failed to send feedback:', error);
            return { success: false, error: error.message };
        }
    }

    getFallbackSuggestions() {
        return [
            "How do I reset my password?",
            "How can I update my profile?",
            "What are your business hours?",
            "How do I contact support?",
            "How can I cancel my subscription?",
            "Where can I find my billing information?"
        ];
    }

    async generateChatResponse(message, conversationHistory = []) {
        try {
            if (!this.model) throw new Error('AI model not initialized');

            const systemPrompt = `You are a professional help desk AI assistant... User message: ${message}`;

            const historyParts = conversationHistory.map(msg => ({
                role: msg.sender === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));

            const chat = this.model.startChat({
                history: historyParts,
                generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
            });

            const result = await chat.sendMessage(systemPrompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('AI Chat Response Error:', error);
            return this.generateFallbackChatResponse(message);
        }
    }

    async generateTicketResponse(ticketData, conversationHistory = []) {
        try {
            if (!this.model) throw new Error('AI model not initialized');

            const systemPrompt = `You are an expert IT support assistant responding to a support ticket...`;

            const result = await this.model.generateContent([{ text: systemPrompt }]);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('AI Ticket Response Error:', error);
            return this.generateFallbackTicketResponse(ticketData);
        }
    }

    checkEscalationNeeded(message) {
        const keywords = ['urgent', 'critical', 'emergency', 'escalate', 'supervisor', 'manager', 'human', 'agent'];
        const lower = message.toLowerCase();
        return keywords.some(keyword => lower.includes(keyword));
    }

    analyzeMessageCategory(message) {
        if (!message || typeof message !== 'string') return 'general';
        const categories = {
            password: ['password', 'login', 'authentication'],
            account: ['account', 'profile', 'settings'],
            billing: ['billing', 'payment', 'invoice'],
            technical: ['bug', 'error', 'broken'],
            feature: ['feature', 'request', 'suggestion'],
            network: ['internet', 'wifi', 'network'],
            email: ['email', 'gmail', 'mail'],
            software: ['software', 'application', 'update'],
            hardware: ['hardware', 'printer', 'mouse']
        };
        const lower = message.toLowerCase();
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lower.includes(keyword))) return category;
        }
        return 'general';
    }

    analyzePriority(message) {
        const high = ['urgent', 'critical', 'emergency', 'down', 'offline'];
        const medium = ['important', 'soon', 'business', 'affecting work'];
        const lower = message.toLowerCase();
        if (high.some(k => lower.includes(k))) return 'high';
        if (medium.some(k => lower.includes(k))) return 'medium';
        return 'low';
    }

    generateFallbackChatResponse(message) {
        const category = this.analyzeMessageCategory(message);
        const responses = {
            password: "For password issues, try the 'Forgot Password' link.",
            account: "Update your account in Profile Settings.",
            billing: "For billing, please create a support ticket.",
            technical: "For technical issues, please create a support ticket.",
            feature: "Please create a support ticket with 'Feature Request'.",
            general: "I'm here to help! Please create a support ticket for detailed assistance."
        };
        return responses[category] || responses.general;
    }

    generateFallbackTicketResponse(ticketData) {
        return `Thank you for contacting support about "${ticketData.title}". Our team will review your request shortly.`;
    }

    async testConnection() {
        try {
            if (!this.model) await this.initializeModel();
            const result = await this.model.generateContent(['Test connection']);
            const response = await result.response;
            return { status: 'operational', model: 'gemini-1.5-flash', response: response.text().substring(0, 50) + '...', timestamp: new Date().toISOString() };
        } catch (error) {
            return { status: 'error', model: 'fallback', error: error.message, timestamp: new Date().toISOString() };
        }
    }

    getUsageStats() {
        return {
            totalRequests: this.totalRequests,
            successfulResponses: this.successfulResponses,
            failedResponses: this.failedResponses,
            averageResponseTime: this.averageResponseTime,
            lastUsed: this.lastUsed
        };
    }
}

const aiService = new AIService();
export default aiService;
