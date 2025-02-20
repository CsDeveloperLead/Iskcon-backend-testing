const router = require('express').Router();
const { createServices, getServices, getSingleService, deleteService, editService } = require('../../../controllers/serviceControllers');
const { upload } = require('../../../middlewares/multer');

router.post('/create', upload.array('image'), createServices); // to create service
router.get('/get', getServices); // to get all the services
router.get('/get/:serviceId', getSingleService); // to get single service
router.delete('/delete/:serviceId', deleteService); // to delete service
router.put('/edit/:serviceId', upload.array('image'), editService); // to edit service

module.exports = router;