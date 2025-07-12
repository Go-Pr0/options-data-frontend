import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import ErrorBanner from './components/ErrorBanner';
import TimeRangeSelector from './components/TimeRangeSelector';
import LatestData from './components/LatestData';
import PriceChart from './components/PriceChart';
import IVChart from './components/IVChart';
import ApiDebug from './components/ApiDebug';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Debug: Log the API URL being used
console.log('🔗 Frontend API URL:', API_BASE_URL);
console.log('🔗 Environment variables:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  NODE_ENV: process.env.NODE_ENV
});

function AppContent() {
  const [chartData, setChartData] = useState({ price_data: [], iv_data: [] });
  const [latestData, setLatestData] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(24);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchChartData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chart-data?hours=${timeRange}`);
      setChartData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Failed to fetch chart data. Please check your connection.');
    }
  }, [timeRange]);

  const fetchLatestData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/latest-data`);
      setLatestData(response.data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching latest data:', err);
      setError('Failed to fetch latest data. Please check your connection.');
    }
  }, []);

  const fetchSystemStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/status`);
      setSystemStatus(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching system status:', err);
      // Don't set error for status fetch failures as it's not critical
    }
  }, []);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      fetchChartData(),
      fetchLatestData(),
      fetchSystemStatus()
    ]);
  }, [fetchChartData, fetchLatestData, fetchSystemStatus]);

  const handleRetry = useCallback(() => {
    setError(null);
    loadAllData();
  }, [loadAllData]);

  const handleErrorDismiss = useCallback(() => {
    setError(null);
  }, []);

  const handleTimeRangeChange = useCallback((newRange) => {
    setTimeRange(newRange);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadAllData();
      setLoading(false);
    };

    loadData();

    // Set up auto-refresh every 30 seconds for data and status
    const interval = setInterval(() => {
      loadAllData();
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, [loadAllData]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app">
      <ApiDebug />
      <Header 
        lastUpdate={lastUpdate}
        systemStatus={systemStatus}
      />

      {error && (
        <ErrorBanner 
          error={error}
          onDismiss={handleErrorDismiss}
          onRetry={handleRetry}
        />
      )}

      <main className="main-content">
        {/* Controls Section */}
        <section className="controls-section animate-fade-in">
          <div className="card controls-card">
            <div className="controls-content">
              <TimeRangeSelector 
                timeRange={timeRange}
                onTimeRangeChange={handleTimeRangeChange}
              />
              
              <div className="controls-info">
                <div className="status-indicator status-info">
                  <span className="status-dot"></span>
                  <span className="text-sm">
                    Precise collection at 15-minute intervals
                  </span>
                </div>
                
                {systemStatus && (
                  <div className="collection-status">
                    <div className="text-xs text-muted">
                      Collection Status: {systemStatus.can_collect_now ? 
                        <span className="text-success">Ready</span> : 
                        <span className="text-warning">Waiting for slot</span>
                      }
                    </div>
                    {systemStatus.last_collection && (
                      <div className="text-xs text-muted">
                        Last: {new Date(systemStatus.last_collection).toLocaleString()}
                      </div>
                    )}
                    {systemStatus.next_collection_slot && (
                      <div className="text-xs text-muted">
                        Next slot: {new Date(systemStatus.next_collection_slot).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Latest Data Section */}
        <section className="latest-data-section">
          <LatestData data={latestData} />
        </section>

        {/* Charts Section */}
        <section className="charts-section">
          <div className="charts-grid">
            {/* Price Chart */}
            <div className="card chart-card animate-slide-up">
              <div className="chart-header">
                <div className="chart-title">
                  <span className="text-2xl">📈</span>
                  <h2 className="card-title">Price Analysis</h2>
                </div>
                <p className="chart-subtitle">
                  BTC spot price vs options premiums (ATM, 5% OTM, 5% ITM calls)
                </p>
              </div>
              <PriceChart data={chartData.price_data} />
            </div>

            {/* IV Chart */}
            <div className="card chart-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="chart-header">
                <div className="chart-title">
                  <span className="text-2xl">📊</span>
                  <h2 className="card-title">Implied Volatility Analysis</h2>
                </div>
                <p className="chart-subtitle">
                  Implied volatility trends with BTC price correlation
                </p>
              </div>
              <IVChart data={chartData.iv_data} />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>
            Built with React + FastAPI | Data from Bybit V5 API | 
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"> View Source</a>
          </p>
          <p className="text-xs" style={{ marginTop: 'var(--spacing-xs)' }}>
            📊 Precise data collection at xx:00, xx:15, xx:30, xx:45 | 🎯 7-day expiry tracking | 
            ⚡ Fully automated timing system
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;