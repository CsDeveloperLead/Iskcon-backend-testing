const router = require('express').Router();
const { createHouseGuest, getAllGuestHouses, deleteGuestHouse, editGuestHouse } = require('../../../controllers/guestHouseControllers');
const { upload } = require('../../../middlewares/multer');

router.post('/create', upload.array('image'), createHouseGuest); // to create guest house
router.get('/get', getAllGuestHouses); // to get all the guest houses
router.delete('/delete', deleteGuestHouse); // to delete guest house
router.put('/edit/:guestHouseId', upload.array('image'), editGuestHouse); // to edit guest house

module.exports = router;