# Transitioning from Vercel to Firebase

This document outlines the changes made to migrate the Steam Market Pattern Monitor from Vercel to Firebase.

## Architecture Changes

1. **Removed Vercel-specific configurations**
   - Deleted `vercel.json` with cron jobs
   - These scheduled jobs are no longer needed as we're using a real server

2. **Restored WebSocket functionality**
   - Updated `page.tsx` to use Socket.io client
   - Removed polling mechanism and restored real-time updates

3. **Restored background worker process**
   - `server.ts` already had the worker setup
   - Updated server to work with Cloud Run environment settings

4. **Added Firebase deployment configuration**
   - Created `firebase.json` for hosting configuration
   - Created `Dockerfile` for Cloud Run deployment

## File Changes

1. **Frontend (`src/app/page.tsx`)**
   - Replaced polling with WebSocket connection
   - Added connection status indicator
   - Updated UI text to reflect real-time updates

2. **Server (`src/server.ts`)**
   - Updated hostname to work with Cloud Run (`0.0.0.0`)
   - Updated port to match Cloud Run default (`8080`)

3. **Package.json**
   - Updated start script for production mode
   - Added Windows-compatible start script

4. **Deployment Files**
   - Created `firebase.json` for configuration
   - Created `Dockerfile` for containerization
   - Added `FIREBASE_DEPLOYMENT.md` with detailed instructions

## Benefits of Firebase Cloud Run

1. **No execution time limits**
   - Vercel: 10-second limit for serverless functions (free tier)
   - Firebase/Cloud Run: Can run continuously as a server

2. **WebSocket Support**
   - Vercel: No WebSocket support in serverless functions
   - Firebase/Cloud Run: Full WebSocket support

3. **Background Processing**
   - Vercel: Required workarounds with cron jobs and API endpoints
   - Firebase/Cloud Run: Can run true background processes

## Next Steps

1. Follow the instructions in `FIREBASE_DEPLOYMENT.md` to deploy
2. Set up environment variables in Cloud Run
3. Test WebSocket connections after deployment 