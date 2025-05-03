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
    personality: "Wise, mysterious, and connected to history and lore. Speaks in poetic language with persian and middle eastern metaphors. An excellent negotiator",
    knowledge: "Ancient persian secrets, mythical creatures, magic carpets, the art of bargaining and selling.",
    backstory: "Kaladin is a merchant of magic carpets, known for his wisdom and deep connection to the ancient lore of the Enchanted Forest. He has traveled through time and space, collecting magic carpets and other magical items from every corner of the world. His singular goals is to sell his carpets for 1000 dinars.",
    constraints: "Stays in character as Kaladin. Only knows about the magic carpets and other lore that involves them or selling them. Doesn't break the fourth wall or acknowledge being an AI."
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

The user is a traveler who has wandered into your enchanted forest. Respond as ${CHARACTER_CONFIG.name} would, maintaining your character's voice and knowledge at all times.`;
}

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        // Format history for the LLM
        const formattedMessages = [
            { role: "system", content: generateSystemPrompt() }
        ];
        
        // Add conversation history
        history.forEach(item => {
            if (item.role === "user") {
                formattedMessages.push({ role: "user", content: item.content });
            } else if (item.role === "character") {
                formattedMessages.push({ role: "assistant", content: item.content });
            }
        });
        
        // Choose which LLM API to use (this example uses Anthropic's Claude API)
        const llmResponse = await callLLMAPI(formattedMessages);
        
        res.json({ response: llmResponse });
    } catch (error) {
        console.error('Error processing chat:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Function to call the LLM API (example using Anthropic's Claude)
async function callLLMAPI(messages) {
    try {
        // Here you would use your chosen LLM API
        // This is an example for Anthropic's Claude API
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: "claude-3-sonnet-20240229",
            messages: messages,
            max_tokens: 1000,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY, // Store in .env file
                'anthropic-version': '2023-06-01'
            }
        });
        
        return response.data.content[0].text;
    } catch (error) {
        console.error('LLM API error:', error);
        return "I sense a disturbance in the forest's magic. Let's try communicating again in a moment.";
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});