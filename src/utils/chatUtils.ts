import { Message } from '@/pages/Index';

const validateGrokApiKey = (apiKey: string): boolean => {
  // Grok API keys should start with 'xai-' and be at least 20 characters long
  return apiKey.startsWith('xai-') && apiKey.length >= 20;
};

export const sendToGrok = async (message: string, apiKey: string): Promise<string> => {
  // Validate API key format before making the request
  if (!validateGrokApiKey(apiKey)) {
    throw new Error('Invalid API key format. Grok API keys should start with "xai-" and be obtained from https://console.x.ai.');
  }

  try {
    console.log('Sending message to Grok AI:', message);
    console.log('Using API key format:', `${apiKey.substring(0, 8)}...`);
    
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
            content: 'You are Grok, a helpful AI assistant created by xAI. Be conversational, witty, and helpful while providing accurate information.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        model: 'grok-beta',
        stream: false,
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    console.log('Grok API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Grok API error:', errorData);
      
      if (response.status === 401 || response.status === 400) {
        throw new Error('Invalid API key. Please check your Grok API key from https://console.x.ai and ensure it starts with "xai-".');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`API error: ${response.status} - ${errorData}`);
      }
    }

    const data = await response.json();
    console.log('Grok API response data:', data);
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error('Unexpected response format from Grok API');
    }
  } catch (error) {
    console.error('Error calling Grok API:', error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to get response from Grok AI');
    }
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
