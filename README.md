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

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd movie-icon
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Install backend dependencies:

```bash
cd ../backend
npm install
```

### Running the Application

1. Start the backend server:

```bash
cd backend
npm start
```

2. Start the frontend development server:

```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

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
