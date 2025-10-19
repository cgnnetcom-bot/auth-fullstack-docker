import { Request, Response, NextFunction } from 'express';
import { createImage, findImagesByUserId, deleteImage as deleteImageService, updateImage as updateImageService, findImageById } from '../services/image.service';
import { AppError } from '../services/AppError';

export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { user } = req;
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    if (!req.file) {
      throw new AppError('File not provided', 400);
    }

    const { originalname, key } = req.file as Express.MulterS3.File;
    const url = `http://localhost:4568/auth-bucket/${key}`;

    const image = await createImage({
      title: originalname,
      key,
      url: url,
      userId: user.userId,
    });

    res.status(201).json(image);
  } catch (error) {
    next(error);
  }
}

export async function getImages(req: Request, res: Response, next: NextFunction) {
  try {
    const { user } = req;
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';

    const result = await findImagesByUserId(user.userId, page, limit, search);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getPublicImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const image = await findImageById(id);
    res.status(200).json(image);
  } catch (error) {
    next(error);
  }
}

export async function deleteImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { user } = req;
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    await deleteImageService(id, user.userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function updateImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { user } = req;
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      throw new AppError('Title is required', 400);
    }

    const updatedImage = await updateImageService(id, user.userId, { title });

    res.status(200).json(updatedImage);
  } catch (error) {
    next(error);
  }
}
