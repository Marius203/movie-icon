# Deployment Guide

This project consists of a separate frontend and backend that should be deployed independently.

## Backend Deployment

### Option 1: Render

1. Create a new Web Service on Render
2. Connect your Git repository
3. Set the following configuration:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
4. Add the following environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string for JWT token signing
   - `PORT`: 3000 (or let Render assign one)
5. Deploy the service

### Option 2: Railway

1. Create a new project on Railway
2. Connect your Git repository
3. Set the following configuration:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
4. Add the following environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string for JWT token signing
   - `PORT`: 3000 (or let Railway assign one)
5. Deploy the service

## Frontend Deployment

### Option 1: Render

1. Create a new Static Site on Render
2. Connect your Git repository
3. Set the following configuration:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add the following environment variables:
   - `VITE_API_URL`: The URL of your deployed backend API
5. Deploy the service

### Option 2: Railway

1. Create a new project on Railway
2. Connect your Git repository
3. Set the following configuration:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
4. Add the following environment variables:
   - `VITE_API_URL`: The URL of your deployed backend API
5. Deploy the service

## Database Setup

Both Render and Railway offer PostgreSQL databases that can be easily connected to your backend.

1. Create a new PostgreSQL database on your chosen platform
2. Get the connection string and set it as the `DATABASE_URL` environment variable
3. Run the Prisma migrations on your deployed backend:
   ```
   npx prisma migrate deploy
   ```

## Troubleshooting

If you encounter any issues during deployment:

1. Check the build logs for errors
2. Ensure all environment variables are correctly set
3. Verify that the database connection is working
4. Check that the frontend is correctly configured to connect to the backend API
