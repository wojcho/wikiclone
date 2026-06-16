# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the app
RUN npx vite build --logLevel=error


# ---- Serve after build ----
FROM node:20-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built assets from previous stage
COPY --from=build /app/dist ./dist

# Expose port (serve default is 3000)
EXPOSE 3000

# Serve the static build folder
CMD ["serve", "-s", "dist", "-l", "3000"]
