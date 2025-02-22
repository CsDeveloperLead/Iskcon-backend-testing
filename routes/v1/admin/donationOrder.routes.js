const router = require('express').Router();

const { createDonationOrder, getOrders2, getSingleOrder2, deleteOrder2 , orderBySpecificUser2 , updateOrderStatus2,status} = require('../../../controllers/donationOrderController');


router.post('/add', createDonationOrder); // to create order
router.post('/donationStatus', status); // to get status of Donation Order
router.get('/get', getOrders2); // to get all the orders
router.delete('/delete/:orderId', deleteOrder2); // to delete order
router.get('/get/orderBySpecificUser/:userId', orderBySpecificUser2); // to get order by specific user
router.put('/updateStatus/:orderId', updateOrderStatus2); // to update order status
router.get('/:transactionId', getSingleOrder2);



module.exports = router;