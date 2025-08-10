import React from 'react';

// --- STYLED TEXT PARSER ---
export const StyledText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\[color:(?:keyword|query|isomorphism|syntax)\](.*?)\[\/color\])/gs);
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
