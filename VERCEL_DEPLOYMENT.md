# Vercel Deployment Guide

This guide explains how to deploy your Steam Market Pattern Monitor on Vercel with MongoDB Atlas.

## Architecture Changes for Vercel

The project has been modified to work with Vercel's serverless architecture:

1. **Scheduled Tasks Instead of Background Workers**
   - Uses Vercel Cron Jobs to trigger scans periodically
   - Replaced continuous background process with scheduled API endpoints

2. **Polling Instead of WebSockets**
   - The frontend now polls for updates every 30 seconds
   - Replaced WebSocket connections with regular API calls

3. **MongoDB Atlas**
   - Uses cloud-hosted MongoDB instead of local MongoDB
   - Both Vercel functions and frontend connect to the same database

## Setup Steps

### 1. MongoDB Atlas Setup

1. Create a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account
2. Create a new cluster 
3. Set up database access:
   - Create a database user with a username and password
   - In "Network Access," whitelist your IP or use `0.0.0.0/0` to allow all IPs
4. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the URI string that looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/...`

### 2. Environment Variables

Set these in your Vercel project settings:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/steam_market_monitor?retryWrites=true&w=majority
MAX_PAGES_TO_SCAN=50
```

### 3. Deployment

1. Push your code to GitHub
2. Connect to Vercel and import your repository
3. Configure the project:
   - Framework preset: Next.js
   - Add the environment variables
4. Deploy

### 4. Verify Cron Jobs

1. Wait for deployment to complete
2. Check Vercel Logs to verify that cron jobs are running:
   - `/api/scheduled-scan` should run once daily at midnight
   - `/api/cleanup-items` should run every 6 hours

## Limitations

1. **Scanning Efficiency**
   - Vercel functions have a 10-second execution limit in the free tier
   - May need to limit the number of pages scanned per run

2. **Cold Starts**
   - The first scan after a period of inactivity may be slower

3. **Puppeteer on Vercel**
   - Headless browser automation on Vercel requires additional setup
   - Consider using a headless browser API service if you encounter issues

## Alternative Setups

If you need more powerful background processing:

1. **Hybrid Approach**
   - Deploy frontend on Vercel
   - Run the background worker on a separate server (Heroku, Railway, etc.)
   - Both connect to the same MongoDB Atlas database

2. **Premium Vercel**
   - Upgrade to Vercel Pro to increase function execution time limits
   - Still limited compared to dedicated servers 