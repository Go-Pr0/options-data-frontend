import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PriceChart from './components/PriceChart';
import IVChart from './components/IVChart';
import LatestData from './components/LatestData';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [chartData, setChartData] = useState({ price_data: [], iv_data: [] });
  const [latestData, setLatestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(24);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchChartData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chart-data?hours=${timeRange}`);
      setChartData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Failed to fetch chart data');
    }
  };

  const fetchLatestData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/latest-data`);
      setLatestData(response.data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching latest data:', err);
      setError('Failed to fetch latest data');
    }
  };

  const triggerCollection = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/trigger-collection`);
      // Refresh data after triggering collection
      setTimeout(() => {
        fetchChartData();
        fetchLatestData();
      }, 2000);
    } catch (err) {
      console.error('Error triggering collection:', err);
      setError('Failed to trigger data collection');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchChartData(), fetchLatestData()]);
      setLoading(false);
    };

    loadData();

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchChartData();
      fetchLatestData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <h2>Loading BTC Options Data...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🪙 BTC Options Tracker</h1>
        <p>Real-time Bitcoin options analysis with moneyness tracking</p>
        {lastUpdate && (
          <p className="last-update">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      <div className="controls">
        <div className="time-range-selector">
          <label>Time Range: </label>
          {[1, 6, 12, 24, 48, 168].map(hours => (
            <button
              key={hours}
              className={timeRange === hours ? 'active' : ''}
              onClick={() => handleTimeRangeChange(hours)}
            >
              {hours === 1 ? '1h' : 
               hours === 6 ? '6h' :
               hours === 12 ? '12h' :
               hours === 24 ? '1d' :
               hours === 48 ? '2d' : '1w'}
            </button>
          ))}
        </div>
        
        <button className="refresh-btn" onClick={triggerCollection}>
          🔄 Trigger Data Collection
        </button>
      </div>

      <LatestData data={latestData} />

      <div className="charts-container">
        <div className="chart-section">
          <h2>📈 Price Analysis</h2>
          <p className="chart-description">
            BTC spot price vs options premiums (ATM, 5% OTM, 5% ITM calls)
          </p>
          <PriceChart data={chartData.price_data} />
        </div>

        <div className="chart-section">
          <h2>📊 Implied Volatility Analysis</h2>
          <p className="chart-description">
            Implied volatility trends with BTC price overlay
          </p>
          <IVChart data={chartData.iv_data} />
        </div>
      </div>

      <div className="info-section">
        <h3>📚 Understanding Moneyness</h3>
        <div className="moneyness-explanation">
          <div className="moneyness-item">
            <strong>ITM (In The Money):</strong> Strike 5% below spot - has intrinsic value
          </div>
          <div className="moneyness-item">
            <strong>ATM (At The Money):</strong> Strike ≈ spot price - pure time/volatility value
          </div>
          <div className="moneyness-item">
            <strong>OTM (Out of The Money):</strong> Strike 5% above spot - only time/volatility value
          </div>
        </div>
        
        <div className="data-info">
          <p>
            📊 Data is collected every 15 minutes from Bybit's options market<br/>
            🎯 Tracks options closest to 7-day expiry for consistent comparison<br/>
            ⚡ Charts update automatically every 5 minutes
          </p>
        </div>
      </div>

      <footer className="App-footer">
        <p>
          Built with React + FastAPI | Data from Bybit V5 API | 
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"> View Source</a>
        </p>
      </footer>
    </div>
  );
}

export default App;