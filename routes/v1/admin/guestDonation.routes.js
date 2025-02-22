const router = require('express').Router();

const { createGuestDonationOrder, status, getGuestDonations, deleteGuestDonation } = require('../../../controllers/guestDonationsControllers');


router.post('/add', createGuestDonationOrder);
router.post('/status', status);
router.get('/get', getGuestDonations);
router.delete('/delete/:guestDonationId', deleteGuestDonation);



module.exports = router;