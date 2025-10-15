import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <h1 className="text-5xl font-bold mb-4">Welcome to Movie Dashboard</h1>
      <p className="text-xl mb-8">Discover, track, and manage your favorite movies.</p>
      <Link to="/movies" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">
        Browse Popular Movies
      </Link>
    </div>
  );
};

export default Home;