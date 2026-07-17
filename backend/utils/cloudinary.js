import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file stream/buffer to Cloudinary.
 * @param {Buffer} buffer - The file buffer.
 * @param {string} folder - The target folder in Cloudinary.
 * @param {string} resourceType - 'image', 'video', 'raw', or 'auto'.
 * @returns {Promise<Object>} - Cloudinary upload response containing secure_url.
 */
export const uploadBufferToCloudinary = (buffer, folder, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );

    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

/**
 * Deletes a file from Cloudinary by its public ID.
 * @param {string} publicId - The public ID of the resource to delete.
 * @param {string} resourceType - 'image', 'video', 'raw'.
 * @returns {Promise<Object>} - Cloudinary destroy response.
 */
export const deleteFromCloudinary = (publicId, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) {
        console.error('Cloudinary delete error:', error);
        return reject(error);
      }
      resolve(result);
    });
  });
};

export default cloudinary;
