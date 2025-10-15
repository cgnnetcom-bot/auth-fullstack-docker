import prisma from '../prisma';
import { AppError } from './AppError';

export class FavoritesService {
  async addFavorite(userId: string, movieId: number, title: string, posterPath: string | null, voteAverage: number) {
    try {
      const newFavorite = await prisma.favorite.create({
        data: {
          userId,
          movieId,
          title,
          posterPath,
          voteAverage,
        },
      });
      return newFavorite;
    } catch (error: any) {
      // P2002 é o código de erro do Prisma para violação de restrição única
      if (error.code === 'P2002') {
        throw new AppError('This movie is already in your favorites.', 409); // 409 Conflict
      }
      throw error;
    }
  }

  async getFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return favorites;
  }

  async deleteFavorite(userId: string, favoriteId: string) {
    const favorite = await prisma.favorite.findUnique({
      where: { id: favoriteId },
    });

    if (!favorite) {
      throw new AppError('No favorite found with that ID', 404);
    }

    if (favorite.userId !== userId) {
      throw new AppError('You do not have permission to perform this action', 403); // 403 Forbidden
    }

    await prisma.favorite.delete({ where: { id: favoriteId } });
  }
}