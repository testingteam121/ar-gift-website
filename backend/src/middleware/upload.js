const multer = require('multer');
const path = require('path');
const fs = require('fs');

const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

// File filters
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP) are allowed.'), false);
  }
};

const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files (MP4, MOV) are allowed.'), false);
  }
};

let imageUpload, videoUpload, productImageUpload, templateUpload, presetVideoUpload;

if (cloudinaryConfigured) {
  // ── Cloudinary storage ──────────────────────────────────────────────────────
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const cloudinary = require('../config/cloudinary');

  const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'uploads/images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });

  const videoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'uploads/videos',
      resource_type: 'video',
      allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
    },
  });

  const productImageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'products/images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
    },
  });

  const templateStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'templates/images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
    },
  });

  const thumbnailStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'videos/thumbnails',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 400, height: 300, crop: 'fill', quality: 'auto' }],
    },
  });

  const presetVideoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'videos/preset',
      resource_type: 'video',
      allowed_formats: ['mp4', 'mov', 'webm'],
    },
  });

  imageUpload = multer({ storage: imageStorage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
  videoUpload = multer({ storage: videoStorage, fileFilter: videoFilter, limits: { fileSize: 50 * 1024 * 1024 } });
  productImageUpload = multer({ storage: productImageStorage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
  templateUpload = multer({ storage: templateStorage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
  presetVideoUpload = multer({ storage: presetVideoStorage, fileFilter: videoFilter, limits: { fileSize: 100 * 1024 * 1024 } });

} else {
  // ── Local disk storage fallback (development) ────────────────────────────────
  console.log('⚠️  Cloudinary not configured — using local disk storage for uploads');

  const UPLOADS_ROOT = path.join(__dirname, '../../uploads');

  const makeLocalStorage = (folder) => {
    const dir = path.join(UPLOADS_ROOT, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    return multer.diskStorage({
      destination: (req, file, cb) => cb(null, dir),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
      },
    });
  };

  // Middleware that adds Cloudinary-compatible fields to req.file after local save
  const localFileMiddleware = (folder) => (req, res, next) => {
    const PORT = process.env.PORT || 5001;
    if (req.file) {
      req.file.path = `http://localhost:${PORT}/uploads/${folder}/${req.file.filename}`;
      req.file.filename = req.file.filename;
      // mimic Cloudinary response shape used in route handlers
      req.file.secure_url = req.file.path;
      req.file.public_id = `${folder}/${req.file.filename}`;
    }
    if (req.files) {
      req.files.forEach((f) => {
        f.path = `http://localhost:${PORT}/uploads/${folder}/${f.filename}`;
        f.secure_url = f.path;
        f.public_id = `${folder}/${f.filename}`;
      });
    }
    next();
  };

  const wrapWithLocal = (folder, filter, sizeLimit) => {
    const upload = multer({
      storage: makeLocalStorage(folder),
      fileFilter: filter,
      limits: { fileSize: sizeLimit },
    });
    // Return an object whose .single/.array/.fields methods append the localFileMiddleware
    return new Proxy(upload, {
      get(target, prop) {
        if (['single', 'array', 'fields', 'any', 'none'].includes(prop)) {
          return (...args) => {
            const multerMiddleware = target[prop](...args);
            return [multerMiddleware, localFileMiddleware(folder)];
          };
        }
        return target[prop];
      },
    });
  };

  imageUpload       = wrapWithLocal('images',         imageFilter, 10 * 1024 * 1024);
  videoUpload       = wrapWithLocal('videos',         videoFilter, 50 * 1024 * 1024);
  productImageUpload = wrapWithLocal('products',      imageFilter, 10 * 1024 * 1024);
  templateUpload    = wrapWithLocal('templates',      imageFilter, 10 * 1024 * 1024);
  presetVideoUpload = wrapWithLocal('preset-videos',  videoFilter, 100 * 1024 * 1024);
}

module.exports = {
  imageUpload,
  videoUpload,
  productImageUpload,
  templateUpload,
  presetVideoUpload,
};
