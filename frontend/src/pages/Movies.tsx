import React, { useEffect, useState } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import MovieCardSkeleton from '../components/MovieCardSkeleton';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
}

interface Favorite {
  id: string; // The UUID from our database
  movieId: number; // The ID from TMDB
}

const Movies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Map<number, string>>(new Map()); // Map<movieId, favoriteId>
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // Reset to page 1 for new searches
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  useEffect(() => {
    const fetchMovies = async (page: number) => {
      try {
        setLoading(true);
        let response;
        if (debouncedQuery) {
          response = await api.get('/movies/search', { params: { query: debouncedQuery, page } });
        } else {
          response = await api.get('/movies/popular', { params: { page } });
        }
        setMovies(response.data.results);
        setCurrentPage(response.data.page);
        setTotalPages(response.data.total_pages);
        setError(null);
      } catch (err) {
        setError('Failed to fetch movies. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
        window.scrollTo(0, 0); // Scroll to top on page change
      }
    };

    const fetchUserFavorites = async () => {
      if (user) {
        try {
          const response = await api.get('/favorites');
          const userFavorites: Favorite[] = response.data.data.favorites;
          // Create a map for quick lookups: movieId -> favoriteId (our DB's UUID)
          const favoritesMap = new Map(userFavorites.map(fav => [fav.movieId, fav.id]));
          setFavorites(favoritesMap);
        } catch (err) {
          console.error('Could not fetch user favorites', err);
          // Non-critical error, so we don't set a page-level error message
        }
      }
    };

    fetchMovies(currentPage);
    fetchUserFavorites();
  }, [user, currentPage, debouncedQuery]);

  const handleToggleFavorite = async (movie: Movie) => {
    const isFavorited = favorites.has(movie.id);

    if (isFavorited) {
      // --- Unfavorite logic ---
      const favoriteId = favorites.get(movie.id);
      // Optimistic update: remove from UI immediately
      setFavorites(prev => {
        const newMap = new Map(prev);
        newMap.delete(movie.id);
        return newMap;
      });
      try {
        await api.delete(`/favorites/${favoriteId}`);
      } catch (err) {
        // Rollback on error
        setFavorites(prev => new Map(prev).set(movie.id, favoriteId!));
        toast.error('Failed to unfavorite movie.');
      }
    } else {
      // --- Favorite logic ---
      const payload = {
        movieId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        voteAverage: movie.vote_average,
      };
      try {
        const response = await api.post('/favorites', payload);
        const newFavorite: Favorite = response.data.data.favorite;
        // Update state with the new favorite from the server response
        setFavorites(prev => new Map(prev).set(newFavorite.movieId, newFavorite.id));
        // Adicionando um toast de sucesso para melhor feedback
        toast.success(`${movie.title} added to favorites!`);
      } catch (err: any) {
        if (err.response?.status === 409) {
          toast.error('Movie is already in your favorites.');
        } else {
          toast.error('Failed to favorite movie.');
        }
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">{debouncedQuery ? `Search Results for "${debouncedQuery}"` : 'Popular Movies'}</h1>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a movie..."
          className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Cria um array de 10 elementos para renderizar 10 skeletons */}
          {Array.from({ length: 10 }).map((_, index) => <MovieCardSkeleton key={index} />)}
        </div>
      )}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.length > 0 ? movies.map((movie) => (
            <div key={movie.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg flex flex-col transition-transform duration-200 ease-in-out hover:scale-105">
              <img src={movie.poster_path} alt={movie.title} className="w-full h-auto" />
              <div className="p-3 flex flex-col flex-grow">
                <h3 className="text-md font-semibold truncate">{movie.title}</h3>
                <div className="flex items-center text-sm text-yellow-400 mt-1 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>
                {user && (
                  <button
                    onClick={() => handleToggleFavorite(movie)}
                    className={`w-full mt-auto font-bold py-2 px-4 rounded text-sm transition-colors ${
                      favorites.has(movie.id)
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {favorites.has(movie.id) ? 'Unfavorite' : 'Favorite'}
                  </button>
                )}
              </div>
            </div>
          )) : (
            <p>No movies found. Try a different search.</p>
          )}
        </div>
      )}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center items-center mt-8">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-l disabled:bg-gray-800 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="py-2 px-4 bg-gray-800 text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-r disabled:bg-gray-800 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Movies;