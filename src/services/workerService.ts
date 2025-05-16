import { scanMarket, cleanupItems } from './steamMarketService';
import dbConnect from '@/lib/mongodb';
import { emitNewItem, emitItemRemoved } from './socketService';
import Item, { IItem } from '@/models/Item';

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

// Start the worker to periodically scan the market
export function startWorker(intervalMinutes: number = 5) {
  if (isRunning) {
    console.log('Worker is already running');
    return;
  }

  isRunning = true;
  console.log(`Starting market scanner worker (interval: ${intervalMinutes} minutes)`);

  // Run immediately on start
  runScan();

  // Then set interval
  intervalId = setInterval(runScan, intervalMinutes * 60 * 1000);
}

// Stop the worker
export function stopWorker() {
  if (!isRunning || !intervalId) {
    console.log('Worker is not running');
    return;
  }

  clearInterval(intervalId);
  isRunning = false;
  intervalId = null;
  console.log('Stopped market scanner worker');
}

// The main scan function
async function runScan() {
  try {
    console.log('Starting market scan...');
    await dbConnect();

    // Get current items
    const currentItems = await Item.find({ isAvailable: true });
    const currentItemsMap = new Map<string, IItem>();
    currentItems.forEach(item => {
      const key = `${item.paintSeed}-${item.floatValue}`;
      currentItemsMap.set(key, item);
    });

    // Scan market for new items
    const foundItems = await scanMarket(10);
    
    // Process found items, emitting new ones
    for (const item of foundItems) {
      const key = `${item.paintSeed}-${item.floatValue}`;
      
      if (!currentItemsMap.has(key)) {
        // This is a new item, emit event
        emitNewItem(item);
      }
      
      // Remove from our map to track which ones are still available
      currentItemsMap.delete(key);
    }
    
    // Anything left in the map is no longer available
    for (const [_, item] of currentItemsMap.entries()) {
      item.isAvailable = false;
      await item.save();
      emitItemRemoved(item);
    }

    // Cleanup old listings
    await cleanupItems();
    
    console.log('Market scan completed');
  } catch (error) {
    console.error('Error in market scan worker:', error);
  }
}

export default {
  startWorker,
  stopWorker,
}; 