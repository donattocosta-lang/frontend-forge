# =====================================================
# BACKEND DOCKERFILE - Node.js API
# =====================================================
FROM node:20-alpine

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package files
COPY docs/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server code
COPY docs/server.js ./

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server.js"]
