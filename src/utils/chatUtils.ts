
import { Message } from '@/pages/Index';

const validateGeminiApiKey = (apiKey: string): boolean => {
  // Gemini API keys should be at least 20 characters long
  return apiKey.length >= 20;
};

export const sendToGemini = async (message: string, apiKey: string): Promise<string> => {
  // Validate API key format before making the request
  if (!validateGeminiApiKey(apiKey)) {
    throw new Error('Invalid API key format. Please provide a valid Gemini API key from https://aistudio.google.com/app/apikey.');
  }

  try {
    console.log('Sending message to Gemini AI:', message);
    console.log('Using API key format:', `${apiKey.substring(0, 8)}...`);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: message
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      
      if (response.status === 401 || response.status === 400) {
        throw new Error('Invalid API key. Please check your Gemini API key from https://aistudio.google.com/app/apikey.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`API error: ${response.status} - ${errorData}`);
      }
    }

    const data = await response.json();
    console.log('Gemini API response data:', data);
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unexpected response format from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to get response from Gemini AI');
    }
  }
};

export const exportChatHistory = (messages: Message[]) => {
  const chatHistory = messages.map(message => {
    const timestamp = message.timestamp.toLocaleString();
    const sender = message.sender === 'user' ? 'You' : 'Gemini AI';
    return `[${timestamp}] ${sender}: ${message.content}`;
  }).join('\n\n');

  const blob = new Blob([chatHistory], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gemini-chat-history-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
