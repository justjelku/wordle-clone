# Overview

This is a Wordle-style word guessing game built as a full-stack web application. Players have to guess a daily 5-letter word within 5 attempts, with visual feedback for each guess. The game features different categories (Animals, Food, Technology, Nature, Emotions) and uses AI-generated daily words. The application includes a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern component-based UI built with React 18 and TypeScript for type safety
- **Vite**: Fast development build tool with hot module replacement
- **shadcn/ui Component Library**: Pre-built UI components using Radix UI primitives and Tailwind CSS
- **TanStack Query**: Client-side data fetching, caching, and synchronization
- **Wouter**: Lightweight client-side routing solution
- **Tailwind CSS**: Utility-first CSS framework for responsive design

The frontend follows a component-based architecture with separate components for the game grid, virtual keyboard, game header, and completion modal. Game state is managed through custom React hooks with proper separation of concerns.

## Backend Architecture
- **Express.js**: RESTful API server with middleware for request logging and error handling
- **TypeScript**: Type-safe server-side development
- **Modular Route Structure**: Clean separation of API endpoints and business logic
- **Memory Storage with Database Schema**: Currently uses in-memory storage with defined database schemas for easy migration to persistent storage
- **Service Layer Pattern**: Separated business logic for word generation and game management

The backend implements a layered architecture with routes, services, and storage abstractions that allow for easy scaling and testing.

## Data Storage Strategy
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL support
- **Schema-First Design**: Well-defined database schemas for daily words and game statistics
- **Dual Storage Approach**: Memory storage for development with PostgreSQL schema ready for production
- **Migration Ready**: Drizzle configuration set up for easy database migrations

The storage layer uses an interface-based design allowing seamless switching between memory storage and persistent database storage.

## Game Logic & State Management
- **Custom React Hooks**: Centralized game state management with useGameState hook
- **Real-time Validation**: Client-side and server-side word validation
- **Visual Feedback System**: Color-coded tile system (correct, wrong position, wrong letter)
- **Keyboard State Tracking**: Virtual keyboard reflects letter usage across guesses

The game implements Wordle's core mechanics with proper state transitions and validation rules.

# External Dependencies

## AI Integration
- **Google Gemini AI**: Generates daily words based on categories using the @google/genai package
- **Structured AI Responses**: Uses JSON schema validation for consistent word generation
- **Category-Based Generation**: AI generates words fitting specific themes (Animals, Food, etc.)

## Database & ORM
- **Neon Database**: Serverless PostgreSQL database using @neondatabase/serverless
- **Drizzle ORM**: Type-safe database operations with automatic TypeScript generation
- **Connection Pool Management**: Efficient database connection handling for serverless environments

## UI & Styling
- **Radix UI**: Accessible, unstyled UI primitives for components like dialogs, buttons, and form elements
- **Tailwind CSS**: Utility-first styling with custom design tokens and responsive design
- **Lucide React**: Consistent icon library for UI elements

## Development Tools
- **Vite Plugins**: Development experience enhanced with error overlays and hot reloading
- **Replit Integration**: Specialized plugins for Replit development environment
- **TypeScript**: Strict type checking across the entire application stack

The application is designed to be easily deployable on Replit with built-in development tools and can scale to production with the PostgreSQL database backend.