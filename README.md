# Community Library Management System

## Project description

A full-stack community library application for managing books, library users, and borrowing or stock transactions.

## Tech stack

- React and Vite
- React Router
- Express
- MySQL
- Node.js

## Folder structure

- `frontend/` - React client
- `backend/` - Express API and MySQL integration
- `backend/schema.sql` - database and seed data

## Setup

1. Create the database and seed data:
   ```bash
   mysql -u root -p < backend/schema.sql
   ```
2. Install and start the backend:
   ```bash
   cd backend
   npm install
   npm start
   ```
3. Install and start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Environment variables

Backend variables:

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`
- `CORS_ORIGIN`
- `PORT`

Frontend variable:

- `VITE_API_URL`

Use `backend/.env.example` and `frontend/.env.example` as templates.

## Default login accounts

- Khopotso / ADMIN001
- David / LIB001
- Carol / MEM001

## Known limitations

Authentication is client-side only. Login is not protected by passwords, sessions, or server-side authorization.
