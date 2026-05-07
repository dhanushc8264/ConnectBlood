# Use Node base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy full project
COPY . .

# Expose port
EXPOSE 8000

# Start server
CMD ["npm", "start"]
