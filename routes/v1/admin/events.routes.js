const router = require('express').Router();
const { createEvents, getEvents, getSingleEvent, deleteEvent, editEvent } = require('../../../controllers/eventsControllers');
const { upload } = require('../../../middlewares/multer');
const { verifyAdminByToken } = require('../../../utils/cookieutil');

router.post('/create', verifyAdminByToken, upload.array('image'), createEvents); // to create event
router.get('/get', getEvents); // to get all the events
router.get('/get/:eventId', getSingleEvent); // to get single event
router.delete('/delete/:eventId', verifyAdminByToken, deleteEvent); // to delete event
router.put('/edit/:eventId', verifyAdminByToken, upload.array('image'), editEvent); // to edit event

module.exports = router;