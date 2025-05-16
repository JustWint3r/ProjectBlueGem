# Steam Market Pattern Monitor

A real-time monitoring system for Desert Eagle | Heat Treated skins with specific paint seeds on the Steam Market.

## Features

- **Real-time Monitoring**: Continuously scans the Steam Market for Desert Eagle | Heat Treated skins with specific paint seed patterns
- **Customizable Seeds**: Tracks only the specific paint seeds you're interested in
- **Live Notifications**: Receive instant notifications when matching items are found or removed
- **WebSocket Integration**: Real-time updates without page refreshes
- **MongoDB Integration**: Persistent storage of found items

## Target Paint Seeds

This application monitors for the following paint seed values:
16, 48, 66, 67, 96, 111, 117, 159, 259, 263, 273, 297, 308, 321, 324, 341, 347, 370, 426, 461, 482, 517, 530, 567, 587, 674, 695, 723, 764, 772, 781, 790, 792, 843, 880, 885, 904, 948, 990

## Technology Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes, Socket.IO
- **Database**: MongoDB
- **Web Scraping**: Puppeteer, Cheerio
- **HTTP Requests**: Axios

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas URI)
- npm or yarn

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/steam_market_monitor
   ```

4. Add a notification sound file:
   - Place an MP3 file named `notification.mp3` in the `/public` directory

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## How It Works

1. The application uses Puppeteer to navigate through Steam Market pages
2. For each listing, it extracts the inspect link, price, and image URL
3. The inspect link is used to fetch the item's float value and paint seed
4. If the paint seed matches one in our target list, the item is added to the database
5. WebSockets notify the frontend of new or removed items in real-time
6. The background worker periodically scans for new items

## License

MIT
