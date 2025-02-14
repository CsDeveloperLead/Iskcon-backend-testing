const router = require('express').Router();
const { createHouseGuest, getAllGuestHouses, deleteGuestHouse, editGuestHouse } = require('../../../controllers/guestHouseControllers');
const { upload } = require('../../../middlewares/multer');
const { verifyAdminByToken } = require('../../../utils/cookieutil');

router.post('/create', verifyAdminByToken, upload.array('image'), createHouseGuest); // to create guest house
router.get('/get', getAllGuestHouses); // to get all the guest houses
router.delete('/delete', verifyAdminByToken, deleteGuestHouse); // to delete guest house
router.put('/edit/:guestHouseId', verifyAdminByToken, upload.array('image'), editGuestHouse); // to edit guest house

module.exports = router;