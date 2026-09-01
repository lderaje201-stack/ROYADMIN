# Royal Dental Admin App

This is the Royal Dental staff/admin portal. It is an administrative single-page application built with React, Vite, TypeScript, and Tailwind CSS. It connects to the unified Supabase backend.

## How to run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Required Environment Variables

You must provide the following environment variables in your `.env` file (see `.env.example`):

- `VITE_SUPABASE_URL`: Your Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase public anonymous key.
