# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY packages ./packages
COPY apps/linkos ./apps/linkos

# Install dependencies
RUN npm ci

# Build LinkOS
RUN npm run build:linkos

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/apps/linkos/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/linkos/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
