# Simple Express.js Backend API

A lightweight Express.js server that uses a local JSON file to store data.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
node server.js
```

The server will run on http://localhost:3000

## API Endpoints

### GET /items

Get all items

### GET /items/:id

Get a single item by ID

### POST /items

Create a new item

```json
{
  "name": "Item name",
  "description": "Item description"
}
```

### PUT /items/:id

Update an existing item

```json
{
  "name": "Updated name",
  "description": "Updated description"
}
```

### DELETE /items/:id

Delete an item by ID

## Error Handling

The API includes basic error handling for:

- Item not found (404)
- Missing required fields (400)
- Invalid requests

## Data Storage

All data is stored in `data.json` in the root directory.

## Testing

This project uses Jest for unit testing. The tests are located in the `server.test.js` file.

### Running Tests

To run the tests, use the following commands:

```bash
# Run all tests
npm test

# Run tests in watch mode (tests will re-run when files change)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

The tests are organized by API endpoint:

- `GET /movies` - Tests for retrieving all movies, with filtering and sorting
- `GET /movies/:id` - Tests for retrieving a single movie by ID
- `POST /movies` - Tests for creating a new movie
- `PUT /movies/:id` - Tests for updating an existing movie
- `DELETE /movies/:id` - Tests for deleting a movie

Each test suite includes tests for both successful operations and error cases.
