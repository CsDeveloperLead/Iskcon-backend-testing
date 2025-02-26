const router = require('express').Router();

const { createOrder, status , getAllOrders} = require('../../../controllers/csrDonationsOrdersControllers');

router.post('/add', createOrder); // to create order
router.post('/donationStatus', status); // to get status of Donation Order
router.get('/get', getAllOrders); // to get status of Donation Order


module.exports = router;
