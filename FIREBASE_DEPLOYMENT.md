# Firebase Deployment Guide

This guide explains how to deploy your Steam Market Pattern Monitor on Firebase, reverting back to the original architecture with WebSockets and background workers.

## Architecture Overview

By switching to Firebase hosting + Cloud Functions + Cloud Run, you can achieve:

1. **Long-Running Background Workers**
   - Use Cloud Run to host your Node.js server with WebSockets and continuous background workers
   - No 10-second execution limit (unlike Vercel functions)

2. **WebSocket Support**
   - Maintain real-time connections via Socket.io
   - Get instant notifications for new matching items

3. **MongoDB Atlas Integration**
   - Continue using your MongoDB Atlas database
   - Update connection string in environment variables

## Setup Steps

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Initialize Firebase in Your Project

```bash
cd my-app
firebase login
firebase init
```

When prompted:
- Select **Hosting** and **Cloud Run: Configure Cloud Run services**
- Choose to create a new project or use an existing one
- Use `build` as your public directory
- Configure as a single-page app? **Yes**
- Set up GitHub Actions? (Your choice)

### 3. Create firebase.json Configuration

```json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "run": {
          "serviceId": "steam-market-monitor",
          "region": "us-central1"
        }
      }
    ]
  }
}
```

### 4. Create Dockerfile for Cloud Run

Create a `Dockerfile` in the project root:

```dockerfile
# Use Node.js 18 (or your preferred version)
FROM node:18-alpine

# Working directory in container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Set environment variables from cloud run environment
ENV PORT=8080

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["npm", "run", "start"]
```

### 5. Update package.json Scripts

Edit your package.json to include:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "ts-node --project tsconfig.server.json -r tsconfig-paths/register src/server.ts",
  "lint": "next lint"
}
```

### 6. Deploy to Cloud Run

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/steam-market-monitor
gcloud run deploy steam-market-monitor --image gcr.io/YOUR_PROJECT_ID/steam-market-monitor --platform managed
```

### 7. Set Environment Variables in Cloud Run

In the Google Cloud Console:
1. Navigate to Cloud Run
2. Select your service
3. Go to "Edit & Deploy New Revision"
4. Under "Variables & Secrets", add:
   ```
   MONGODB_URI=mongodb+srv://justwint3r:8WD1WIT8YArwInF5@projectbluegem.smhogoz.mongodb.net/steam_market_monitor
   MAX_PAGES_TO_SCAN=50
   ```

## Verification

1. Once deployed, access your application using the provided URL
2. Check the logs to ensure the background worker starts
3. Verify WebSocket connections are working properly

## Troubleshooting

1. **Memory Issues on Cloud Run**
   - If needed, increase the memory allocation in Cloud Run settings

2. **Connection Issues**
   - Ensure ports are properly exposed in the Dockerfile
   - Check firewall settings if using a custom domain

3. **WebSocket Connection Failures**
   - Ensure your frontend is connecting to the correct WebSocket endpoint
   - May need to add CORS headers to match your domain 