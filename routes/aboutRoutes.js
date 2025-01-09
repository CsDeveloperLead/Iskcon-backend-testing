const express = require('express');
const { addBlog, deleteBlog, editAndUpdateBlog } = require('../controllers/aboutControllers');
const { verifyHMAC } = require('../middlewares/auth');

const router = express.Router();

// Route to add a new blog
router.post('/add',verifyHMAC, addBlog);

// Route to delete a blog by ID
router.delete('/delete/:id',verifyHMAC, deleteBlog);

// Route to edit and update a blog by ID
router.put('/edit/:id',verifyHMAC, editAndUpdateBlog);

module.exports = router;
