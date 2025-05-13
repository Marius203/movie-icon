FROM node:18-alpine as backend

WORKDIR /app/backend

# Copy package.json and package-lock.json
COPY backend/package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the backend application
COPY backend/ ./

# Generate Prisma client
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p uploads

# Build frontend
FROM node:18-alpine as frontend

WORKDIR /app/frontend

# Copy package.json and package-lock.json
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend application
COPY frontend/ ./

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy backend
COPY --from=backend /app/backend ./backend

# Copy frontend build
COPY --from=frontend /app/frontend/dist ./frontend/dist

# Install serve
RUN npm install -g serve

# Expose port
EXPOSE 8080

# Start the application
CMD ["sh", "-c", "cd backend && npm start & cd frontend && serve -s dist -l 8080"] 