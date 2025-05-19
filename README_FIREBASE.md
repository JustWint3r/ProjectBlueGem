# Firebase Deployment Instructions

This project has been set up for deployment to Firebase Cloud Run, allowing background workers and WebSocket support.

## Environment Setup

Create a `.env` file with the following variables:

```
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://justwint3r:8WD1WIT8YArwInF5@projectbluegem.smhogoz.mongodb.net/steam_market_monitor

# Steam Market Monitor Settings
MAX_PAGES_TO_SCAN=50

# Port for the application server
PORT=8080
```

## Local Development

1. Install dependencies:
```
npm install
```

2. Run the development server:
```
npm run dev:server
```

This will start both the Next.js frontend and the background worker.

## Firebase Deployment

Follow the detailed instructions in `FIREBASE_DEPLOYMENT.md` for complete deployment steps.

The main steps are:

1. Install Firebase CLI
2. Initialize Firebase
3. Deploy to Cloud Run

## Project Structure

- `src/server.ts` - Main server with WebSocket and background worker
- `src/services/workerService.ts` - Background worker that scans the market
- `src/services/socketService.ts` - WebSocket service for real-time updates 