FROM node:22-alpine

WORKDIR /app

# Install build tools for native npm modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies (ensuring tsx and build tools are present)
RUN npm install

# Copy application source code
COPY . .

# Build frontend assets (Vite)
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]
