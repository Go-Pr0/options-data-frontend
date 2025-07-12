import React from 'react';

const LatestData = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="latest-data-section">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Latest Market Data</h3>
          </div>
          <div className="card-content">
            <div className="empty-state">
              <div className="empty-icon">📈</div>
              <p className="empty-message">No data available yet</p>
              <p className="empty-description">Waiting for first data collection...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sort data by option type for consistent display
  const sortedData = [...data].sort((a, b) => {
    const order = { 'ITM': 0, 'ATM': 1, 'OTM': 2 };
    return order[a.option_type] - order[b.option_type];
  });

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOptionTypeInfo = (type) => {
    switch (type) {
      case 'ITM':
        return {
          label: 'In The Money',
          description: '5% below spot price',
          icon: '📈',
          color: 'success'
        };
      case 'ATM':
        return {
          label: 'At The Money',
          description: 'Near spot price',
          icon: '⚖️',
          color: 'warning'
        };
      case 'OTM':
        return {
          label: 'Out of The Money',
          description: '5% above spot price',
          icon: '📊',
          color: 'info'
        };
      default:
        return {
          label: type,
          description: '',
          icon: '📊',
          color: 'info'
        };
    }
  };

  // Get the most recent spot price
  const latestSpotPrice = sortedData.length > 0 ? sortedData[0].spot_price : null;
  const latestTimestamp = sortedData.length > 0 ? sortedData[0].timestamp : null;

  return (
    <div className="latest-data-section animate-fade-in">
      {/* Spot Price Card */}
      {latestSpotPrice && (
        <div className="card spotlight-card animate-glow">
          <div className="card-header">
            <h3 className="card-title">₿ BTC Spot Price</h3>
            <div className="status-indicator status-success">
              <span className="status-dot animate-pulse"></span>
              Live
            </div>
          </div>
          <div className="card-content">
            <div className="spot-price-display">
              <div className="spot-price">
                ${parseFloat(latestSpotPrice).toLocaleString()}
              </div>
              {latestTimestamp && (
                <div className="spot-timestamp">
                  Updated {formatTimestamp(latestTimestamp)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Options Data Grid */}
      <div className="options-grid">
        {sortedData.map((item, index) => {
          const optionInfo = getOptionTypeInfo(item.option_type);
          
          return (
            <div key={index} className="card option-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="card-header">
                <div className="option-header">
                  <span className="option-icon">{optionInfo.icon}</span>
                  <div className="option-title">
                    <h4 className="option-type">{optionInfo.label}</h4>
                    <p className="option-description">{optionInfo.description}</p>
                  </div>
                </div>
                <div className={`badge badge-${optionInfo.color}`}>
                  {item.option_type}
                </div>
              </div>
              
              <div className="card-content">
                <div className="option-details">
                  <div className="detail-row">
                    <span className="detail-label">Symbol</span>
                    <span className="detail-value font-mono text-sm">{item.symbol}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Strike</span>
                    <span className="detail-value font-semibold">
                      ${parseFloat(item.strike).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="metrics-grid">
                    <div className="metric">
                      <div className="metric-label">Premium</div>
                      <div className="metric-value text-accent">
                        ${parseFloat(item.premium).toFixed(4)}
                      </div>
                    </div>
                    
                    <div className="metric">
                      <div className="metric-label">Implied Vol</div>
                      <div className="metric-value text-info">
                        {(parseFloat(item.iv) * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-footer">
                <div className="option-timestamp">
                  <span className="text-xs text-muted">
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LatestData;