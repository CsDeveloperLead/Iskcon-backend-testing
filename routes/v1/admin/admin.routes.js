const express = require('express');
const { signup, login } = require('../../../controllers/adminControllers');
const { verifyHMAC } = require('../../../middlewares/auth');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
// router.post('/protected', verifyHMAC, (req, res) => {
//   res.json({ message: 'Access granted', data: req.body });
// });

module.exports = router;