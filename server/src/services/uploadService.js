import { cloudinary, isConfigured } from '../config/cloudinary.js';

export const uploadService = {
  async uploadImage(fileBuffer, mimetype = 'image/jpeg', folder = 'findit_items') {
    if (isConfigured) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        );
        uploadStream.end(fileBuffer);
      });
    }

    // High fidelity fallback when Cloudinary API credentials are not set
    const base64Data = fileBuffer.toString('base64');
    const dataUri = `data:${mimetype};base64,${base64Data}`;
    const mockPublicId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return {
      url: dataUri,
      publicId: mockPublicId,
    };
  },

  async deleteImage(publicId) {
    if (isConfigured && publicId && !publicId.startsWith('local_')) {
      try {
        await cloudinary.uploader.destroy(publicId);
        return true;
      } catch (err) {
        console.error('Cloudinary deletion failed:', err);
        return false;
      }
    }
    return true;
  },
};
