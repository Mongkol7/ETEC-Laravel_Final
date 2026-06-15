# ETEC E-Commerce Project

A full-stack e-commerce application with Laravel backend and React frontend.

## Project Structure

```
ETEC_Laravel_Project/
├── ecommerce_api_laravel/    # Laravel Backend API
├── ecommerce_api_reactjs/     # React Frontend Application
└── README.md                 # This file
```

## Backend (Laravel)

- **Framework:** Laravel (PHP)
- **Database:** PostgreSQL
- **Authentication:** Sanctum API tokens
- **Features:** 
  - Product management
  - User authentication
  - Shopping cart
  - Order processing
  - Wishlist functionality

### Setup Instructions

1. Navigate to backend directory:
   ```bash
   cd ecommerce_api_laravel
   ```

2. Install dependencies:
   ```bash
   composer install
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. Run migrations:
   ```bash
   php artisan migrate
   ```

5. Start development server:
   ```bash
   php artisan serve --port=3000
   ```

## Frontend (React + Vite)

- **Framework:** React with Vite
- **Styling:** Vanilla CSS with dark glassmorphic theme
- **State Management:** React Context API
- **Features:**
  - Product browsing and search
  - Shopping cart management
  - User authentication
  - Order history
  - Wishlist functionality

### Setup Instructions

1. Navigate to frontend directory:
   ```bash
   cd ecommerce_api_reactjs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev -- --port 3000
   ```

## Development

- Backend runs on port 3000
- Frontend runs on port 3000 (when backend is not running)
- Both applications use PostgreSQL database: `E-bookstrore_db`

## Git Repository

This project uses a single Git repository for both backend and frontend code.
