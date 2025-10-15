import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Definindo o tipo para um filme favorito
interface Favorite {
  id: string;
  movieId: number;
  title: string;
  posterPath: string;
  voteAverage: number;
}

const COLORS = [
  '#FF8042', // Laranja para 0-2
  '#FFBB28', // Amarelo para 2-4
  '#00C49F', // Verde para 4-6
  '#0088FE', // Azul para 6-8
  '#8884d8', // Roxo para 8-10
];



const VideoCameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await api.get('/favorites');
        setFavorites(response.data.data.favorites);
        setError(null);
      } catch (err) {
        setError('Failed to fetch favorite movies. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      await api.delete(`/favorites/${favoriteId}`);
      // Atualiza o estado para remover o filme da UI imediatamente
      setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.id !== favoriteId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      toast.error('Could not remove the movie.');
    }
  };

  // Otimiza o cálculo para que só seja refeito quando 'favorites' mudar
  const stats = useMemo(() => {
    if (favorites.length === 0) {
      return {
        averageRating: 'N/A',
        ratingDistribution: [],
      };
    }

    const averageRating = (favorites.reduce((acc, fav) => acc + fav.voteAverage, 0) / favorites.length).toFixed(1);

    const distribution = [
      { name: '0-2', count: 0 },
      { name: '2-4', count: 0 },
      { name: '4-6', count: 0 },
      { name: '6-8', count: 0 },
      { name: '8-10', count: 0 },
    ];
    favorites.forEach(fav => {
      const rating = fav.voteAverage;
      if (rating <= 2) distribution[0].count++;
      else if (rating <= 4) distribution[1].count++;
      else if (rating <= 6) distribution[2].count++;
      else if (rating <= 8) distribution[3].count++;
      else distribution[4].count++;
    });

    return { averageRating, ratingDistribution: distribution };
  }, [favorites]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
      </div>

      {/* Seção de Analytics unificada */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Dashboard Analytics</h2>
        
        {/* Grid para os cards e o gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Coluna para os cards de estatísticas */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Card Total de Filmes */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-1 items-center justify-center space-x-4">
              <div className="bg-blue-500/20 p-3 rounded-full">
                <VideoCameraIcon className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-lg">Total Favorite Movies</p>
                {loading || !user ? <Skeleton height={48} width={100} /> : <p className="text-5xl font-bold">{favorites.length}</p>}
              </div>
            </div>

            {/* Card Nota Média */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-1 items-center justify-center space-x-4">
              <div className="bg-green-500/20 p-3 rounded-full">
                <StarIcon className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-lg">Average Rating</p>
                {loading || !user ? <Skeleton height={48} width={100} /> : <p className="text-5xl font-bold">{stats.averageRating}</p>}
              </div>
            </div>
          </div>

          {/* Coluna para o gráfico */}
          {favorites.length > 0 && (
            <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg" style={{ minHeight: '300px' }}>
              <h3 className="text-lg font-semibold mb-4 text-center lg:text-left">Rating Distribution</h3>
              {loading ? <Skeleton height="100%" /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={stats.ratingDistribution}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                    <XAxis type="number" stroke="#A0AEC0" />
                    <YAxis type="category" dataKey="name" stroke="#A0AEC0" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568', borderRadius: '0.5rem' }}
                      labelStyle={{ color: '#E2E8F0' }}
                      itemStyle={{ color: '#E2E8F0' }}
                      cursor={{ fill: 'rgba(144, 205, 244, 0.1)' }}
                    />
                    <Bar dataKey="count" name="Number of Movies" barSize={20}>
                      {stats.ratingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Your Favorite Movies Collection</h2>
      {error && <p className="text-red-500">{error}</p>}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <Skeleton height={250} />
              <div className="p-2"><Skeleton count={2} /></div>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {favorites.length > 0 ? (
            favorites.map((movie) => (
              <div key={movie.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg flex flex-col transition-transform duration-200 ease-in-out hover:scale-105">
                <img src={movie.posterPath} alt={movie.title} className="w-full h-auto" />
                <div className="p-2 flex flex-col flex-grow">
                  <h3 className="text-sm font-semibold truncate">{movie.title}</h3>
                  <button
                    onClick={() => handleRemoveFavorite(movie.id)}
                    className="mt-auto w-full bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-1 px-2 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>You haven't added any favorites yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;