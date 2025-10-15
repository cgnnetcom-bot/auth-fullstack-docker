import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { FavoritesService } from '../services/favorites.service';
import { AppError } from '../services/AppError';

const favoritesService = new FavoritesService();

const favoriteSchema = z.object({
  movieId: z.number(),
  title: z.string(),
  posterPath: z.string().nullable(),
  voteAverage: z.number(),
});

export class FavoritesController {
  async add(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const userId = req.user.userId;

      const { movieId, title, posterPath, voteAverage } = favoriteSchema.parse(req.body);
      const favorite = await favoritesService.addFavorite(userId, movieId, title, posterPath, voteAverage);

      res.status(201).json({ status: 'success', data: { favorite } });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const userId = req.user.userId;
      const favorites = await favoritesService.getFavorites(userId);
      res.status(200).json({ status: 'success', results: favorites.length, data: { favorites } });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const userId = req.user.userId;

      const { id } = req.params;
      await favoritesService.deleteFavorite(userId, id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}