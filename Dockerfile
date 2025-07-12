FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Copy and make startup script executable
COPY start.sh ./
RUN chmod +x start.sh

# Expose port (Railway will set the actual port via PORT env var)
EXPOSE 3000

# Start the application with dynamic port
CMD ["./start.sh"]