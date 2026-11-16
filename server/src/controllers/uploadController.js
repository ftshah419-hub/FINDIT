import { uploadService } from '../services/uploadService.js';

export const uploadController = {
  async uploadSingle(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
          errorCode: 'NO_FILE',
        });
      }

      const result = await uploadService.uploadImage(
        req.file.buffer,
        req.file.mimetype,
        'findit_uploads'
      );

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async uploadMultiple(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
          errorCode: 'NO_FILES',
        });
      }

      const uploadPromises = req.files.map((file) =>
        uploadService.uploadImage(file.buffer, file.mimetype, 'findit_uploads')
      );

      const results = await Promise.all(uploadPromises);

      res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: results,
      });
    } catch (error) {
      next(error);
    }
  },
};
