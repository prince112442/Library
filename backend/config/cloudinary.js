const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage engine that uploads directly to Cloudinary under a
// dedicated folder, restricted to common image formats.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'library-system/book-covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 700, crop: 'fill' }],
  },
});

module.exports = { cloudinary, storage };
