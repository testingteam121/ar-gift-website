const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      maxlength: [150, 'Template name cannot exceed 150 characters'],
    },
    category: {
      type: String,
      required: [true, 'Template category is required'],
      enum: {
        values: ['birthday', 'anniversary', 'wedding', 'love', 'festival'],
        message: '{VALUE} is not a valid template category',
      },
    },
    imageUrl: {
      type: String,
      required: [true, 'Template image URL is required'],
    },
    publicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    thumbnailUrl: {
      type: String,
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

templateSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Template', templateSchema);
