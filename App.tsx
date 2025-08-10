import React, { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { useChat } from './hooks/useChat';
import { SplashScreen } from './components/SplashScreen';
import { AnimatedWaves } from './components/AnimatedWaves';
import { FocusQueryModal } from './components/FocusQueryModal';
import { AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const { messages, isLoading, error, sendMessage, startSession, activeModal, setActiveModal } = useChat();
  const [appState, setAppState] = useState<'splash' | 'chat'>('splash');

  const handleBegin = () => {
    if (appState === 'splash') {
      setAppState('chat');
      // Per prompt, start the AI session after content has faded and blur has begun.
      setTimeout(() => startSession(), 500);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent font-sans">
      <AnimatedWaves state={appState} />
      <SplashScreen onBegin={handleBegin} appState={appState} />
      
      {/* The main-chat container is always in the DOM to handle its delayed transition */}
      <main className={`flex-1 overflow-hidden main-chat ${appState === 'chat' ? 'fade-in-chat' : ''}`}>
          <ChatInterface 
            messages={messages} 
            isLoading={isLoading} 
            error={error}
            sendMessage={sendMessage} 
          />
      </main>

      <AnimatePresence>
        {activeModal && (
          <FocusQueryModal 
            toolCall={activeModal} 
            onClose={() => setActiveModal(null)} 
            onSend={sendMessage} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;