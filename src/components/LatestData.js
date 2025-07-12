import React from 'react';

const LatestData = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="latest-data">
        <h3>📊 Latest Market Data</h3>
        <p style={{ textAlign: 'center', opacity: 0.7 }}>
          No data available yet. Waiting for first data collection...
        </p>
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

  const getOptionTypeColor = (type) => {
    switch (type) {
      case 'ITM': return '#82ca9d';
      case 'ATM': return '#ffc658';
      case 'OTM': return '#ff7300';
      default: return '#ffffff';
    }
  };

  const getOptionTypeDescription = (type) => {
    switch (type) {
      case 'ITM': return '5% In The Money';
      case 'ATM': return 'At The Money';
      case 'OTM': return '5% Out of The Money';
      default: return type;
    }
  };

  // Get the most recent spot price from any of the data points
  const latestSpotPrice = sortedData.length > 0 ? sortedData[0].spot_price : null;
  const latestTimestamp = sortedData.length > 0 ? sortedData[0].timestamp : null;

  return (
    <div className="latest-data">
      <h3>📊 Latest Market Data</h3>
      
      {latestSpotPrice && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          padding: '15px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          border: '2px solid #ffd700'
        }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#ffd700' }}>
            🪙 BTC Spot Price
          </h4>
          <p style={{ 
            margin: '0', 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color: '#00ff88'
          }}>
            ${parseFloat(latestSpotPrice).toLocaleString()}
          </p>
          {latestTimestamp && (
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
              Updated: {formatTimestamp(latestTimestamp)}
            </p>
          )}
        </div>
      )}

      <div className="data-grid">
        {sortedData.map((item, index) => (
          <div key={index} className="data-card">
            <h4 style={{ color: getOptionTypeColor(item.option_type) }}>
              📈 {getOptionTypeDescription(item.option_type)} Call
            </h4>
            
            <div style={{ marginBottom: '10px' }}>
              <p><strong>Symbol:</strong> {item.symbol}</p>
              <p><strong>Strike:</strong> ${parseFloat(item.strike).toLocaleString()}</p>
            </div>
            
            <div style={{ 
              background: 'rgba(0, 0, 0, 0.2)', 
              padding: '10px', 
              borderRadius: '5px',
              marginBottom: '10px'
            }}>
              <p>
                <strong>Premium:</strong> 
                <span className="highlight"> ${parseFloat(item.premium).toFixed(4)}</span>
              </p>
              <p>
                <strong>Implied Vol:</strong> 
                <span className="highlight"> {(parseFloat(item.iv) * 100).toFixed(2)}%</span>
              </p>
            </div>
            
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              <p><strong>Moneyness:</strong></p>
              <p>
                {item.option_type === 'ITM' && '✅ Has intrinsic value'}
                {item.option_type === 'ATM' && '⚖️ Pure time/volatility value'}
                {item.option_type === 'OTM' && '⏰ Only time/volatility value'}
              </p>
            </div>
            
            <div style={{ 
              marginTop: '10px', 
              fontSize: '0.8rem', 
              opacity: 0.7,
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              paddingTop: '8px'
            }}>
              <p>Updated: {formatTimestamp(item.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>

      {sortedData.length > 0 && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ffd700' }}>
            📚 Quick Reference
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div>
              <strong style={{ color: '#82ca9d' }}>ITM (In The Money):</strong><br/>
              Strike below spot price
            </div>
            <div>
              <strong style={{ color: '#ffc658' }}>ATM (At The Money):</strong><br/>
              Strike near spot price
            </div>
            <div>
              <strong style={{ color: '#ff7300' }}>OTM (Out of The Money):</strong><br/>
              Strike above spot price
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LatestData;