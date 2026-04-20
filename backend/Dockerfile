# Use Python as the base but install Node.js
FROM python:3.10-slim

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy backend files
COPY package*.json ./
RUN npm install

# Copy everything else (including ai-services)
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r ai-services/requirements.txt

# Create dummy model file if it doesn't exist to prevent crash (optional, depends on your app logic)
# RUN touch ai-services/emotion_model.pkl

# Expose the gateway port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
