import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocketIO } from './services/socketService';
import { startWorker } from './services/workerService';
import dbConnect from './lib/mongodb';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
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
  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}); 