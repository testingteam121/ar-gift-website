const mongoose = require('mongoose');

const presetVideoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Video name is required'],
      trim: true,
      maxlength: [150, 'Video name cannot exceed 150 characters'],
    },
    category: {
      type: String,
      required: [true, 'Video category is required'],
      enum: {
        values: ['birthday', 'romantic', 'wedding', 'festival', 'general'],
        message: '{VALUE} is not a valid video category',
      },
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    publicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    thumbnailUrl: {
      type: String,
    },
    duration: {
      type: Number, // in seconds
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

presetVideoSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('PresetVideo', presetVideoSchema);
