const express = require('express');
const router = express.Router();
const {createOrder, updateOrder} = require("../../../controllers/csrOrderController");

router.post("/create-order",createOrder);
router.post("/update-status",updateOrder);

module.exports = router