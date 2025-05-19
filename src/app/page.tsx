'use client';

import React, { useState, useEffect } from 'react';
import ItemGrid from './components/ItemGrid';
import Notifications from './components/Notifications';
import TargetSeedList from './components/TargetSeedList';
import { IItem } from '@/models/Item';
import { Socket, io } from 'socket.io-client';

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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Initialize WebSocket connection
  useEffect(() => {
    const socketInstance = io({
      path: '/socket.io',
    });

    // Socket connection event handlers
    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Listen for new items
    socketInstance.on('newItem', (item: IItem) => {
      console.log('New item received:', item);
      
      // Add to items list
      setItems((prevItems) => [item, ...prevItems]);
      
      // Create notification
      const notification: Notification = {
        id: `new-${Date.now()}-${item.paintSeed}-${item.floatValue}`,
        type: 'new',
        item,
        timestamp: new Date(),
      };
      
      setNotifications((prev) => [notification, ...prev]);
      
      // Play notification sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Failed to play notification sound', e));
    });

    // Listen for removed items
    socketInstance.on('itemRemoved', (item: IItem) => {
      console.log('Item removed:', item);
      
      // Remove from items list
      setItems((prevItems) => 
        prevItems.filter(
          (i) => !(i.paintSeed === item.paintSeed && i.floatValue === item.floatValue)
        )
      );
      
      // Create notification
      const notification: Notification = {
        id: `removed-${Date.now()}-${item.paintSeed}-${item.floatValue}`,
        type: 'removed',
        item,
        timestamp: new Date(),
      };
      
      setNotifications((prev) => [notification, ...prev]);
    });

    setSocket(socketInstance);
    
    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Fetch initial items when component mounts
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/items');
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

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
      const response = await fetch('/api/scan', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        // Refetch items
        const itemsResponse = await fetch('/api/items');
        const itemsData = await itemsResponse.json();
        setItems(itemsData);
      }
    } catch (error) {
      console.error('Error scanning market:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Desert Eagle | Heat Treated Monitor</h1>
          <p className="mt-2 text-gray-600">
            Monitoring Steam Market for specific pattern seeds. Real-time notifications via WebSockets.
          </p>
          {isConnected ? (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span> Connected
            </div>
          ) : (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span> Disconnected
            </div>
          )}
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Current Listings</h2>
            <button
              onClick={handleScan}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Scanning...' : 'Scan Now'}
            </button>
          </div>

          <div className="mb-6">
            <TargetSeedList targetSeeds={TARGET_PAINT_SEEDS} />
          </div>

          <ItemGrid items={items} loading={loading} />
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            This tool monitors the Steam Market for Desert Eagle | Heat Treated skins with specific paint seeds.
            <br />
            Updates are received in real-time through WebSockets. Background scans run every 5 minutes.
          </p>
        </div>
      </div>

      <Notifications notifications={notifications} />
    </main>
  );
}
