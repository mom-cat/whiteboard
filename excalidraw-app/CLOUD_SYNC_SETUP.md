# Excalidraw Cloud Sync Setup Guide

This guide explains how to set up and use the cloud sync functionality with Supabase for Excalidraw.

## Features

- **User Authentication**: Sign up and sign in with email/password
- **Cloud Storage**: Save drawings to the cloud with titles and privacy settings
- **Drawing Management**: Load, search, and delete your cloud drawings
- **Public Drawings**: Share drawings publicly or keep them private
- **Real-time Sync**: Automatic synchronization across devices

## Setup Instructions

### 1. Supabase Project Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Go to your project dashboard
3. Navigate to Settings > API to get your project URL and anon key

### 2. Database Schema Setup

Run the SQL schema provided in `excalidraw-app/database/schema.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Run the query to create tables, policies, and triggers

### 3. Environment Configuration

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Install Dependencies

Make sure you have the Supabase client installed:

```bash
npm install @supabase/supabase-js
```

## Usage

### Authentication

- **Sign Up**: Click the cloud save button or use Command Palette → "Sign In" to open auth dialog
- **Sign In**: Use existing credentials to access your account
- **Sign Out**: Available through the main menu

### Saving Drawings

1. Create or edit a drawing
2. Use Command Palette → "Save to Cloud" or click the save button
3. Enter a title for your drawing
4. Choose whether to make it public
5. Click "Save"

### Loading Drawings

1. Use Command Palette → "Load from Cloud"
2. Browse your drawings or public drawings
3. Use search to find specific drawings
4. Click "Load" on any drawing to open it

### Managing Drawings

- **Delete**: Click the delete button on your own drawings
- **Search**: Use the search box to find drawings by title
- **Public/Private**: Toggle visibility when saving

## Database Schema

The system uses two main tables:

### user_profiles

- Stores user information and preferences
- Automatically created when users sign up
- Links to Supabase auth.users table

### drawings

- Stores drawing data including elements, app state, and files
- Supports versioning and public/private visibility
- Includes full-text search on titles

## Security

- **Row Level Security (RLS)**: Enabled on all tables
- **User Isolation**: Users can only access their own private drawings
- **Public Access**: Public drawings are readable by everyone
- **Authentication Required**: All write operations require authentication

## API Reference

### Authentication Service (`authService`)

```typescript
// Sign up new user
await authService.signUp(email, password, displayName?)

// Sign in existing user
await authService.signIn(email, password)

// Sign out current user
await authService.signOut()

// Get current user
const user = await authService.getCurrentUser()

// Listen to auth changes
authService.onAuthStateChange(callback)
```

### Drawing Service (`drawingService`)

```typescript
// Save drawing to cloud
await drawingService.saveDrawing(title, elements, appState, files, isPublic, drawingId?)

// Load drawing by ID
const drawing = await drawingService.loadDrawing(drawingId)

// Get user's drawings
const drawings = await drawingService.getUserDrawings()

// Delete drawing
await drawingService.deleteDrawing(drawingId)

// Search drawings
const results = await drawingService.searchDrawings(query, isPublicOnly?)

// Get public drawings
const publicDrawings = await drawingService.getPublicDrawings(limit?, offset?)
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**

   - Check your Supabase URL and anon key
   - Verify RLS policies are correctly set up
   - Ensure email confirmation is disabled or properly configured

2. **Save/Load Failures**

   - Check browser console for detailed error messages
   - Verify database schema is correctly applied
   - Ensure user has proper permissions

3. **Missing Environment Variables**
   - Make sure `.env.local` exists and contains valid values
   - Restart the development server after changing environment variables

### Development Tips

- Use Supabase dashboard to monitor database activity
- Check the Network tab in browser dev tools for API calls
- Enable Supabase debug mode for detailed logging
- Test with different user accounts to verify isolation

## Contributing

When contributing to cloud sync functionality:

1. Test with multiple user accounts
2. Verify RLS policies work correctly
3. Check that public/private visibility works as expected
4. Test error handling for network failures
5. Ensure UI is responsive and accessible

## Security Considerations

- Never expose service role keys in client-side code
- Always validate user permissions on the server side
- Use HTTPS in production
- Regularly update dependencies
- Monitor for suspicious activity in Supabase dashboard
