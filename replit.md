# Seblak Listyaning - Indonesian Food Delivery App

## Overview

This is a full-stack food delivery web application for "Seblak Listyaning," an Indonesian restaurant specializing in seblak (a popular Indonesian spicy dish). The application features a modern React frontend with a Node.js/Express backend, designed to provide an intuitive online ordering experience with delivery services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom Indonesian food theme colors
- **UI Components**: Radix UI with shadcn/ui component library
- **State Management**: Zustand for cart management with persistence
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query (React Query) for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Validation**: Zod for schema validation
- **Session Management**: Express sessions with PostgreSQL storage

### Key Components

#### Database Layer
- **Menu Items**: Stores restaurant menu with categories, prices, descriptions, and ratings
- **Orders**: Manages customer orders with delivery information and item details
- **Schema**: Defined in `shared/schema.ts` using Drizzle ORM with PostgreSQL dialect

#### API Layer
- **Menu Endpoints**: GET `/api/menu` for all items, GET `/api/menu/category/:category` for filtered items
- **Order Endpoints**: POST `/api/orders` for creating orders, GET `/api/orders/:id` for order details
- **Validation**: Input validation using Zod schemas for type safety

#### Frontend Features
- **Single Page Application**: Home page with all sections (hero, menu, about, contact)
- **Shopping Cart**: Persistent cart with sidebar interface using Zustand
- **Menu Display**: Category-based filtering with visual spice level indicators
- **Order Form**: Complete checkout process with customer details validation
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Data Flow

1. **Menu Loading**: Frontend fetches menu items from `/api/menu` on page load
2. **Cart Management**: Items added to cart are stored in browser localStorage via Zustand
3. **Order Placement**: Customer fills checkout form, validated with Zod, sent to `/api/orders`
4. **Order Processing**: Backend validates order data, stores in PostgreSQL, returns confirmation

## External Dependencies

### Production Dependencies
- **UI Library**: Radix UI components for accessible interfaces
- **Database**: Neon serverless PostgreSQL for cloud database hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod for runtime type checking and form validation
- **State Management**: Zustand for client-side state with persistence

### Development Dependencies
- **Build System**: Vite with React plugin and TypeScript support
- **Styling**: Tailwind CSS with PostCSS for utility-first styling
- **Development Tools**: Replit-specific plugins for enhanced development experience

## Deployment Strategy

### Development Environment
- **Local Development**: Uses Vite dev server with hot module replacement
- **Database**: Connects to Neon PostgreSQL via DATABASE_URL environment variable
- **Asset Serving**: Vite handles static assets and client-side routing

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild compiles TypeScript server code to `dist/index.js`
- **Database Migrations**: Drizzle handles schema migrations with `db:push` command
- **Static Serving**: Express serves built frontend files in production

### Environment Configuration
- **Database Connection**: Requires DATABASE_URL environment variable
- **Node Environment**: Uses NODE_ENV for development/production switching
- **Session Storage**: PostgreSQL-based session storage for scalability

The application is designed as a modern, SEO-friendly food delivery platform with Indonesian cultural elements, focusing on user experience and order management efficiency.