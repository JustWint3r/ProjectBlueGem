import React, { useState, useEffect } from 'react';
import { IItem } from '@/models/Item';

interface Notification {
  id: string;
  type: 'new' | 'removed';
  item: IItem;
  timestamp: Date;
}

interface NotificationsProps {
  notifications: Notification[];
}

const Notifications: React.FC<NotificationsProps> = ({ notifications }) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm w-full space-y-2 z-50">
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className={`rounded-lg shadow-lg p-4 text-white transform transition-all animate-fadeIn ${
            notification.type === 'new' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">
                {notification.type === 'new' 
                  ? 'New Item Found!' 
                  : 'Item No Longer Available'}
              </p>
              <p className="text-sm opacity-90">
                Paint Seed: {notification.item.paintSeed} • Float: {notification.item.floatValue.toFixed(8)}
              </p>
              <p className="text-sm opacity-90">
                Price: {notification.item.price}
              </p>
            </div>
            <button 
              className="text-white opacity-70 hover:opacity-100"
              onClick={() => {/* Remove notification */}}
            >
              &times;
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications; 