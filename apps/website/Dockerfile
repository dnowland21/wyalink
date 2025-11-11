# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY packages ./packages
COPY apps/website ./apps/website

# Install dependencies
RUN npm ci

# Build the website
RUN npm run build:website

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/apps/website/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/website/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
