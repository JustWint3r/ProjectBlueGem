# Steam Market Pattern Monitor

A monitoring tool for tracking specific pattern seeds of skins on the Steam Market.

## Features

- Track specific paint seed patterns for CS2 skins
- Automatic scheduled scanning of new listings
- MongoDB Atlas integration for data storage
- Real-time notifications for new listings

## Target Paint Seeds

This application monitors for the following paint seed values:
16, 48, 66, 67, 96, 111, 117, 159, 259, 263, 273, 297, 308, 321, 324, 341, 347, 370, 426, 461, 482, 517, 530, 567, 587, 674, 695, 723, 764, 772, 781, 790, 792, 843, 880, 885, 904, 948, 990

## Technology Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes, Socket.IO
- **Database**: MongoDB Atlas
- **Web Scraping**: Puppeteer, Cheerio
- **HTTP Requests**: Axios

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- npm or yarn

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   MAX_PAGES_TO_SCAN=50
   ```

4. Add a notification sound file:
   - Place an MP3 file named `notification.mp3` in the `/public` directory

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Vercel Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

## How It Works

1. The application uses Puppeteer to navigate through Steam Market pages
2. For each listing, it extracts the inspect link, price, and image URL
3. The inspect link is used to fetch the item's float value and paint seed
4. If the paint seed matches one in our target list, the item is added to the database
5. The frontend polls for updates every 30 seconds
6. Daily scheduled scans ensure all new listings are checked

## License

MIT
