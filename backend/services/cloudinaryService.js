import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_NAME &&
    process.env.CLOUDINARY_KEY &&
    process.env.CLOUDINARY_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });
} else {
  console.log('Cloudinary not configured. Falling back to local storage uploads.');
}

/**
 * Uploads a local file to Cloudinary.
 * If credentials are missing, returns the local URL route.
 * @param {string} localFilePath Path to the file on disk
 * @param {string} serverBaseUrl Base URL of this server (e.g. http://localhost:5000)
 */
export const uploadFile = async (localFilePath, serverBaseUrl = '') => {
  if (!localFilePath) return null;

  try {
    if (isCloudinaryConfigured()) {
      const result = await cloudinary.uploader.upload(localFilePath, {
        resource_type: 'auto',
      });
      // Delete temporary local file
      fs.unlinkSync(localFilePath);
      return result.secure_url;
    } else {
      // Fallback: return path served locally
      const cleanPath = localFilePath.replace(/\\/g, '/').replace(/^\.\//, ''); // e.g. "uploads/filename.png"
      return `${serverBaseUrl}/${cleanPath}`;
    }
  } catch (error) {
    console.error('File upload service error:', error.message);
    // Keep local file as a fail-safe
    const cleanPath = localFilePath.replace(/\\/g, '/').replace(/^\.\//, '');
    return `${serverBaseUrl}/${cleanPath}`;
  }
};
