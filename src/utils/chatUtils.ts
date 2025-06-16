
import { Message } from '@/pages/Index';

export const sendToGrok = async (message: string, apiKey: string): Promise<string> => {
  try {
    // Note: This is a placeholder implementation as we don't have the actual Grok API endpoint
    // In a real implementation, you would replace this with the actual Grok API call
    
    // Simulating API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Mock responses for demonstration
    const mockResponses = [
      "I understand your question about: '" + message + "'. As Grok AI, I can help you with a wide range of topics. What specific aspect would you like me to elaborate on?",
      "That's an interesting point! " + message + " is something I can definitely help with. Let me provide you with a comprehensive answer...",
      "Great question! Regarding '" + message + "', here's what I think: This is a complex topic that involves multiple perspectives...",
      "I appreciate you asking about: " + message + ". Based on my knowledge, I can share several insights that might be helpful...",
      "Thanks for the question! '" + message + "' is definitely worth exploring. Let me break this down for you in a clear and helpful way..."
    ];
    
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    // Actual Grok API implementation would look like this:
    /*
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are Grok, a helpful AI assistant created by xAI.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        model: 'grok-beta',
        stream: false,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
    */
  } catch (error) {
    console.error('Error calling Grok API:', error);
    throw new Error('Failed to get response from Grok AI');
  }
};

export const exportChatHistory = (messages: Message[]) => {
  const chatHistory = messages.map(message => {
    const timestamp = message.timestamp.toLocaleString();
    const sender = message.sender === 'user' ? 'You' : 'Grok AI';
    return `[${timestamp}] ${sender}: ${message.content}`;
  }).join('\n\n');

  const blob = new Blob([chatHistory], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `grok-chat-history-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
