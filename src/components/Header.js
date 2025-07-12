import React from 'react';
import ThemeToggle from './ThemeToggle';

const Header = ({ lastUpdate, systemStatus }) => {
  return (
    <header className="app-header glass">
      <div className="header-content">
        <div className="header-brand">
          <h1 className="brand-title text-gradient">
            <span className="brand-icon">₿</span>
            BTC Options Tracker
          </h1>
          <p className="brand-subtitle">
            Automated Bitcoin options analysis at precise 15-minute intervals
          </p>
        </div>
        
        <div className="header-actions">
          <div className="header-status">
            {lastUpdate && (
              <div className="status-indicator status-success">
                <span className="status-dot animate-pulse"></span>
                <span className="text-xs">
                  Last: {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            )}
            
            {systemStatus && (
              <div className="status-indicator status-info">
                <span className="text-xs">
                  Schedule: xx:00, xx:15, xx:30, xx:45
                </span>
              </div>
            )}
          </div>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;