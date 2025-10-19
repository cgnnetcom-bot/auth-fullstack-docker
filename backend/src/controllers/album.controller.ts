import { Request, Response, NextFunction } from 'express';
import * as albumService from '../services/album.service';
import { AppError } from '../services/AppError';

export async function createAlbum(req: Request, res: Response, next: NextFunction) {
  try {
    const { user } = req;
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    const { name } = req.body;
    if (!name) {
      throw new AppError('Album name is required', 400);
    }

    const album = await albumService.createAlbum({ name, userId: user.userId });
    res.status(201).json(album);
  } catch (error) {
    next(error);
  }
}

export async function getAlbums(req: Request, res: Response, next: NextFunction) {
  try {
    const { user } = req;
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    const albums = await albumService.findAlbumsByUserId(user.userId);
    console.log('Albums:', albums);
    res.status(200).json(albums);
  } catch (error) {
    next(error);
  }
}

export async function getAlbum(req: Request, res: Response, next: NextFunction) {
  try {
    const { user } = req;
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    const album = await albumService.findAlbumById(id, user.userId);

    res.status(200).json(album);
  } catch (error) {
    next(error);
  }
}

export async function addImageToAlbum(req: Request, res: Response, next: NextFunction) {
  try {
    const { user } = req;
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    const { albumId } = req.params;
    const { imageId } = req.body;

    if (!imageId) {
      throw new AppError('Image ID is required', 400);
    }

    await albumService.addImageToAlbum(albumId, imageId, user.userId);

    res.status(200).json({ message: 'Image added to album successfully' });
  } catch (error) {
    next(error);
  }
}

export async function removeImageFromAlbum(req: Request, res: Response, next: NextFunction) {
  try {
    const { user } = req;
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    const { albumId, imageId } = req.params;

    await albumService.removeImageFromAlbum(albumId, imageId, user.userId);

    res.status(200).json({ message: 'Image removed from album successfully' });
  } catch (error) {
    next(error);
  }
}

export async function deleteAlbum(req: Request, res: Response, next: NextFunction) {
  try {
    const { user } = req;
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;

    await albumService.deleteAlbum(id, user.userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function updateAlbum(req: Request, res: Response, next: NextFunction) {
  try {
    const { user } = req;
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      throw new AppError('Name is required', 400);
    }

    const updatedAlbum = await albumService.updateAlbum(id, user.userId, { name });

    res.status(200).json(updatedAlbum);
  } catch (error) {
    next(error);
  }
}