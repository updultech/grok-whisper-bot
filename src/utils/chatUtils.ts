
import { Message } from '@/pages/Index';
import { supabase } from '@/integrations/supabase/client';

export const sendToGemini = async (message: string): Promise<string> => {
  try {
    console.log('Sending message to Gemini via Supabase function:', message);
    
    const { data, error } = await supabase.functions.invoke('gemini-chat', {
      body: { message }
    });

    if (error) {
      console.error('Supabase function error:', error);
      
      // Handle specific Supabase connection errors
      if (error.message?.includes('not configured')) {
        throw new Error('Supabase connection not properly configured. Please check your integration setup.');
      }
      
      throw new Error(error.message || 'Failed to get response from Gemini AI');
    }

    if (data?.error) {
      console.error('Gemini API error:', data.error);
      throw new Error(data.error);
    }

    if (!data?.response) {
      throw new Error('No response received from Gemini AI');
    }

    console.log('Received response from Gemini:', data.response);
    return data.response;
  } catch (error) {
    console.error('Error calling Gemini via Supabase:', error);
    
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
