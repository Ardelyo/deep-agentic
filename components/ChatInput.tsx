import React, { useState } from 'react';

const SendIcon: React.FC<{className: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
  </svg>
);

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <div className="p-4 bg-gray-50">
      <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-white p-2.5 rounded-full shadow-md border transition-all duration-300 ease-in-out focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message..."
          disabled={disabled}
          className="flex-1 w-full px-4 py-2 bg-transparent focus:outline-none disabled:opacity-50"
        />
        <button type="submit" disabled={disabled} className="bg-blue-500 text-white flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full hover:bg-blue-600 disabled:bg-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
