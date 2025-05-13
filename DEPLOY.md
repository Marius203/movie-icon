# Deployment Guide

This guide provides instructions on how to deploy the Movie Collection Manager application using Docker and AWS.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your local machine
- [Docker Compose](https://docs.docker.com/compose/install/) installed on your local machine
- [AWS CLI](https://aws.amazon.com/cli/) installed and configured with your AWS credentials
- [AWS Elastic Beanstalk CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html) (optional, for Elastic Beanstalk deployment)

## Local Deployment with Docker

1. Clone the repository:

```bash
git clone <repository-url>
cd movie-icon
```

2. Build and start the containers:

```bash
docker-compose up -d
```

3. Access the application at http://localhost

## Free AWS Deployment Options

### Option 1: AWS Elastic Beanstalk (Free Tier)

AWS Elastic Beanstalk offers a free tier that includes:
- 750 hours per month of t2.micro or t3.micro instances
- 30GB of Elastic Block Storage
- 1GB of outbound data transfer

#### Deployment Steps:

1. Create a `Dockerrun.aws.json` file in the root directory:

```json
{
  "AWSEBDockerrunVersion": "3",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "<your-docker-hub-username>/movie-icon-frontend:latest",
      "essential": true,
      "memory": 256,
      "portMappings": [
        {
          "hostPort": 80,
          "containerPort": 80
        }
      ],
      "links": ["backend"]
    },
    {
      "name": "backend",
      "image": "<your-docker-hub-username>/movie-icon-backend:latest",
      "essential": true,
      "memory": 256,
      "portMappings": [
        {
          "hostPort": 3000,
          "containerPort": 3000
        }
      ]
    }
  ]
}
```

2. Build and push your Docker images to Docker Hub:

```bash
# Build the images
docker build -t <your-docker-hub-username>/movie-icon-frontend:latest ./frontend
docker build -t <your-docker-hub-username>/movie-icon-backend:latest ./backend

# Push to Docker Hub
docker push <your-docker-hub-username>/movie-icon-frontend:latest
docker push <your-docker-hub-username>/movie-icon-backend:latest
```

3. Create an Elastic Beanstalk application and environment:

```bash
# Initialize Elastic Beanstalk application
eb init -p docker movie-icon-app

# Create and deploy to an environment
eb create movie-icon-env
```

### Option 2: AWS App Runner (Free Tier)

AWS App Runner offers a free tier that includes:
- 750 hours per month of compute
- 1GB of memory
- 1GB of storage

#### Deployment Steps:

1. Create a Docker Compose file for App Runner:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./dev.db
    volumes:
      - app-data:/app/uploads
    restart: unless-stopped

volumes:
  app-data:
```

2. Create a Dockerfile in the root directory:

```dockerfile
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
```

3. Deploy to AWS App Runner:

```bash
# Build the Docker image
docker build -t movie-icon-app .

# Push to Amazon ECR
aws ecr create-repository --repository-name movie-icon-app
aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.<your-region>.amazonaws.com
docker tag movie-icon-app:latest <your-account-id>.dkr.ecr.<your-region>.amazonaws.com/movie-icon-app:latest
docker push <your-account-id>.dkr.ecr.<your-region>.amazonaws.com/movie-icon-app:latest

# Deploy to App Runner
aws apprunner create-service --service-name movie-icon-app --source-configuration imageRepository={imageIdentifier=<your-account-id>.dkr.ecr.<your-region>.amazonaws.com/movie-icon-app:latest,imageConfiguration={port=8080}}
```

### Option 3: AWS Lightsail (Free Tier)

AWS Lightsail offers a free tier that includes:
- 750 hours per month of t2.micro or t3.micro instances
- 30GB of SSD storage
- 1TB of data transfer

#### Deployment Steps:

1. Create a Lightsail instance with the Docker blueprint.

2. SSH into your Lightsail instance:

```bash
ssh -i <your-key-file>.pem ec2-user@<your-instance-ip>
```

3. Clone your repository and deploy:

```bash
git clone <repository-url>
cd movie-icon
docker-compose up -d
```

## Alternative Free Deployment Options

### Render.com

Render offers a free tier that includes:
- 750 hours per month of compute
- 512MB of RAM
- 1GB of storage

#### Deployment Steps:

1. Create a Render account and connect your GitHub repository.

2. Create a new Web Service and select your repository.

3. Configure the service:
   - Build Command: `docker-compose build`
   - Start Command: `docker-compose up`
   - Environment Variables: Add any required environment variables

### Railway.app

Railway offers a free tier that includes:
- 500 hours per month of compute
- 512MB of RAM
- 1GB of storage

#### Deployment Steps:

1. Create a Railway account and connect your GitHub repository.

2. Create a new project and select your repository.

3. Configure the service:
   - Build Command: `docker-compose build`
   - Start Command: `docker-compose up`
   - Environment Variables: Add any required environment variables

## Monitoring and Maintenance

- Set up AWS CloudWatch alarms to monitor your application's health
- Regularly update your Docker images with security patches
- Monitor your free tier usage to avoid unexpected charges

## Troubleshooting

- Check container logs: `docker-compose logs`
- Check AWS CloudWatch logs for AWS deployments
- Ensure all environment variables are correctly set
- Verify network connectivity between services 