const express = require('express');
const { signup, login, verifyOtp, removeUser, getUserDataDecoded } = require('../../../controllers/usersControllers');
const { verifyHMAC } = require('../../../middlewares/auth');
const { signUpValidation } = require('../../../middlewares/usersHandler');
const router = express.Router();


router.post('/signup', signUpValidation, signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.delete('/user-delete', removeUser);
router.get('/decode', getUserDataDecoded);
// router.post('/protected', verifyHMAC, (req, res) => {
//   res.json({ message: 'Access granted', data: req.body });
// });

module.exports = router;