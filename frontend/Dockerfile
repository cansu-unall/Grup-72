# Dockerfile for DyslexiAI Frontend
FROM node:20-alpine

# Set work directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy frontend code
COPY . .

# Expose port
EXPOSE 5173

# Default command (overridden by docker-compose for dev)
CMD ["npm", "run", "dev", "--", "--host"]
