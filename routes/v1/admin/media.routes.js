const router = require('express').Router();
const { createMedias ,getAllMedias , getSingleMedia , deleteMedia , editMedia, getMediaAsPerDate } = require('../../../controllers/mediaControllers');
const { upload } = require('../../../middlewares/multer');

router.post('/create', upload.array('image'), createMedias); // to create media
router.get('/get', getAllMedias); // to get all the media
router.post('/get-media-date', getMediaAsPerDate); // to get media as per date
router.get('/get/:mediaId', getSingleMedia); // to get single media
router.delete('/delete', deleteMedia); // to delete media
router.put('/edit/:mediaId', upload.array('image'), editMedia); // to edit media

module.exports = router;