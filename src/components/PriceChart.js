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

const PriceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="no-data">
          <span className="no-data-icon">📊</span>
          <p>No price data available yet. Data collection in progress...</p>
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

  // Custom tooltip to show both spot price and option premiums
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          color: 'white'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{data.time}</p>
          <p style={{ margin: '2px 0', color: '#8884d8' }}>
            BTC Spot: ${data.spot_price?.toLocaleString()}
          </p>
          {data.itm_premium && (
            <p style={{ margin: '2px 0', color: '#82ca9d' }}>
              ITM Call: ${data.itm_premium.toFixed(4)}
            </p>
          )}
          {data.atm_premium && (
            <p style={{ margin: '2px 0', color: '#ffc658' }}>
              ATM Call: ${data.atm_premium.toFixed(4)}
            </p>
          )}
          {data.otm_premium && (
            <p style={{ margin: '2px 0', color: '#ff7300' }}>
              OTM Call: ${data.otm_premium.toFixed(4)}
            </p>
          )}
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
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="#666"
            fontSize={12}
            interval="preserveStartEnd"
          />
          <YAxis 
            yAxisId="spot"
            orientation="left"
            stroke="#8884d8"
            fontSize={12}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <YAxis 
            yAxisId="premium"
            orientation="right"
            stroke="#82ca9d"
            fontSize={12}
            tickFormatter={(value) => `$${value.toFixed(3)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Spot price line */}
          <Line
            yAxisId="spot"
            type="monotone"
            dataKey="spot_price"
            stroke="#8884d8"
            strokeWidth={3}
            dot={false}
            name="BTC Spot Price"
          />
          
          {/* Reference line for average spot price */}
          <ReferenceLine 
            yAxisId="spot"
            y={avgSpotPrice} 
            stroke="#8884d8" 
            strokeDasharray="5 5" 
            strokeOpacity={0.5}
          />
          
          {/* Option premium lines */}
          <Line
            yAxisId="premium"
            type="monotone"
            dataKey="itm_premium"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={false}
            name="5% ITM Call"
            connectNulls={false}
          />
          <Line
            yAxisId="premium"
            type="monotone"
            dataKey="atm_premium"
            stroke="#ffc658"
            strokeWidth={2}
            dot={false}
            name="ATM Call"
            connectNulls={false}
          />
          <Line
            yAxisId="premium"
            type="monotone"
            dataKey="otm_premium"
            stroke="#ff7300"
            strokeWidth={2}
            dot={false}
            name="5% OTM Call"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div style={{ 
        marginTop: '15px', 
        fontSize: '0.9rem', 
        color: '#666',
        textAlign: 'center'
      }}>
        <p>
          📈 <strong>Left Y-axis:</strong> BTC Spot Price (USD) | 
          📊 <strong>Right Y-axis:</strong> Option Premiums (USD)
        </p>
        <p>
          💡 <strong>Tip:</strong> Watch how option premiums move relative to spot price changes
        </p>
      </div>
    </div>
  );
};

export default PriceChart;