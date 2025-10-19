import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3 } from '../config/s3';
import { env } from '../config/env';

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (req, file, cb) => {
      const fileName = `${Date.now()}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
});

export default upload;