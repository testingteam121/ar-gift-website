const Template = require('../models/Template');
const cloudinary = require('../config/cloudinary');

const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

// @desc    Get all templates with optional category filter
// @route   GET /api/templates
// @access  Public
const getTemplates = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    const templates = await Template.find(query).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: templates.length,
      templates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single template
// @route   GET /api/templates/:id
// @access  Public
const getTemplate = async (req, res, next) => {
  try {
    const template = await Template.findOne({ _id: req.params.id, isActive: true });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found.' });
    }
    res.status(200).json({ success: true, template });
  } catch (error) {
    next(error);
  }
};

// @desc    Create template
// @route   POST /api/templates
// @access  Admin
const createTemplate = async (req, res, next) => {
  try {
    const { name, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Template image is required.' });
    }

    // Generate thumbnail URL
    const thumbnailUrl = cloudinaryConfigured
      ? cloudinary.url(req.file.filename, { width: 200, height: 200, crop: 'fill', quality: 'auto', format: 'webp' })
      : req.file.path; // local dev: reuse the image URL as thumbnail

    const template = await Template.create({
      name,
      category,
      imageUrl: req.file.path,
      publicId: req.file.filename,
      thumbnailUrl,
    });

    res.status(201).json({ success: true, message: 'Template created successfully.', template });
  } catch (error) {
    next(error);
  }
};

// @desc    Update template
// @route   PUT /api/templates/:id
// @access  Admin
const updateTemplate = async (req, res, next) => {
  try {
    const { name, category, isActive } = req.body;
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found.' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    if (req.file) {
      if (cloudinaryConfigured && template.publicId) {
        await cloudinary.uploader.destroy(template.publicId);
      }
      updateData.imageUrl = req.file.path;
      updateData.publicId = req.file.filename;
      updateData.thumbnailUrl = cloudinaryConfigured
        ? cloudinary.url(req.file.filename, { width: 200, height: 200, crop: 'fill', quality: 'auto', format: 'webp' })
        : req.file.path;
    }

    const updatedTemplate = await Template.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Template updated successfully.', template: updatedTemplate });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete template
// @route   DELETE /api/templates/:id
// @access  Admin
const deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found.' });
    }

    if (cloudinaryConfigured && template.publicId) {
      await cloudinary.uploader.destroy(template.publicId);
    }

    await Template.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Template deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate };
