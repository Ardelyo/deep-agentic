import React, { useState } from 'react';
import { ToolCall } from '../types'; // Assuming ToolCall is defined in types.ts

interface FocusQueryModalProps {
    toolCall: ToolCall<'focus_query'>;
    onClose: () => void;
    onSend: (answer: string) => void;
}

export const FocusQueryModal: React.FC<FocusQueryModalProps> = ({ toolCall, onClose, onSend }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSend(input);
        onClose(); // Close the modal after sending
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl max-w-xl w-full p-8 pt-10 relative animate-modal-entry" style={{animationDuration: '0.4s'}} onClick={e => e.stopPropagation()}>
                <p className="text-2xl text-gray-800 leading-relaxed font-bold text-center">{toolCall.parameters.query}</p>
                
                <form onSubmit={handleSubmit} className="mt-8 flex flex-col items-center">
                    <textarea 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Input response..."
                        className="w-full h-28 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    />
                    <button type="submit" className="mt-4 bg-blue-600 text-white font-medium py-3 px-8 rounded-full hover:bg-blue-700 transition-transform active:scale-95 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};
