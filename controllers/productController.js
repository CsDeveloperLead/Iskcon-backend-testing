const Product = require('../models/product'); // Adjust the path as needed
const moment = require('moment-timezone');
const { uploadOnCloudinary } = require("../utils/cloudinary");

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, productId, subDesc } = req.body;

    // Validate input fields
    if (!name || !description || !price || !subDesc || !category || !req.files || req.files.length === 0 || !stock || !productId) {
      logger.warn(`All Input Fields should be there`);
      return res.status(400).json({ message: "All fields are required, including at least one image." });
    }

    // Upload images to Cloudinary
    const imageUrls = [];
    for (const file of req.files) {
      try {
        const cloudinaryResponse = await uploadOnCloudinary(file.path);
        imageUrls.push(cloudinaryResponse.secure_url);
      } catch (uploadError) {
        logger.error("Image upload failed:", uploadError.message);
        return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
      }
    }

    // Create the product in the database
    const product = await Product.create({
      name,
      description,
      price,
      category,
      images: imageUrls, // Store image URLs
      stock,
      productId,
      subDesc
    });

    // Check if product creation was successful
    if (!product) {
      logger.warn(`Product not found`);
      return res.status(500).json({ message: "Failed to create product" });
    }
    logger.info(`Created Product Successful`);
    // Send success response
    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    logger.error("Error in create Product API:", error.message);
    // Send error response
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};




// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}, "productId name subDesc description stock category images price").lean(); //  lean is used for optimization
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    logger.error(`Failed to fetch Products`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id, "productId name subDesc description images price stock size category").lean();

    if (!product) {
      logger.warn(`Product not found`);
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    logger.info(`Fetched Products using ID`);
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
};

// Delete product by ID
const deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      logger.warn(`Product not found`);
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    logger.info(`Deleted Product by ID`);
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    logger.error(`Error on Deleting Product`,error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
};

// Edit product by ID
const editProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let { previousImages } = req.body;
    const { name, description, price, category, stock, productId, subDesc } = req.body;

    if (!id || !name || !description || !price || !category || !stock || !productId) {
      logger.warn(`All Prodcts should be there`);
      return res.status(400).json({
        success: false,
        message: 'Invalid request',
      });
    }

    // Ensure previousImages is an array
    if (previousImages && typeof previousImages === "string") {
      try {
        previousImages = JSON.parse(previousImages); // Convert stringified array to actual array
      } catch (err) {
        logger.error(`Failed to Edit Product`,error);
        return res.status(400).json({ message: "Invalid format for previousImages" });
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (price) updates.price = price;
    if (category) updates.category = category;
    if (subDesc) updates.subDesc = subDesc
    if (req.files) {
      const newImages = [...previousImages];

      // Loop through the uploaded images
      for (const file of req.files) {
        try {
          const cloudinaryResponse = await uploadOnCloudinary(file.path);
          newImages.push(cloudinaryResponse.secure_url);
        } catch (uploadError) {
          logger.error(`Failed to Upload Image`,error);
          return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
        }
      }
      // Update the images field with new images (replace the old ones)
      updates.images = newImages; // Assuming you want to replace all images
    }
    if (stock) updates.stock = stock;
    if (productId) updates.productId = productId;

    const product = await Product.findByIdAndUpdate(   
      id,
      { ...updates, updatedAt: moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss') },
      { new: true, runValidators: true } // Return updated document
    );

    if (!product) {
      logger.warn(`Product not found`);
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    logger.info(`Product Updated Successfully`);
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    logger.error(`Failed to update Product`,error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProductById,
  editProductById,
};