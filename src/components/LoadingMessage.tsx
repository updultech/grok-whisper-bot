
import React from 'react';
import { Bot } from 'lucide-react';

const LoadingMessage: React.FC = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex max-w-[80%] items-start space-x-3">
        {/* Bot Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>

        {/* Loading Bubble */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 mr-3">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm text-gray-300">Gemini is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
