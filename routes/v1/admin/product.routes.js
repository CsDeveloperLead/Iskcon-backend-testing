const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProductById,
  editProductById,
} = require("../../../controllers/productController");
const { upload } = require('../../../middlewares/multer');
const { verifyAdminByToken } = require("../../../utils/cookieutil");
// const { verifyHMAC } = require("../middlewares/auth");

const router = express.Router();

router.post("/add", verifyAdminByToken, upload.array('image'), createProduct);
router.get("/all",  getAllProducts);
router.get("/:id",  getProductById);
router.delete("/delete/:id", verifyAdminByToken, deleteProductById);
router.put("/edit/:id", verifyAdminByToken, upload.array('image'), editProductById);

module.exports = router; 
