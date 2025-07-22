// Script to seed Supabase with mock data
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { defaultMenuItems } from '../server/mock-data';
import type { Database } from '../server/database.types';

// Load environment variables
dotenv.config({ path: '../.env' });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set.');
  console.error('Please check your .env file or environment variables.');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Check if menu items already exist
    const { data: existingItems, error: checkError } = await supabase
      .from('menu_items')
      .select('id')
      .limit(1);

    if (checkError) {
      throw new Error(`Error checking for existing menu items: ${checkError.message}`);
    }

    // If items already exist, ask for confirmation to delete them
    if (existingItems && existingItems.length > 0) {
      console.log('Menu items already exist in the database.');
      console.log('Skipping insertion to avoid duplicates.');
      console.log('If you want to re-seed the database, first delete all records from the menu_items table.');
      return;
    }

    // Insert menu items
    console.log(`Inserting ${defaultMenuItems.length} menu items...`);
    
    for (const item of defaultMenuItems) {
      const { error } = await supabase
        .from('menu_items')
        .insert({
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image: item.image,
          spicy_level: item.spicyLevel,
          stock_quantity: item.stockQuantity,
          low_stock_threshold: item.lowStockThreshold,
          unit: item.unit,
          is_available: item.isAvailable,
          rating: item.rating,
          review_count: item.reviewCount
        });

      if (error) {
        console.error(`Error inserting menu item ${item.name}:`, error);
      } else {
        console.log(`Inserted menu item: ${item.name}`);
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error instanceof Error ? error.message : String(error));
  }
}

// Run the seeding function
seedDatabase();