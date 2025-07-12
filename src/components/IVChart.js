import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

const IVChart = ({ data }) => {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <h4 className="empty-message">No IV data available</h4>
          <p className="empty-description">Data collection in progress...</p>
        </div>
      </div>
    );
  }

  // Process data to group by timestamp and create chart-friendly format
  const processedData = {};
  
  data.forEach(point => {
    const timestamp = new Date(point.timestamp).getTime();
    const timeKey = new Date(timestamp).toISOString();
    
    if (!processedData[timeKey]) {
      processedData[timeKey] = {
        timestamp: timeKey,
        time: new Date(timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          month: 'short',
          day: 'numeric'
        }),
        spot_price: point.spot_price
      };
    }
    
    // Add IV data based on option type
    if (point.option_type === 'ITM') {
      processedData[timeKey].itm_iv = point.iv * 100; // Convert to percentage
    } else if (point.option_type === 'ATM') {
      processedData[timeKey].atm_iv = point.iv * 100;
    } else if (point.option_type === 'OTM') {
      processedData[timeKey].otm_iv = point.iv * 100;
    }
  });

  const chartData = Object.values(processedData).sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Theme-aware colors
  const colors = {
    spot: isDark ? '#d4af37' : '#c19b2e',
    itm: isDark ? '#90c695' : '#27ae60',
    atm: isDark ? '#e6c068' : '#f39c12',
    otm: isDark ? '#7db3d3' : '#3498db',
    grid: isDark ? 'rgba(245, 245, 220, 0.1)' : 'rgba(44, 62, 80, 0.1)',
    text: isDark ? '#d0d0d0' : '#34495e'
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <div className="tooltip-header">
            <span className="tooltip-time">{data.time}</span>
          </div>
          <div className="tooltip-content">
            <div className="tooltip-item">
              <span className="tooltip-label" style={{ color: colors.spot }}>
                BTC Spot:
              </span>
              <span className="tooltip-value">
                ${data.spot_price?.toLocaleString()}
              </span>
            </div>
            {data.itm_iv && (
              <div className="tooltip-item">
                <span className="tooltip-label" style={{ color: colors.itm }}>
                  ITM IV:
                </span>
                <span className="tooltip-value">
                  {data.itm_iv.toFixed(2)}%
                </span>
              </div>
            )}
            {data.atm_iv && (
              <div className="tooltip-item">
                <span className="tooltip-label" style={{ color: colors.atm }}>
                  ATM IV:
                </span>
                <span className="tooltip-value">
                  {data.atm_iv.toFixed(2)}%
                </span>
              </div>
            )}
            {data.otm_iv && (
              <div className="tooltip-item">
                <span className="tooltip-label" style={{ color: colors.otm }}>
                  OTM IV:
                </span>
                <span className="tooltip-value">
                  {data.otm_iv.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate average IV for reference
  const allIVs = chartData.flatMap(point => [
    point.itm_iv, point.atm_iv, point.otm_iv
  ].filter(iv => iv !== undefined));
  
  const avgIV = allIVs.length > 0 ? allIVs.reduce((sum, iv) => sum + iv, 0) / allIVs.length : 0;

  // Calculate spot price range for scaling
  const spotPrices = chartData.map(point => point.spot_price).filter(price => price);
  const minSpot = Math.min(...spotPrices);
  const maxSpot = Math.max(...spotPrices);
  const spotRange = maxSpot - minSpot;
  
  // Normalize spot price to IV scale for overlay (rough approximation)
  const normalizedSpotData = chartData.map(point => ({
    ...point,
    normalized_spot: point.spot_price ? 
      ((point.spot_price - minSpot) / spotRange) * 50 + avgIV - 25 : undefined
  }));

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={normalizedSpotData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={colors.grid}
            opacity={0.5}
          />
          <XAxis 
            dataKey="time" 
            stroke={colors.text}
            fontSize={12}
            interval="preserveStartEnd"
            tick={{ fill: colors.text }}
          />
          <YAxis 
            stroke={colors.text}
            fontSize={12}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
            tick={{ fill: colors.text }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: colors.text }}
          />
          
          {/* IV lines */}
          <Line
            type="monotone"
            dataKey="itm_iv"
            stroke={colors.itm}
            strokeWidth={2}
            dot={false}
            name="5% ITM Call IV"
            connectNulls={false}
            activeDot={{ r: 4, fill: colors.itm }}
          />
          <Line
            type="monotone"
            dataKey="atm_iv"
            stroke={colors.atm}
            strokeWidth={2}
            dot={false}
            name="ATM Call IV"
            connectNulls={false}
            activeDot={{ r: 4, fill: colors.atm }}
          />
          <Line
            type="monotone"
            dataKey="otm_iv"
            stroke={colors.otm}
            strokeWidth={2}
            dot={false}
            name="5% OTM Call IV"
            connectNulls={false}
            activeDot={{ r: 4, fill: colors.otm }}
          />
          
          {/* Normalized spot price overlay */}
          <Line
            type="monotone"
            dataKey="normalized_spot"
            stroke={colors.spot}
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            name="BTC Price (normalized)"
            strokeOpacity={0.6}
          />
          
          {/* Reference line for average IV */}
          {avgIV > 0 && (
            <ReferenceLine 
              y={avgIV} 
              stroke={colors.text} 
              strokeDasharray="3 3" 
              strokeOpacity={0.3}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      
      <div className="chart-info">
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: colors.atm }}></span>
            <span className="legend-text">Implied Volatility (%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: colors.spot }}></span>
            <span className="legend-text">BTC Price (normalized)</span>
          </div>
        </div>
        <div className="chart-metrics">
          {avgIV > 0 && (
            <div className="metric">
              <span className="metric-label">Average IV:</span>
              <span className="metric-value">{avgIV.toFixed(2)}%</span>
            </div>
          )}
        </div>
        <p className="chart-description">
          Higher IV indicates higher option premiums and market uncertainty
        </p>
      </div>
    </div>
  );
};

export default IVChart;