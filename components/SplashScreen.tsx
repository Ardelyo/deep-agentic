
import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onBegin: () => void;
  appState: 'splash' | 'chat';
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onBegin, appState }) => {
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setContentVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`splash-screen ${appState === 'chat' ? 'fade-out' : ''}`}>
      <div className="splash-content-wrapper">
        <div className={`splash-content ${contentVisible ? 'fade-in' : ''} ${appState === 'chat' ? 'content-fade-out' : ''}`}>
          <h1 className="splash-title">Deep Agentic</h1>
          <p className="splash-tagline">Knowledge is a structure. To understand is to perceive the structure.</p>
          <button className="splash-button" onClick={onBegin}>
            Begin Session
          </button>
        </div>
      </div>
    </div>
  );
};
