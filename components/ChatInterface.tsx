
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ToolCall, ToolName, AxiomNodePayload, FocusQueryPayload, IsomorphismPayload, SynthesisProtocolPayload, CompileSchemaPayload } from '../types';

// --- ICONS (AETHER AESTHETIC) ---
const SendIcon: React.FC<{className: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
  </svg>
);
const CodeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

// --- STYLED TEXT PARSER ---
const StyledText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\[color:(?:keyword|query|isomorphism|syntax)\].*?\[\/color\])/gs);
  return (
    <>
      {parts.map((part, index) => {
        const match = part.match(/\[color:(keyword|query|isomorphism|syntax)\](.*?)\[\/color\]/s);
        if (match) {
          const [, type, content] = match;
          switch (type) {
            case 'keyword': return <strong key={index} className="font-semibold text-blue-600">{content}</strong>;
            case 'query': return <em key={index} className="text-blue-500/90 italic text-[1.1em]">{content}</em>;
            case 'isomorphism': return <span key={index} className="text-slate-600 italic">{content}</span>;
            case 'syntax': return <code key={index} className="bg-slate-200/50 text-slate-700 font-mono text-[0.9em] px-1.5 py-0.5 rounded-md font-medium">{content}</code>;
            default: return content;
          }
        }
        return <React.Fragment key={index}>{part.split('\n').map((line, i) => <p key={i} className="mb-2 last:mb-0">{line || '\u00A0'}</p>)}</React.Fragment>;
      })}
    </>
  );
};


// --- TOOL RENDERER & COMPONENTS (AETHER INTERFACE) ---

const ToolCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`mt-2 bg-var(--color-surface-container) rounded-3xl shadow-lg shadow-blue-500/5 p-6 border border-black/5 ${className}`}>
    {children}
  </div>
);

const AxiomNode: React.FC<{ payload: AxiomNodePayload['parameters'] }> = ({ payload }) => (
  <ToolCard>
    <h3 className="font-['Manrope'] font-bold text-gray-800 text-lg mb-4 animate-spring-up">{payload.title}</h3>
    <ul className="space-y-2 text-slate-700 list-decimal list-inside">
      {payload.axioms.map((axiom, i) => <li key={i} className="animate-spring-up" style={{ animationDelay: `${i * 100}ms`}}>{axiom}</li>)}
    </ul>
    <p className="mt-5 text-sm italic text-blue-600/90 border-t border-slate-200/80 pt-4 animate-spring-up" style={{animationDelay: `${payload.axioms.length * 100}ms`}}>
      {payload.subsequent_query}
    </p>
  </ToolCard>
);

const IsomorphismNode: React.FC<{ payload: IsomorphismPayload['parameters'] }> = ({ payload }) => (
    <ToolCard className="bg-var(--color-analogy-bg) border-blue-200/30">
        <h4 className="font-['Manrope'] font-bold text-slate-800 text-lg mb-2">
            {payload.title}
        </h4>
        <p className="text-slate-700/90 my-3">{payload.isomorphic_system_description}</p>
        <p className="mt-5 text-sm italic text-blue-600/90 border-t border-slate-200/80 pt-4">
            {payload.concluding_query}
        </p>
    </ToolCard>
);

const SynthesisProtocol: React.FC<{ payload: SynthesisProtocolPayload['parameters'] }> = ({ payload }) => {
    const [code, setCode] = useState(payload.scaffold_code);

    return (
        <ToolCard className="font-mono text-sm bg-var(--color-code-bg) text-slate-300 p-0 overflow-hidden">
            <div className='p-6 pb-4'>
                <h4 className="font-['Manrope'] font-bold text-slate-300 mb-3 flex items-center tracking-wide text-base">
                    <CodeIcon className="h-5 w-5 mr-2.5 text-slate-400" />
                    {payload.language}: Synthesis Protocol
                </h4>
                <p className="text-slate-400 mb-4 whitespace-pre-wrap font-sans">{payload.synthesis_task}</p>
            </div>
            <div className="bg-black/20 px-6 py-4">
                <textarea
                    className="w-full h-48 bg-transparent text-cyan-400 whitespace-pre-wrap overflow-x-auto focus:outline-none resize-none font-mono"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    aria-label="Code input for synthesis protocol"
                />
            </div>
        </ToolCard>
    );
};

const CompileSchemaNode: React.FC<{ payload: CompileSchemaPayload['parameters'] }> = ({ payload }) => (
  <ToolCard>
    <h3 className="font-['Manrope'] font-bold text-gray-800 text-lg mb-4">Schema Compiled</h3>
    <ul className="space-y-2 text-slate-700 list-disc list-inside">
      {payload.schema_points.map((point, i) => <li key={i}>{point}</li>)}
    </ul>
  </ToolCard>
);


const FocusQueryModal: React.FC<{ payload: FocusQueryPayload['parameters'], onAnswer: (answer: string) => void }> = ({ payload, onAnswer }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAnswer(input);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => onAnswer('')}>
            <div className="bg-var(--color-surface-container) border border-slate-200/70 rounded-3xl shadow-2xl max-w-xl w-full p-8 pt-10 relative animate-modal-entry" style={{animationDuration: '0.4s'}} onClick={e => e.stopPropagation()}>
                <p className="text-2xl text-slate-800 leading-relaxed font-['Manrope'] font-bold text-center">{payload.query}</p>
                
                <form onSubmit={handleSubmit} className="mt-8 flex flex-col items-center">
                    <textarea 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Input response..."
                        className="w-full h-28 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    />
                    <button type="submit" className="mt-4 bg-slate-800 text-white font-medium py-3 px-8 rounded-full hover:bg-slate-700 transition-transform active:scale-95 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

const ToolRenderer: React.FC<{ toolCall: ToolCall }> = ({ toolCall }) => {
  switch (toolCall.tool_name) {
    case ToolName.RenderAxiomNode:
      return <AxiomNode payload={toolCall.parameters} />;
    case ToolName.RenderIsomorphism:
      return <IsomorphismNode payload={toolCall.parameters} />;
    case ToolName.InitiateSynthesisProtocol:
      return <SynthesisProtocol payload={toolCall.parameters} />;
    case ToolName.CompileSchema:
        return <CompileSchemaNode payload={toolCall.parameters} />;
    case ToolName.FocusQuery:
      return null; // Rendered modally
    default:
      return <div className="text-red-500">Error: Unknown tool protocol.</div>;
  }
};


// --- MESSAGE BUBBLE ---
const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex items-end gap-2.5 w-full animate-spring-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`max-w-[85%] rounded-[28px] p-4 px-5 leading-relaxed shadow-[0_4px_16px_rgba(0,0,0,0.08)] ${isUser ? 'bg-var(--color-primary) text-var(--color-on-primary) rounded-br-lg' : 'bg-var(--color-surface-container) text-var(--color-on-surface) rounded-bl-lg'}`}>
         {message.text && (
            <div className="prose prose-invert prose-sm max-w-none text-current">
              <StyledText text={message.text} />
            </div>
         )}
        {message.toolCall && <ToolRenderer toolCall={message.toolCall} />}
      </div>
    </div>
  );
};

// --- CHAT INTERFACE ---
interface ChatInterfaceProps {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    sendMessage: (text: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, error, sendMessage }) => {
    const [input, setInput] = useState('');
    const [activePrompt, setActivePrompt] = useState<FocusQueryPayload | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, isLoading]);
    
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.sender === 'ai' && lastMessage.toolCall?.tool_name === ToolName.FocusQuery) {
            setActivePrompt(lastMessage.toolCall as FocusQueryPayload);
        }
    }, [messages]);

    const handlePromptAnswer = (answer: string) => {
        if (answer.trim() && activePrompt) {
            sendMessage(answer);
        }
        setActivePrompt(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            sendMessage(input.trim());
            setInput('');
        }
    };
    
    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto relative bg-white/20 backdrop-blur-2xl border border-white/30 rounded-t-3xl overflow-hidden shadow-2xl shadow-blue-500/10">
            {activePrompt && <FocusQueryModal payload={activePrompt.parameters} onAnswer={handlePromptAnswer} />}
            <div className={`h-full flex flex-col transition-all duration-500 ease-in-out ${activePrompt ? 'transform scale-[0.9] opacity-70 blur-sm' : ''}`}>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}
                    {isLoading && (
                         <div className="flex items-end gap-2.5 w-full flex-row animate-spring-up">
                            <div className="rounded-[28px] rounded-bl-lg p-4 px-5 bg-var(--color-surface-container) shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                                <div className="flex items-center justify-center w-16 h-6">
                                   <div className="h-2.5 w-2.5 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                                   <div className="h-2.5 w-2.5 bg-blue-300 rounded-full animate-pulse mx-2.5" style={{animationDelay: '200ms'}}></div>
                                   <div className="h-2.5 w-2.5 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {error && <div className="text-red-500 bg-red-100 border border-red-300 p-3 rounded-2xl text-center animate-spring-up">{error}</div>}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-white/80 backdrop-blur-xl p-2.5 rounded-full shadow-lg shadow-blue-500/10 border border-black/10 transition-all duration-300 ease-in-out focus-within:border-blue-400/50 focus-within:ring-2 focus-within:ring-blue-500/20">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Initiate query..."
                            disabled={isLoading}
                            className="flex-1 w-full px-4 py-2 bg-transparent focus:outline-none disabled:opacity-50 font-sans text-base placeholder:text-slate-500"
                        />
                        <button type="submit" disabled={isLoading} className="bg-slate-800 text-white flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-700 disabled:bg-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 transform hover:-translate-y-0.5 active:scale-90">
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </form>
                  </div>
                </div>
            </div>
        </div>
    );
};
