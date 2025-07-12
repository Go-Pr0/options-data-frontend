const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Log all environment variables for debugging
console.log(`=== Frontend Server Started ===`);
console.log(`Server running on port ${PORT}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Build directory: ${path.join(__dirname, 'build')}`);
console.log(`REACT_APP_API_URL: ${process.env.REACT_APP_API_URL || 'NOT SET'}`);
console.log(`All REACT_APP env vars:`, Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
console.log(`================================`);

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle React Router - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server listening on port ${PORT}`);
});