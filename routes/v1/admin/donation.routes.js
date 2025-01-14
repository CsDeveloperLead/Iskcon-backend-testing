const router = require('express').Router();
const { createDonation, getDonations, getSingleDonations, deleteDonation } = require('../../../controllers/donationControllers');
const { upload } = require('../../../middlewares/multer');


router.post('/create', upload.array('image'), createDonation); // to create donation
router.get('/get', getDonations); // to get all the donations
router.get('/get/:donationId', getSingleDonations); // to get single donation
router.delete('/delete/:donationId', deleteDonation); // to delete donation

module.exports = router;