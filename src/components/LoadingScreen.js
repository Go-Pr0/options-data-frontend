import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content animate-fade-in">
        <div className="loading-icon animate-glow">
          <span className="text-3xl">₿</span>
        </div>
        <h2 className="loading-title">Loading BTC Options Data</h2>
        <p className="loading-subtitle">Fetching real-time market data...</p>
        <div className="loading-progress">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;