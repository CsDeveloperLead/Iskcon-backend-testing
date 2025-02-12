const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProductById,
  editProductById,
} = require("../controllers/productControllers");
const { verifyHMAC } = require("../middlewares/auth");

const router = express.Router();

router.post("/add", createProduct);
router.get("/all", verifyHMAC, getAllProducts);
router.get("/:id", verifyHMAC, getProductById);
router.delete("/:id", verifyHMAC, deleteProductById);
router.put("/:id", verifyHMAC, editProductById);

module.exports = router; 

