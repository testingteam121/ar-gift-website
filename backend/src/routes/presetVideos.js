const express = require('express');
const {
  getPresetVideos,
  getPresetVideo,
  createPresetVideo,
  updatePresetVideo,
  deletePresetVideo,
} = require('../controllers/presetVideoController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

let videoFields;

if (cloudinaryConfigured) {
  const multer = require('multer');
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const cloudinary = require('../config/cloudinary');

  const combinedStorage = {
    video: new CloudinaryStorage({
      cloudinary,
      params: { folder: 'videos/preset', resource_type: 'video', allowed_formats: ['mp4', 'mov', 'webm'] },
    }),
    thumbnail: new CloudinaryStorage({
      cloudinary,
      params: { folder: 'videos/thumbnails', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] },
    }),
  };

  videoFields = multer({
    storage: combinedStorage.video,
    limits: { fileSize: 100 * 1024 * 1024 },
  }).fields([{ name: 'video', maxCount: 1 }]);
} else {
  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');

  const makeDir = (folder) => {
    const dir = path.join(__dirname, '../../uploads', folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  };

  const videoDir = makeDir('preset-videos');
  const thumbDir = makeDir('thumbnails');

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, file.fieldname === 'thumbnail' ? thumbDir : videoDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });

  const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

  const addLocalUrls = (req, res, next) => {
    const PORT = process.env.PORT || 5001;
    if (req.files) {
      Object.entries(req.files).forEach(([, files]) => {
        files.forEach((f) => {
          const folder = f.fieldname === 'thumbnail' ? 'thumbnails' : 'preset-videos';
          f.path = `http://localhost:${PORT}/uploads/${folder}/${f.filename}`;
          f.secure_url = f.path;
          f.public_id = `${folder}/${f.filename}`;
        });
      });
    }
    next();
  };

  videoFields = [
    upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
    addLocalUrls,
  ];
}

router.get('/', getPresetVideos);
router.get('/:id', getPresetVideo);
router.post('/', protect, adminOnly, videoFields, createPresetVideo);
router.put('/:id', protect, adminOnly, updatePresetVideo);
router.delete('/:id', protect, adminOnly, deletePresetVideo);

module.exports = router;
