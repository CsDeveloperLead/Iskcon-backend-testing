const router = require('express').Router();
const { createLiveDarshan, getAllLiveDarshan, getLiveDarshanByDate, deleteLiveDarshan } = require('../../../controllers/liveDarshanControllers');

router.route('/create').post(createLiveDarshan);
router.route('/get').get(getAllLiveDarshan);
router.route('/get-date').post(getLiveDarshanByDate);
router.route('/delete/:id').delete(deleteLiveDarshan);

module.exports = router;