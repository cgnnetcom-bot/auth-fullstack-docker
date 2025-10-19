import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Verifique se este caminho está correto
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
  const { user, logout } = useAuth();
  console.log('User in MainLayout:', user);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
        <div>
          <Link to="/" className="mr-4 hover:text-blue-400">Home</Link>
          <Link to="/movies" className="mr-4 hover:text-blue-400">Movies</Link>
          {user && (
            <>
              <Link to="/dashboard" className="mr-4 hover:text-blue-400">Dashboard</Link>
              <Link to="/gallery" className="mr-4 hover:text-blue-400">Gallery</Link>
              <Link to="/albums" className="hover:text-blue-400">Albums</Link>
            </>
          )}
        </div>
        <div>
          {user ? (
            <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">Logout</button>
          ) : (
            <>
              <Link to="/login" className="mr-4 hover:text-blue-400">Login</Link>
              <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
      <main className="bg-gray-900 text-white" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <Outlet /> {/* As rotas aninhadas serão renderizadas aqui */}
      </main>
    </>
  );
};

export default MainLayout;