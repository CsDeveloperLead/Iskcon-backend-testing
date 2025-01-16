const Product = require('../models/product'); // Adjust the path as needed
const moment = require('moment-timezone');
const { uploadOnCloudinary } = require("../utils/cloudinary");

// Create a new product
const createProduct = async (req, res) => {
    console.log("Create Product API called");

    try {
        const { name, description, price, category } = req.body;

        // Log the request body for debugging
        console.log("Request Body:", req.body);

        // Validate input fields
        if (!name || !description || !price || !category || !req.files || req.files.length === 0) {
            return res.status(400).json({ message: "All fields are required, including at least one image." });
        }

        console.log("Validation successful. Proceeding to image upload...");

        // Upload images to Cloudinary
        const imageUrls = [];
        for (const file of req.files) {
            try {
                const cloudinaryResponse = await uploadOnCloudinary(file.path);
                imageUrls.push(cloudinaryResponse.secure_url);
                console.log(`Uploaded image: ${cloudinaryResponse.secure_url}`);
            } catch (uploadError) {
                console.error("Image upload failed:", uploadError.message);
                return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
            }
        }

        console.log("Image upload complete. Proceeding to product creation...");

        // Create the product in the database
        const product = await Product.create({
            name,
            description,
            price,
            category,
            images: imageUrls, // Store image URLs
        });

        // Check if product creation was successful
        if (!product) {
            return res.status(500).json({ message: "Failed to create product" });
        }

        console.log("Product created successfully:", product);

        // Send success response
        return res.status(201).json({
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        console.error("Error in createProduct API:", error.message);

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
    const products = await Product.find();
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
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
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
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
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
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
    const updates = req.body; // Assuming JSON payload

    const product = await Product.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss') },
      { new: true, runValidators: true } // Return updated document
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
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