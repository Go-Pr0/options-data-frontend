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

const PriceChart = ({ data }) => {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h4 className="empty-message">No price data available</h4>
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
    
    // Add option data based on type
    if (point.option_type === 'ITM') {
      processedData[timeKey].itm_premium = point.premium;
    } else if (point.option_type === 'ATM') {
      processedData[timeKey].atm_premium = point.premium;
    } else if (point.option_type === 'OTM') {
      processedData[timeKey].otm_premium = point.premium;
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
            {data.itm_premium && (
              <div className="tooltip-item">
                <span className="tooltip-label" style={{ color: colors.itm }}>
                  ITM Call:
                </span>
                <span className="tooltip-value">
                  ${data.itm_premium.toFixed(4)}
                </span>
              </div>
            )}
            {data.atm_premium && (
              <div className="tooltip-item">
                <span className="tooltip-label" style={{ color: colors.atm }}>
                  ATM Call:
                </span>
                <span className="tooltip-value">
                  ${data.atm_premium.toFixed(4)}
                </span>
              </div>
            )}
            {data.otm_premium && (
              <div className="tooltip-item">
                <span className="tooltip-label" style={{ color: colors.otm }}>
                  OTM Call:
                </span>
                <span className="tooltip-value">
                  ${data.otm_premium.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate average spot price for reference line
  const avgSpotPrice = chartData.reduce((sum, point) => sum + (point.spot_price || 0), 0) / chartData.length;

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
            yAxisId="spot"
            orientation="left"
            stroke={colors.spot}
            fontSize={12}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            tick={{ fill: colors.text }}
          />
          <YAxis 
            yAxisId="premium"
            orientation="right"
            stroke={colors.itm}
            fontSize={12}
            tickFormatter={(value) => `$${value.toFixed(3)}`}
            tick={{ fill: colors.text }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: colors.text }}
          />
          
          {/* Spot price line */}
          <Line
            yAxisId="spot"
            type="monotone"
            dataKey="spot_price"
            stroke={colors.spot}
            strokeWidth={3}
            dot={false}
            name="BTC Spot Price"
            activeDot={{ r: 6, fill: colors.spot }}
          />
          
          {/* Reference line for average spot price */}
          <ReferenceLine 
            yAxisId="spot"
            y={avgSpotPrice} 
            stroke={colors.spot} 
            strokeDasharray="5 5" 
            strokeOpacity={0.3}
          />
          
          {/* Option premium lines */}
          <Line
            yAxisId="premium"
            type="monotone"
            dataKey="itm_premium"
            stroke={colors.itm}
            strokeWidth={2}
            dot={false}
            name="5% ITM Call"
            connectNulls={false}
            activeDot={{ r: 4, fill: colors.itm }}
          />
          <Line
            yAxisId="premium"
            type="monotone"
            dataKey="atm_premium"
            stroke={colors.atm}
            strokeWidth={2}
            dot={false}
            name="ATM Call"
            connectNulls={false}
            activeDot={{ r: 4, fill: colors.atm }}
          />
          <Line
            yAxisId="premium"
            type="monotone"
            dataKey="otm_premium"
            stroke={colors.otm}
            strokeWidth={2}
            dot={false}
            name="5% OTM Call"
            connectNulls={false}
            activeDot={{ r: 4, fill: colors.otm }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="chart-info">
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: colors.spot }}></span>
            <span className="legend-text">BTC Spot Price (Left Axis)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: colors.itm }}></span>
            <span className="legend-text">Option Premiums (Right Axis)</span>
          </div>
        </div>
        <p className="chart-description">
          Watch how option premiums move relative to spot price changes
        </p>
      </div>
    </div>
  );
};

export default PriceChart;