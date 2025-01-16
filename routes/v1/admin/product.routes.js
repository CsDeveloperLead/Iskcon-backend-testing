const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProductById,
  editProductById,
} = require("../../../controllers/productController");
const { upload } = require('../../../middlewares/multer');
// const { verifyHMAC } = require("../middlewares/auth");

const router = express.Router();

router.post("/add",upload.array('image'), createProduct);
router.get("/all",  getAllProducts);
router.get("/:id",  getProductById);
router.delete("/delete/:id",  deleteProductById);
router.put("/edit/:id", upload.array('image'), editProductById);

module.exports = router; 
