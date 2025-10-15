import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const MovieCardSkeleton = () => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <Skeleton height={300} />
      <div className="p-3">
        <Skeleton count={2} />
      </div>
    </div>
  );
};

export default MovieCardSkeleton;