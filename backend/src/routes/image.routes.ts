import { Router } from 'express';
import { uploadImage, getImages, deleteImage, updateImage, getPublicImage } from '../controllers/image.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload.middleware';

const router = Router();

router.get('/:id', getPublicImage);

router.post(
  '/upload',
  authMiddleware, // Ensure user is authenticated
  upload.single('image'), // Handle single file upload with field name 'image'
  uploadImage
);

router.get(
  '/',
  authMiddleware, // Ensure user is authenticated
  getImages
);

router.delete(
  '/:id',
  authMiddleware, // Ensure user is authenticated
  deleteImage
);

router.patch(
  '/:id',
  authMiddleware, // Ensure user is authenticated
  updateImage
);

export default router;