# Stage 1: Building the store
FROM node:20-alpine AS video-max

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source with proper .dockerignore
COPY tsconfig*.json ./
COPY server.ts ./

# Set environment variable
ARG VIDEO_MAX_HOST

# Build the server
RUN npm run build:server

EXPOSE 3000

# Use standalone server
CMD ["node", "--trace-deprecation", "dist/server.js"] 