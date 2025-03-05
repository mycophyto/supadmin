# AdminDB

A modern database management interface for Supabase.

## Features

- Browse and manage your Supabase database tables
- View and edit table records
- Customize table display names and visibility
- Multi-language support (English and French)
- Settings persistence using SQLite
- Modern and responsive UI

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your Supabase credentials:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase project's anon/public key
   - `VITE_SUPABASE_SERVICE_KEY`: Your Supabase project's service role key
     (optional)

5. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

The following environment variables are required:

- `VITE_SUPABASE_URL`: Your Supabase project URL (e.g.,
  https://your-project.supabase.co)
- `VITE_SUPABASE_ANON_KEY`: Your Supabase project's anon/public key
- `VITE_SUPABASE_SERVICE_KEY`: Your Supabase project's service role key
  (optional, but recommended for full functionality)

## Settings Storage

The application uses SQLite to store user settings locally. The database file is
created automatically in the user's application data directory.

## Development

- Built with React + Vite
- Uses TypeScript for type safety
- Styled with Tailwind CSS
- Uses Shadcn UI components

## License

MIT
