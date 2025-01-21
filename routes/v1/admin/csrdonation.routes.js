const router = require('express').Router();
const { upload } = require('../../../middlewares/multer');

const { createCSRDonation, getAllCSRDonations, getSingleCSRDonation, updateCSRDonation,deleteCSRDonation } = require('../../../controllers/csrDonationController');

router.post('/create', upload.fields([{name : "image"}]), createCSRDonation); // to create csr donation
router.get('/', getAllCSRDonations); // to get all the csr getAllCSRDonations    
router.get('/:id', getSingleCSRDonation); // to get single csr donation
router.put('/:id', upload.single('image'), updateCSRDonation); // to edit csr donation
router.delete('/:id', deleteCSRDonation); // to delete csr donation

module.exports = router;
