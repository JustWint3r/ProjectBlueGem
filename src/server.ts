import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocketIO } from './services/socketService';
import { startWorker } from './services/workerService';
import dbConnect from './lib/mongodb';

const dev = process.env.NODE_ENV !== 'production';
const hostname = dev ? 'localhost' : '0.0.0.0'; // Use 0.0.0.0 in production for Cloud Run
const port = parseInt(process.env.PORT || '8080', 10); // Default to 8080 for Cloud Run

// Initialize Next.js app
const app = next({ 
  dev, 
  hostname: dev ? hostname : undefined, // Only specify hostname in dev
  port 
});
const handle = app.getRequestHandler();

// Connect to MongoDB
dbConnect()
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || '', true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Initialize Socket.IO
  const io = initSocketIO(server);
  console.log('Socket.IO initialized');

  // Start the background worker
  startWorker(5); // Check every 5 minutes
  
  // Start the server
  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV}`);
  });
}); 