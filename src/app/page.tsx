'use client';

import React, { useState, useEffect } from 'react';
import ItemGrid from './components/ItemGrid';
import Notifications from './components/Notifications';
import TargetSeedList from './components/TargetSeedList';
import { IItem } from '@/models/Item';

// Target paint seeds we're looking for
const TARGET_PAINT_SEEDS = [16, 48, 66, 67, 96, 111, 117, 159, 259, 263, 273, 297, 308, 321, 324, 341, 347, 370, 426, 461, 482, 517, 530, 567, 587, 674, 695, 723, 764, 772, 781, 790, 792, 843, 880, 885, 904, 948, 990];

interface Notification {
  id: string;
  type: 'new' | 'removed';
  item: IItem;
  timestamp: Date;
}

export default function Home() {
  const [items, setItems] = useState<IItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch items when component mounts and periodically after that
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/items');
        
        if (!response.ok) {
          throw new Error(`Database error: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Check for new or removed items if we have previous data
        if (lastFetchTime && items.length > 0) {
          checkForChanges(data);
        }
        
        setItems(data);
        setLastFetchTime(new Date());
      } catch (error) {
        console.error('Error fetching items:', error);
        setError('Unable to connect to database. Please try again later.');
        // Keep previous items data if any
        if (items.length === 0) {
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    };

    // Function to check for changes and create notifications
    const checkForChanges = (newData: IItem[]) => {
      // Map current items for easy lookup
      const currentItemsMap = new Map();
      items.forEach(item => {
        currentItemsMap.set(`${item.paintSeed}-${item.floatValue}`, item);
      });
      
      // Check for new items
      for (const item of newData) {
        const key = `${item.paintSeed}-${item.floatValue}`;
        if (!currentItemsMap.has(key)) {
          // New item found
          const notification: Notification = {
            id: `new-${Date.now()}-${key}`,
            type: 'new',
            item,
            timestamp: new Date(),
          };
          setNotifications(prev => [notification, ...prev]);
          
          // Play sound
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Failed to play notification sound', e));
        }
        
        // Remove from map to track what's no longer available
        currentItemsMap.delete(key);
      }
      
      // Anything left in the map is no longer available
      for (const [key, item] of currentItemsMap.entries()) {
        const notification: Notification = {
          id: `removed-${Date.now()}-${key}`,
          type: 'removed',
          item,
          timestamp: new Date(),
        };
        setNotifications(prev => [notification, ...prev]);
      }
    };

    // Fetch immediately
    fetchItems();
    
    // Then set up interval (every 30 seconds)
    const intervalId = setInterval(fetchItems, 30000);
    
    return () => clearInterval(intervalId);
  }, [items, lastFetchTime]);

  // Remove notifications after 10 seconds
  useEffect(() => {
    if (notifications.length === 0) return;

    const timeout = setTimeout(() => {
      setNotifications((prev) => prev.slice(0, -1));
    }, 10000);

    return () => clearTimeout(timeout);
  }, [notifications]);

  // Trigger manual scan
  const handleScan = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/scan', { method: 'POST' });
      
      if (!response.ok) {
        throw new Error(`Scan error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Refetch items
        const itemsResponse = await fetch('/api/items');
        if (!itemsResponse.ok) {
          throw new Error(`Database error: ${itemsResponse.statusText}`);
        }
        const itemsData = await itemsResponse.json();
        setItems(itemsData);
      }
    } catch (error) {
      console.error('Error scanning market:', error);
      setError('Error scanning market. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Retry fetching items
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // The useEffect will automatically retry fetching
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Desert Eagle | Heat Treated Monitor</h1>
          <p className="mt-2 text-gray-600">
            Monitoring Steam Market for specific pattern seeds. Database refreshes every 30 seconds.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Current Listings</h2>
            <div className="flex gap-2">
              {error && (
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Retry
                </button>
              )}
              <button
                onClick={handleScan}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? 'Scanning...' : 'Scan Now'}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <TargetSeedList targetSeeds={TARGET_PAINT_SEEDS} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
              <p className="text-red-700">{error}</p>
              <p className="text-sm text-red-600 mt-2">
                This is typically caused by database timeout. Try again in a minute.
              </p>
            </div>
          )}

          <ItemGrid items={items} loading={loading} />
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            This tool monitors the Steam Market for Desert Eagle | Heat Treated skins with specific paint seeds.
            <br />
            Data refreshes automatically every 30 seconds. Full market scans run once daily at midnight.
          </p>
        </div>
      </div>

      <Notifications notifications={notifications} />
    </main>
  );
}
