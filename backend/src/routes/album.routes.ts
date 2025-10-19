import { Router } from 'express';
import { createAlbum, getAlbums, getAlbum, updateAlbum, deleteAlbum, addImageToAlbum, removeImageFromAlbum } from '../controllers/album.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.route('/')
  .post(createAlbum)
  .get(getAlbums);

router.route('/:id')
  .get(getAlbum)
  .patch(updateAlbum)
  .delete(deleteAlbum);

router.post('/:albumId/images', addImageToAlbum);
router.delete('/:albumId/images/:imageId', removeImageFromAlbum);

export default router;
