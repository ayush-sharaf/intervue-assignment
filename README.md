# Student Polling Project

A real-time collaborative polling platform built with Next.js, Express, and Socket.IO.

## Project Overview

This project is a full-stack application consisting of a Next.js frontend and an Express.js backend. It features real-time communication using Socket.IO and uses PostgreSQL as the database.

## Tech Stack

### Frontend
- Next.js 15.3.3
- React 19
- TypeScript
- TailwindCSS
- Socket.IO Client
- Next Link
- Lucide React (for icons)

### Backend
- Express.js
- Socket.IO
- PostgreSQL
- Node.js
- CORS
- UUID

## Project Structure

```
.
├── frontend/               # Next.js frontend application
│   ├── src/               # Source code
│   ├── public/            # Static files
│   ├── package.json       # Frontend dependencies
│   └── tsconfig.json      # TypeScript configuration
│
└── backend/               # Express.js backend application
    ├── index.js          # Main server file
    └── package.json      # Backend dependencies
```

## Prerequisites

- Node.js (Latest LTS version recommended)
- PostgreSQL
- npm or yarn package manager

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```


4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:3001`.

## Development

- Frontend development server: `npm run dev` (in frontend directory)
- Backend development server: `npm start` (in backend directory)
- Build frontend: `npm run build` (in frontend directory)
- Start production frontend: `npm start` (in frontend directory)

## Features

- Real-time communication using Socket.IO
- Modern UI with TailwindCSS
- Type-safe development with TypeScript
- RESTful API endpoints
- PostgreSQL database integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

