const express = require("express");


const {createOrUpdateProfile} = require('../../../controllers/profileController');

const router = express.Router();

router.post('/create', createOrUpdateProfile);

module.exports = router;