const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'findit-cloud',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

/**
 * Upload an image buffer or path to Cloudinary
 */
const uploadImage = async (fileBufferOrPath, folder = 'findit/items') => {
  if (!process.env.CLOUDINARY_API_KEY) {
    // If Cloudinary credentials are not set, return dummy or local reference
    return {
      url: typeof fileBufferOrPath === 'string' ? fileBufferOrPath : 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
      publicId: `dev_${Date.now()}`,
    };
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    if (Buffer.isBuffer(fileBufferOrPath)) {
      uploadStream.end(fileBufferOrPath);
    } else {
      cloudinary.uploader.upload(fileBufferOrPath, { folder }, (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      });
    }
  });
};

/**
 * Delete image from Cloudinary by public ID
 */
const deleteImage = async (publicId) => {
  if (!publicId || !process.env.CLOUDINARY_API_KEY) return true;
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error(`[Cloudinary Error] Failed to delete image ${publicId}:`, error.message);
    return false;
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
};
