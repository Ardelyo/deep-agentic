import { useChat } from '../hooks/useChat';
import { ChatBubble } from './ChatBubble';
import { ToolRenderer } from './ToolRenderer';
import { LoadingIndicator } from './LoadingIndicator';
import { ChatInput } from './ChatInput';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';

export const ChatInterface = () => {
  const { messages, isLoading, error, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1.0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* --- THIS IS THE KEY LOGIC --- */}
              {message.toolCall ? (
                // If the message has a toolCall, render it using our switchboard
                <ToolRenderer toolCall={message.toolCall} />
              ) : (
                // Otherwise, render a standard text bubble
                <ChatBubble message={message} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && <LoadingIndicator />}
        
        {error && (
          <div className="text-center text-red-500 p-2">{error}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
};