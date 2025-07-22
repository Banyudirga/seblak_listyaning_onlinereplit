# Seblak Delivery Scripts

This directory contains utility scripts for the Seblak Delivery application.

## Available Scripts

### Seed Supabase Database

The `seed-supabase.js` script populates your Supabase database with mock menu items from the application.

#### Prerequisites

1. Make sure you have set up your Supabase project and created the necessary tables as described in the main README.md file.
2. Ensure your `.env` file in the root directory contains valid Supabase credentials:
   ```
   SUPABASE_URL=https://your-supabase-url.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   ```

#### Usage

1. Install dependencies:
   ```bash
   cd scripts
   npm install
   ```

2. Run the seeding script:
   ```bash
   # JavaScript version
   npm run seed
   
   # TypeScript version (recommended)
   npm run seed:ts
   ```

#### What the Script Does

- Checks if menu items already exist in the database to avoid duplicates
- Inserts all menu items from `server/mock-data.ts` into the Supabase `menu_items` table
- Provides detailed logging of the seeding process

#### Troubleshooting

If you encounter errors:

1. Verify your Supabase credentials in the `.env` file
2. Ensure the `menu_items` table exists in your Supabase database with the correct schema
3. Check the console output for specific error messages