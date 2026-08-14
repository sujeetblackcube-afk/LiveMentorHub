import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
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
 * @param {Object} options - Additional options, e.g., { originalname, mimetype }.
 * @returns {Promise<Object>} - Cloudinary upload response containing secure_url.
 */
export const uploadBufferToCloudinary = (buffer, folder, resourceType = 'auto', options = {}) => {
  return new Promise((resolve, reject) => {
    const { originalname, mimetype } = options;
    let finalResourceType = resourceType;
    let ext = '';
    let cleanBaseName = 'file';

    if (originalname) {
      ext = path.extname(originalname).toLowerCase();
      cleanBaseName = path.basename(originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    const isDocument = (mimetype && (
      mimetype === 'application/pdf' ||
      mimetype.includes('word') ||
      mimetype.includes('presentation') ||
      mimetype.includes('excel') ||
      mimetype.includes('spreadsheet') ||
      mimetype.includes('msword') ||
      mimetype === 'text/plain'
    )) || (ext && ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.csv'].includes(ext));

    const isVideo = (mimetype && mimetype.startsWith('video/')) ||
      (ext && ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.3gp', '.m4v'].includes(ext));

    const isImage = (mimetype && mimetype.startsWith('image/')) ||
      (ext && ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'].includes(ext));

    if (resourceType === 'auto') {
      if (isDocument) {
        finalResourceType = 'raw';
      } else if (isVideo) {
        finalResourceType = 'video';
      } else if (isImage) {
        finalResourceType = 'image';
      } else {
        finalResourceType = 'auto';
      }
    }

    const uploadOptions = {
      resource_type: finalResourceType,
    };

    if (finalResourceType === 'raw' && ext) {
      uploadOptions.public_id = `${folder}/${cleanBaseName}_${Date.now()}${ext}`;
    } else if (originalname) {
      uploadOptions.public_id = `${folder}/${cleanBaseName}_${Date.now()}`;
    } else {
      uploadOptions.folder = folder;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
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
