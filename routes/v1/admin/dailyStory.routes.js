const router = require('express').Router();
const { createStory, getAllStory, getStoryByDate, deleteStory } = require('../../../controllers/dailyStoryControllers');
const { upload } = require('../../../middlewares/multer');

router.route('/create').post(upload.array('images', 10), createStory);
router.route('/').get(getAllStory);
router.route('/get-date').post(getStoryByDate);
router.route('/delete/:id').delete(deleteStory);

module.exports = router;