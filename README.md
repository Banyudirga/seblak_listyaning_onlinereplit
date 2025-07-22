# Seblak Delivery App

A food delivery application for Seblak, a popular Indonesian dish.

## Features

- Menu display with categories
- Shopping cart functionality
- Order processing
- Admin dashboard for order management
- Inventory management

## Tech Stack

- Frontend: React, TailwindCSS
- Backend: Express.js
- Database: Supabase (PostgreSQL)
- State Management: Zustand
- API Client: React Query

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Supabase Setup

1. Create a new project on [Supabase](https://supabase.com/)
2. Create the following tables in your Supabase database:

   **menu_items**
   ```sql
   CREATE TABLE menu_items (
     id SERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT NOT NULL,
     price INTEGER NOT NULL,
     category TEXT NOT NULL,
     image TEXT NOT NULL,
     spicy_level TEXT,
     stock_quantity INTEGER DEFAULT 50,
     low_stock_threshold INTEGER DEFAULT 10,
     unit TEXT DEFAULT 'porsi',
     is_available INTEGER DEFAULT 1,
     rating INTEGER DEFAULT 45,
     review_count INTEGER DEFAULT 0
   );
   ```

   **orders**
   ```sql
   CREATE TABLE orders (
     id SERIAL PRIMARY KEY,
     customer_name TEXT NOT NULL,
     customer_phone TEXT NOT NULL,
     customer_address TEXT NOT NULL,
     service_type TEXT NOT NULL,
     payment_method TEXT NOT NULL,
     notes TEXT,
     items JSONB NOT NULL,
     total_amount INTEGER NOT NULL,
     status TEXT NOT NULL DEFAULT 'pending',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. Get your Supabase URL and anon key from your project settings

### Application Setup

1. Clone the repository
   ```
   git clone <repository-url>
   cd SeblakDelivery
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure environment variables
   - Rename `.env.example` to `.env`
   - Update the following variables with your Supabase credentials:
     ```
     SUPABASE_URL=https://your-supabase-url.supabase.co
     SUPABASE_KEY=your-supabase-anon-key
     DATABASE_URL=postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
     ```

4. Run the development server
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5000`

## Deployment

1. Build the application
   ```
   npm run build
   ```

2. Start the production server
   ```
   npm start
   ```

## Using Supabase for Storage

This application uses Supabase as its database and storage solution. The application will automatically:

1. Connect to your Supabase project using the credentials in the `.env` file
2. Initialize the database with default menu items if none exist
3. Store all orders in the Supabase database

You can manage your data directly through the Supabase dashboard.

### Seeding the Database

To populate your Supabase database with the default menu items, you can use the provided seeding script:

```bash
# Navigate to the scripts directory
cd scripts

# Install dependencies
npm install

# Run the seeding script (TypeScript version)
npm run seed:ts
```

This will add all the menu items from `server/mock-data.ts` to your Supabase database. For more details, see the [Scripts README](./scripts/README.md).

## Image Storage

For storing menu item images, you have two options:

1. Use external image URLs (as configured in the current setup)
2. Use Supabase Storage for image uploads (requires additional implementation) PREFER THIS ONE

## License

MIT