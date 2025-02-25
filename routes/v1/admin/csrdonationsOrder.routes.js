const router = require('express').Router();

const { createOrder, status } = require('../../../controllers/csrDonationsOrdersControllers');

router.post('/add', createOrder); // to create order
router.post('/donationStatus', status); // to get status of Donation Order


module.exports = router;
