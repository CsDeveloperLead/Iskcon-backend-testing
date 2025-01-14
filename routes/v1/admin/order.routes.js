const router = require('express').Router();

const { createOrder, getOrders, getSingleOrder, deleteOrder , orderBySpecificUser , updateOrderStatus} = require('../../../controllers/ordersControllers');


router.post('/create', createOrder); // to create order
router.get('/get', getOrders); // to get all the orders
router.get('/get/:orderId', getSingleOrder); // to get single order
router.delete('/delete/:orderId', deleteOrder); // to delete order
router.get('/get/orderBySpecificUser/:userId', orderBySpecificUser); // to get order by specific user
router.put('/updateStatus/:orderId', updateOrderStatus); // to update order status



module.exports = router;