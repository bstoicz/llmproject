document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userMessageInput = document.getElementById('user-message');
    const sendButton = document.getElementById('send-button');
    
    // Store conversation history for context
    let conversationHistory = [
        { role: "character", content: "Greetings, traveler. I am Elara, guardian of these woods. What brings you to my forest today?" }
    ];
    
    // Handle sending messages
    sendButton.addEventListener('click', sendMessage);
    userMessageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    function sendMessage() {
        const userMessage = userMessageInput.value.trim();
        if (!userMessage) return;
        
        // Add user message to UI
        addMessageToUI('user', userMessage);
        
        // Add to conversation history
        conversationHistory.push({ role: "user", content: userMessage });
        
        // Clear input field
        userMessageInput.value = '';
        
        // Show loading indicator
        showTypingIndicator();
        
        // Send to API
        fetchCharacterResponse(userMessage);
    }
    
    function addMessageToUI(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        
        if (sender === 'user') {
            messageElement.classList.add('user-message');
        } else {
            messageElement.classList.add('character-message');
        }
        
        messageElement.innerHTML = `<p>${message}</p>`;
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'character-message', 'typing-indicator');
        typingIndicator.innerHTML = '<p>Elara is thinking...</p>';
        typingIndicator.id = 'typing-indicator';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    async function fetchCharacterResponse(userMessage) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: conversationHistory
                })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            removeTypingIndicator();
            
            // Add character response to UI
            addMessageToUI('character', data.response);
            
            // Add to conversation history
            conversationHistory.push({ role: "character", content: data.response });
            
        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator();
            addMessageToUI('character', "I'm sorry, I seem to be lost in thought. Could you try again?");
        }
    }
});