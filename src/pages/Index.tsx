
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Download, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import ChatMessage from '@/components/ChatMessage';
import LoadingMessage from '@/components/LoadingMessage';
import ChatInput from '@/components/ChatInput';
import { sendToGemini, exportChatHistory } from '@/utils/chatUtils';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize API key and validate it
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini-api-key') || '';
    if (storedKey && storedKey.length >= 20) {
      setApiKey(storedKey);
      setShowApiKeyInput(false);
    } else {
      // Clear invalid API key
      localStorage.removeItem('gemini-api-key');
      setApiKey('');
      setShowApiKeyInput(true);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    if (!apiKey || apiKey.length < 20) {
      setShowApiKeyInput(true);
      toast({
        title: "Valid API Key Required",
        description: "Please enter a valid Gemini API key from https://aistudio.google.com/app/apikey",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('Sending message to Gemini...');
      const response = await sendToGemini(content, apiKey);
      console.log('Received response from Gemini:', response);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      
      toast({
        title: "Response received",
        description: "Gemini AI has responded to your message.",
      });
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      
      let errorMessage = "Failed to get response from Gemini AI.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // If it's an API key error, show the input again and clear the stored key
      if (errorMessage.includes('API key') || errorMessage.includes('401') || errorMessage.includes('400')) {
        localStorage.removeItem('gemini-api-key');
        setApiKey('');
        setShowApiKeyInput(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    if (key && key.length >= 20) {
      localStorage.setItem('gemini-api-key', key);
      setShowApiKeyInput(false);
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved locally.",
      });
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "All messages have been removed.",
    });
  };

  const exportChat = () => {
    if (messages.length === 0) {
      toast({
        title: "No Messages",
        description: "There are no messages to export.",
      });
      return;
    }
    
    exportChatHistory(messages);
    toast({
      title: "Chat Exported",
      description: "Chat history has been downloaded as a text file.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Gemini AI Chat</h1>
                <p className="text-sm text-gray-300">Powered by Google</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                API Key
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportChat}
                disabled={messages.length === 0}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                disabled={messages.length === 0}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Input */}
      {showApiKeyInput && (
        <div className="bg-blue-900/20 border-y border-blue-500/20">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-blue-200 font-medium">Gemini API Key Required</p>
                <p className="text-blue-300/80 text-sm">Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">Google AI Studio</a></p>
              </div>
              <div className="flex-1 max-w-md">
                <Input
                  type="password"
                  placeholder="Enter your Gemini API key..."
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  className="bg-black/20 border-blue-500/30 text-white placeholder-gray-400"
                />
              </div>
              {apiKey && apiKey.length >= 20 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeyInput(false)}
                  className="border-blue-500/30 text-blue-200 hover:bg-blue-500/10"
                >
                  Hide
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">Welcome to Gemini AI Chat</h3>
              <p className="text-gray-500">Start a conversation by typing a message below.</p>
              {(!apiKey || apiKey.length < 20) && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowApiKeyInput(true)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Configure API Key
                  </Button>
                </div>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          
          {isLoading && <LoadingMessage />}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="px-4 py-4">
            <ChatInput 
              onSendMessage={handleSendMessage} 
              disabled={!apiKey || apiKey.length < 20 || isLoading} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
