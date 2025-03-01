const express = require('express');
const { signup, login, verifyOtp, removeUser, getUserDataDecoded, otpsender, verifyOTP, sendOTPbyEmail,resetPassword ,GoogleLogin,getAllUSers} = require('../../../controllers/usersControllers');
const { verifyHMAC } = require('../../../middlewares/auth');
const { signUpValidation } = require('../../../middlewares/usersHandler');
const router = express.Router();


router.post('/signup', signUpValidation, signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.delete('/user-delete', removeUser);
router.get('/decode', getUserDataDecoded);
router.post('/send-otp', sendOTPbyEmail);
router.post('/reset-password', resetPassword);
router.post('/google-auth', GoogleLogin);
router.get('/all', getAllUSers);

// router.post('/send-otp', otpsender);
// router.post('/verify-otp-mobile', verifyOTP);
// router.post('/protected', verifyHMAC, (req, res) => {
//   res.json({ message: 'Access granted', data: req.body });
// });

module.exports = router;