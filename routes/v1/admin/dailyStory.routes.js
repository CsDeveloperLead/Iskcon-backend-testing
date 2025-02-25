const router = require('express').Router();
const { createStory, getAllStory, getStoryByDate, deleteStory, updateStory } = require('../../../controllers/dailyStoryControllers');
const { upload } = require('../../../middlewares/multer');

router.route('/create').post(upload.array('media'), createStory);
router.route('/').get(getAllStory);
router.route('/get-date').post(getStoryByDate);
router.route('/delete/:id').delete(deleteStory);
router.route('/update/:id').put(upload.array('media'), updateStory);

module.exports = router;