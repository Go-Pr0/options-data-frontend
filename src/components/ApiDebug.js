import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function ApiDebug() {
  const [apiStatus, setApiStatus] = useState('checking...');
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('Testing API connection to:', API_BASE_URL);
        const response = await fetch(`${API_BASE_URL}/`);
        const data = await response.json();
        setApiStatus('connected');
        setApiResponse(data);
        console.log('API Response:', data);
      } catch (error) {
        setApiStatus('failed');
        setApiResponse({ error: error.message });
        console.error('API Connection failed:', error);
      }
    };

    testApi();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <div><strong>API Debug Info</strong></div>
      <div>URL: {API_BASE_URL}</div>
      <div>Status: <span style={{ color: apiStatus === 'connected' ? 'green' : 'red' }}>{apiStatus}</span></div>
      {apiResponse && (
        <div>
          <div>Response:</div>
          <pre style={{ fontSize: '10px', maxHeight: '100px', overflow: 'auto' }}>
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ApiDebug;