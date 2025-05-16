import React from 'react';
import ItemCard from './ItemCard';
import { IItem } from '@/models/Item';

interface ItemGridProps {
  items: IItem[];
  loading: boolean;
}

const ItemGrid: React.FC<ItemGridProps> = ({ items, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-8 text-center min-h-[400px] flex flex-col justify-center items-center">
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Matching Items Found</h3>
        <p className="text-gray-500">
          We haven't found any Desert Eagle | Heat Treated with matching paint seeds yet.
          <br />
          The system is continuously scanning the Steam Market for matches.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard key={`${item.paintSeed}-${item.floatValue}`} item={item} />
      ))}
    </div>
  );
};

export default ItemGrid; 