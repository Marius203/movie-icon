# Movie Collection Manager

A full-stack web application for managing and exploring a collection of movies. Built with Vue.js for the frontend and Node.js/Express for the backend.

## Features

### Movie Management

- Browse all movies with infinite scroll
- View detailed movie information
- Add movies to your personal collection
- Sort movies by title and rating
- Real-time movie classification chart
- Automatic movie generation for testing

### Movie Classification

- Movies are automatically classified into three categories:
  - 👴 Oldies (released before 1980)
  - 👨 Iconic (released between 1980 and 2000)
  - 👶 New Gen (released after 2000)
- Visual representation of movie distribution

### User Experience

- Modern, responsive UI with Tailwind CSS
- Infinite scroll for smooth browsing
- Real-time updates
- Interactive movie details popup
- Easy-to-use sorting and filtering

## Tech Stack

### Frontend

- Vue.js 3
- Pinia for state management
- Tailwind CSS for styling
- Axios for API requests
- Chart.js for data visualization

### Backend

- Node.js
- Express.js
- File-based storage
- RESTful API
- Multer for file uploads

## Docker Setup

This project is containerized using Docker, making it easy to run the entire application stack with a single command.

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Application

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd movie-icon
   ```

2. Start the application using Docker Compose:

   ```bash
   docker-compose up
   ```

   This will start all services:

   - Frontend (Vue.js) on http://localhost:5173
   - Backend (Node.js) on http://localhost:3000
   - PostgreSQL database on port 5432

3. To run in detached mode (in the background):

   ```bash
   docker-compose up -d
   ```

4. To stop the application:
   ```bash
   docker-compose down
   ```

### Development Workflow

The Docker setup includes volume mounts for both frontend and backend, allowing you to make changes to the code without rebuilding the containers.

- Frontend code changes will be automatically reflected in the browser
- Backend code changes will require a restart of the backend service:
  ```bash
  docker-compose restart backend
  ```

### Database

The PostgreSQL database data is persisted in a Docker volume named `postgres-data`. This ensures that your data remains even if you stop or remove the containers.

### Environment Variables

The application uses environment variables for configuration. These are set in the `docker-compose.yml` file. You can modify these values as needed.

## Manual Setup (without Docker)

If you prefer to run the application without Docker, please refer to the individual README files in the frontend and backend directories.

## API Endpoints

### Movies

- `GET /movies` - Get all movies with sorting and pagination
- `GET /movies/:id` - Get a single movie by ID
- `POST /movies` - Create a new movie
- `PUT /movies/:id` - Update a movie
- `DELETE /movies/:id` - Delete a movie

### Movie Generation

- `POST /movies/generation/start` - Start automatic movie generation
- `POST /movies/generation/stop` - Stop automatic movie generation
- `GET /movies/generation/status` - Check generation status

## Project Structure

```
movie-icon/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── stores/
│   │   ├── views/
│   │   └── App.vue
│   └── package.json
├── backend/
│   ├── server.js
│   ├── movieGenerator.js
│   ├── data.json
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Vue.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Chart.js for the data visualization library
- Faker.js for the mock data generation

## Deployment to Azure

This project includes scripts to help you deploy the application to Azure. There are two main deployment options:

### Option 1: Automated Deployment

Use the `azure-deploy.ps1` PowerShell script for an automated deployment process:

```powershell
.\azure-deploy.ps1
```

This script will:

1. Check for Azure CLI installation
2. Log you into Azure
3. Create a resource group
4. Deploy the application using Azure Container Apps
5. Output the application URL

### Option 2: Manual Deployment

If you prefer to deploy manually, follow the instructions in the `AZURE-DEPLOY.md` file.

### Testing the Deployment

After deployment, you can verify that everything is working correctly by running the test script:

```powershell
.\test-deployment.ps1
```

This script will:

1. Check if the application is accessible
2. Verify the container app status
3. Display the application URL

### Cleanup

To clean up all Azure resources created by the deployment, use the `azure-cleanup.ps1` script:

```powershell
.\azure-cleanup.ps1
```

### Troubleshooting

If you encounter any issues during deployment, please refer to the `TROUBLESHOOTING.md` file for common problems and their solutions.

## Project Structure

- `frontend/`: Contains the React frontend application
- `backend/`: Contains the Node.js backend application
- `azure-deploy.ps1`: Automated deployment script
- `azure-cleanup.ps1`: Cleanup script
- `test-deployment.ps1`: Test script for verifying deployment
- `AZURE-DEPLOY.md`: Manual deployment guide
- `TROUBLESHOOTING.md`: Guide for troubleshooting common issues

## Prerequisites

- Azure account with an active subscription
- Azure CLI installed
- Docker installed (for local development)
- Node.js and npm (for local development)

## Local Development

To run the application locally:

1. Start the backend:

   ```bash
   cd backend
   npm install
   npm start
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## License

This project is licensed under the MIT License.
