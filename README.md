# Car Wash Booking System

A full-stack MERN application for managing car wash bookings with CRUD operations, search, and filtering capabilities.

## Project Structure

```
car-wash-booking/
├── client/          # React frontend with Vite
├── server/          # Express.js backend
└── README.md        # Project documentation
```

## Tech Stack

### Frontend (Client)
- React 18
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- React Hook Form
- Lucide React (icons)

### Backend (Server)
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS
- Morgan (logging)
- Express Validator
- dotenv

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

4. Set up environment variables:
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:5000`.

## API Endpoints

- `GET /` - Server status
- `GET /health` - Health check
- More endpoints will be added as development progresses

## Development

This project follows a structured development approach with separate frontend and backend applications that communicate via REST API.

## License

This project is licensed under the ISC License.