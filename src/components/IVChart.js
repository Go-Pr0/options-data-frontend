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

const IVChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="no-data">
          <span className="no-data-icon">📈</span>
          <p>No IV data available yet. Data collection in progress...</p>
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

  // Custom tooltip
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
          {data.itm_iv && (
            <p style={{ margin: '2px 0', color: '#82ca9d' }}>
              ITM IV: {data.itm_iv.toFixed(2)}%
            </p>
          )}
          {data.atm_iv && (
            <p style={{ margin: '2px 0', color: '#ffc658' }}>
              ATM IV: {data.atm_iv.toFixed(2)}%
            </p>
          )}
          {data.otm_iv && (
            <p style={{ margin: '2px 0', color: '#ff7300' }}>
              OTM IV: {data.otm_iv.toFixed(2)}%
            </p>
          )}
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
        <LineChart data={normalizedSpotData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="#666"
            fontSize={12}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* IV lines */}
          <Line
            type="monotone"
            dataKey="itm_iv"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={false}
            name="5% ITM Call IV"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="atm_iv"
            stroke="#ffc658"
            strokeWidth={2}
            dot={false}
            name="ATM Call IV"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="otm_iv"
            stroke="#ff7300"
            strokeWidth={2}
            dot={false}
            name="5% OTM Call IV"
            connectNulls={false}
          />
          
          {/* Normalized spot price overlay */}
          <Line
            type="monotone"
            dataKey="normalized_spot"
            stroke="#8884d8"
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
              stroke="#666" 
              strokeDasharray="3 3" 
              strokeOpacity={0.5}
              label={{ value: `Avg IV: ${avgIV.toFixed(1)}%`, position: "topRight" }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      
      <div style={{ 
        marginTop: '15px', 
        fontSize: '0.9rem', 
        color: '#666',
        textAlign: 'center'
      }}>
        <p>
          📊 <strong>Implied Volatility (IV):</strong> Market's expectation of future price movement
        </p>
        <p>
          💡 <strong>Higher IV = Higher option premiums</strong> | 
          📈 <strong>Dashed line:</strong> Normalized BTC price for correlation analysis
        </p>
      </div>
    </div>
  );
};

export default IVChart;