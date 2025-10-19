import { Request, Response, NextFunction } from 'express';
import { MovieService } from '../services/movies.service';

const movieService = new MovieService();

export class MovieController {
  async getPopular(req: Request, res: Response, next: NextFunction) {
    console.log('Reached getPopular controller');
    try {
      // A página pode ser passada como query param, ex: /movies/popular?page=2
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const movies = await movieService.getPopularMovies(page);
      res.status(200).json(movies);
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.query as string;
      if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const movies = await movieService.searchMovies(query, page);
      res.status(200).json(movies);
    } catch (error) {
      next(error);
    }
  }
}