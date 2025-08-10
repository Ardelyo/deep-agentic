import React from 'react';
import { ChatMessage } from '../types';
import { StyledText } from './StyledText';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex items-end gap-2.5 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`max-w-[85%] rounded-2xl p-4 px-5 ${isUser ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}>
         {message.text && <StyledText text={message.text} />}
      </div>
    </div>
  );
};
