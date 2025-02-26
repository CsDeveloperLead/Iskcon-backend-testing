const router = require('express').Router();
const { createOfflineClasses, getClasses, getSingleClass, deleteClass, editClass } = require('../../../controllers/offlineClassesControllers');
const { upload } = require('../../../middlewares/multer');

router.post('/create', upload.array('image'), createOfflineClasses); // to create class
router.get('/', getClasses); // to get all the classes
router.get('/:classId', getSingleClass); // to get single class
router.delete('/delete/:classId', deleteClass); // to delete class
router.put('/edit/:classId', upload.array('image'), editClass); // to edit class

module.exports = router;