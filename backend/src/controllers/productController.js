const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

// @desc    Get all products with filters and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, page = 1, limit = 12, sort = '-createdAt' } = req.query;

    const query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, features, stock } = req.body;

    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        images.push({
          url: file.path,
          publicId: file.filename,
        });
      }
    }

    const featuresArray = typeof features === 'string'
      ? features.split(',').map((f) => f.trim()).filter(Boolean)
      : Array.isArray(features) ? features : [];

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      images,
      features: featuresArray,
      stock: Number(stock) || 0,
    });

    res.status(201).json({ success: true, message: 'Product created successfully.', product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, features, stock, isActive } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (category !== undefined) updateData.category = category;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    if (features !== undefined) {
      updateData.features = typeof features === 'string'
        ? features.split(',').map((f) => f.trim()).filter(Boolean)
        : Array.isArray(features) ? features : [];
    }

    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
      updateData.images = [...product.images, ...newImages];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Product updated successfully.', product: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Soft delete
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product image
// @route   DELETE /api/products/:id/images/:publicId
// @access  Admin
const removeProductImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const publicId = decodeURIComponent(req.params.publicId);
    if (cloudinaryConfigured) await cloudinary.uploader.destroy(publicId);

    product.images = product.images.filter((img) => img.publicId !== publicId);
    await product.save();

    res.status(200).json({ success: true, message: 'Image removed successfully.', product });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, removeProductImage };
