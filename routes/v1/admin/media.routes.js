const router = require('express').Router();
const { createMedias ,getAllMedias , getSingleMedia , deleteMedia , editMedia } = require('../../../controllers/mediaControllers');
const { upload } = require('../../../middlewares/multer');
const { verifyAdminByToken } = require('../../../utils/cookieutil');

router.post('/create', verifyAdminByToken, upload.array('image'), createMedias); // to create service
router.get('/get', getAllMedias); // to get all the services
router.get('/get/:mediaId', getSingleMedia); // to get single service
router.delete('/delete',verifyAdminByToken, deleteMedia); // to delete service
router.put('/edit/:mediaId', verifyAdminByToken, upload.array('image'), editMedia); // to edit service

module.exports = router;