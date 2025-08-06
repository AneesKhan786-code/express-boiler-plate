# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Build TypeScript
RUN npm run build

# Expose the app port
EXPOSE 8000


CMD ["sh", "-c", "npx drizzle-kit push:pg && npm run dev"]