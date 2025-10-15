import axios from 'axios';
import fs from 'fs';
import { AppError } from './AppError';

/**
 * Retrieves the TMDB API key from environment variables or a Docker secret file.
 * Throws an AppError if the key is not found.
 */
const getTmdbApiKey = (): string => {
  const key = process.env.TMDB_API_KEY;
  const keyFile = process.env.TMDB_API_KEY_FILE;

  if (key) return key;
  if (keyFile && fs.existsSync(keyFile)) return fs.readFileSync(keyFile, 'utf-8').trim();

  throw new AppError('TMDB API key is not configured on the server. Please check environment variables.', 500);
};

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
});

// Adiciona a chave da API e o idioma a cada requisição usando um interceptor.
// Isso é mais seguro e evita problemas se a chave não for encontrada na inicialização.
tmdbApi.interceptors.request.use(config => {
  config.params = config.params || {};
  // A chave será adicionada dinamicamente dentro do método do serviço.
  config.params['language'] = 'pt-BR';
  return config;
});

export class MovieService {
  async getPopularMovies(page: number = 1) {
    try {
      const apiKey = getTmdbApiKey(); // Chave obtida aqui, dentro do try...catch
      const response = await tmdbApi.get('/movie/popular', {
        params: { page, api_key: apiKey },
      });

      // Mapeamos para um formato mais limpo e adicionamos o URL completo do pôster
      const movies = response.data.results.map((movie: any) => ({
        ...movie,
        poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      }));

      return { ...response.data, results: movies };
    } catch (error) {
      console.error('Error fetching popular movies from TMDB:', error);
      throw new AppError('Failed to fetch popular movies.', 502); // 502 Bad Gateway
    }
  }

  async searchMovies(query: string, page: number = 1) {
    try {
      const apiKey = getTmdbApiKey(); // Chave obtida aqui, dentro do try...catch
      const response = await tmdbApi.get('/search/movie', {
        params: { query, page, api_key: apiKey },
      });

      // Aplicamos o mesmo mapeamento para padronizar a URL do pôster
      const movies = response.data.results.map((movie: any) => ({
        ...movie,
        poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      }));

      return { ...response.data, results: movies };
    } catch (error) {
      console.error('Error searching movies from TMDB:', error);
      throw new AppError('Failed to search for movies.', 502);
    }
  }
}