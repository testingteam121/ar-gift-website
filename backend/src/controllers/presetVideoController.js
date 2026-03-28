const PresetVideo = require('../models/PresetVideo');
const cloudinary = require('../config/cloudinary');

const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

// @desc    Get all preset videos with optional category filter
// @route   GET /api/preset-videos
// @access  Public
const getPresetVideos = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    const videos = await PresetVideo.find(query).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single preset video
// @route   GET /api/preset-videos/:id
// @access  Public
const getPresetVideo = async (req, res, next) => {
  try {
    const video = await PresetVideo.findOne({ _id: req.params.id, isActive: true });
    if (!video) {
      return res.status(404).json({ success: false, message: 'Preset video not found.' });
    }
    res.status(200).json({ success: true, video });
  } catch (error) {
    next(error);
  }
};

// @desc    Create preset video
// @route   POST /api/preset-videos
// @access  Admin
const createPresetVideo = async (req, res, next) => {
  try {
    const { name, category, duration } = req.body;

    if (!req.files || !req.files.video || req.files.video.length === 0) {
      return res.status(400).json({ success: false, message: 'Video file is required.' });
    }

    const videoFile = req.files.video[0];
    let thumbnailUrl = '';
    let thumbnailPublicId = '';

    // Use provided thumbnail or generate from video
    if (req.files.thumbnail && req.files.thumbnail.length > 0) {
      thumbnailUrl = req.files.thumbnail[0].path;
      thumbnailPublicId = req.files.thumbnail[0].filename;
    } else if (cloudinaryConfigured) {
      // Auto-generate thumbnail from video using Cloudinary
      thumbnailUrl = cloudinary.url(videoFile.filename, {
        resource_type: 'video',
        format: 'jpg',
        start_offset: '0',
        width: 400,
        height: 300,
        crop: 'fill',
      });
    } else {
      thumbnailUrl = videoFile.path; // local dev: no auto-thumbnail
    }

    const video = await PresetVideo.create({
      name,
      category,
      videoUrl: videoFile.path,
      publicId: videoFile.filename,
      thumbnailUrl,
      duration: duration ? Number(duration) : undefined,
    });

    res.status(201).json({ success: true, message: 'Preset video created successfully.', video });
  } catch (error) {
    next(error);
  }
};

// @desc    Update preset video
// @route   PUT /api/preset-videos/:id
// @access  Admin
const updatePresetVideo = async (req, res, next) => {
  try {
    const { name, category, isActive, duration } = req.body;
    const video = await PresetVideo.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Preset video not found.' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (duration !== undefined) updateData.duration = Number(duration);

    const updatedVideo = await PresetVideo.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Preset video updated successfully.', video: updatedVideo });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete preset video
// @route   DELETE /api/preset-videos/:id
// @access  Admin
const deletePresetVideo = async (req, res, next) => {
  try {
    const video = await PresetVideo.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Preset video not found.' });
    }

    if (cloudinaryConfigured && video.publicId) {
      await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });
    }

    await PresetVideo.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Preset video deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPresetVideos, getPresetVideo, createPresetVideo, updatePresetVideo, deletePresetVideo };
