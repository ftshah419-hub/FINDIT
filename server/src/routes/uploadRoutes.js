import express from 'express';
import { uploadController } from '../controllers/uploadController.js';
import { upload } from '../middlewares/upload.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post(
  '/image',
  protect,
  upload.single('image'),
  uploadController.uploadSingle
);

router.post(
  '/images',
  protect,
  upload.array('images', 5),
  uploadController.uploadMultiple
);

export default router;
