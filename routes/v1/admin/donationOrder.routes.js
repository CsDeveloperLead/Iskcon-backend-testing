const router = require("express").Router();
const {
  createDonationOrder,
  getDonationOrders,
  getSingleDonationOrder,
  deleteDonationOrder,
  donationOrderBySpecificUser,
  updateDonationOrderStatus,
  donationStatus,
} = require("../../../controllers/donationOrderController");

router.post("/add", createDonationOrder);
router.get("/get", getDonationOrders);
router.get("/get/:donationOrderId", getSingleDonationOrder);
router.delete("/delete/:donationOrderId", deleteDonationOrder);
router.get(
  "/get/donationOrderBySpecificUser/:userId",
  donationOrderBySpecificUser
);
router.put("/updateStatus/:donationOrderId", updateDonationOrderStatus);
router.get("/status", donationStatus);

module.exports = router;
