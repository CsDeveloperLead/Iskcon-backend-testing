const router = require('express').Router();
const { createDonation, getDonations, getSingleDonations, deleteDonation, updateDonation } = require('../../../controllers/donationControllers');
const { upload } = require('../../../middlewares/multer');
const { verifyAdminByToken } = require('../../../utils/cookieutil');


router.post('/create', verifyAdminByToken, upload.array('image'), createDonation); // to create donation
router.get('/get', getDonations); // to get all the donations
router.get('/get/:donationId', getSingleDonations); // to get single donation
router.delete('/delete/:donationId', verifyAdminByToken, deleteDonation); // to delete donation
router.put('/edit/:donationId', verifyAdminByToken, upload.array('image'), updateDonation); // to delete donation


module.exports = router;