import React from 'react';
import { IItem } from '@/models/Item';

interface ItemCardProps {
  item: IItem;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 transition-all hover:shadow-lg">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={`Desert Eagle | Heat Treated - Paint Seed ${item.paintSeed}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-gray-500">No Image Available</div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Desert Eagle | Heat Treated</h3>
          <span className="text-green-600 font-bold">{item.price}</span>
        </div>
        
        <div className="space-y-1 text-sm text-gray-600">
          <p><span className="font-medium">Paint Seed:</span> {item.paintSeed}</p>
          <p><span className="font-medium">Float:</span> {item.floatValue.toFixed(8)}</p>
          <p><span className="font-medium">Found:</span> {new Date(item.found).toLocaleString()}</p>
        </div>
        
        <div className="mt-4">
          <a 
            href={item.inspectLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Inspect In-Game
          </a>
        </div>
      </div>
    </div>
  );
};

export default ItemCard; 