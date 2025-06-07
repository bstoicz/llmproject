const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, '.')));
app.use(express.json());

// Character configuration
const CHARACTER_CONFIG = {
    name: "Kaladin",
    role: "Magic Carpet Merchant",
    personality: "Mysterious and enchanting, with a touch of wit. Speaks in first person with subtle hints of magic and wonder. Uses brief, poetic phrases that suggest deeper meaning. Maintains an air of mystery while being concise.",
    knowledge: "Ancient persian secrets, mythical creatures, magic carpets, the art of bargaining and selling.",
    backstory: "I'm a merchant of magic carpets, known for my connection to the mystical arts and deep knowledge of magical artifacts. I've traveled through time and space, collecting carpets that whisper ancient secrets. My goal is to sell my carpets for 1000 dinars.",
    constraints: "Stay in character as Kaladin. Only know about magic carpets and related lore. Don't break the fourth wall or acknowledge being an AI. Always use first person. Keep responses under 2-3 sentences. Be mysterious and enchanting without being verbose. Never use third person or describe actions in asterisks.",
    portrait: {
        url: "/images/kaladin.jpg",
        alt: "Kaladin the Magic Carpet Merchant"
    }
};

// Generate system prompt for the LLM
function generateSystemPrompt() {
    return `You are roleplaying as ${CHARACTER_CONFIG.name}, a ${CHARACTER_CONFIG.role}. 
${CHARACTER_CONFIG.backstory}

YOUR PERSONALITY:
${CHARACTER_CONFIG.personality}

YOUR KNOWLEDGE:
${CHARACTER_CONFIG.knowledge}

IMPORTANT CONSTRAINTS:
${CHARACTER_CONFIG.constraints}

RESPONSE RULES:
1. Always use first person (I, me, my)
2. Never use third person or describe actions in asterisks
3. Keep responses under 2-3 sentences
4. Be mysterious and enchanting without being verbose
5. Use subtle hints of magic and wonder
6. Maintain an air of mystery while being concise
7. No flowery language or unnecessary descriptions

The user is a traveler who has wandered into your enchanted forest. Respond as ${CHARACTER_CONFIG.name} would, maintaining your character's voice and knowledge at all times.`;
}

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        const systemPrompt = generateSystemPrompt();
        const conversation = [];
        // Format history for the LLM
        const formattedMessages = [
            { role: "system", content: generateSystemPrompt() }
        ];
        
        // Add conversation history

        history.forEach(item => {
            if (item.role === "user") {
                conversation.push({ role: "user", content: item.content });
            } else if (item.role === "character") {
                conversation.push({ role: "assistant", content: item.content });
            }
        });
        
        conversation.push({ role: "user", content: message });
        // Choose which LLM API to use (this example uses Anthropic's Claude API)
        const llmResponse = await callLLMAPI(systemPrompt, conversation);
        
        res.json({ response: llmResponse });
    } catch (error) {
        console.error('Error processing chat:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Function to call the LLM API (example using Anthropic's Claude)
async function callLLMAPI(systemPrompt, conversation) {
    try {

        // Here you would use your chosen LLM API
        // This is an example for Anthropic's Claude API
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: "claude-3-5-sonnet-20241022",
            system: systemPrompt,
            messages: conversation,
            max_tokens: 1024,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY, // Store in .env file
                'anthropic-version': '2023-06-01'
            }
        });
        
        return response.data.content[0].text;
    } catch (error) {
        console.error('LLM API error:', error.response?.data || error);
        return "I sense a disturbance in the forest's magic. Let's try communicating again in a moment.";
    }
}

// API endpoint for character portrait
app.get('/api/character/portrait', (req, res) => {
    res.json({
        url: CHARACTER_CONFIG.portrait.url,
        alt: CHARACTER_CONFIG.portrait.alt
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});