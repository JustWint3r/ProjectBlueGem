import React from 'react';

interface TargetSeedListProps {
  targetSeeds: number[];
}

const TargetSeedList: React.FC<TargetSeedListProps> = ({ targetSeeds }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Target Paint Seeds</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {targetSeeds.sort((a, b) => a - b).map((seed) => (
          <div 
            key={seed}
            className="bg-blue-100 text-blue-800 rounded px-2 py-1 text-center text-sm font-medium"
          >
            {seed}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TargetSeedList; 