const router = require('express').Router();
const { createBlogs, getBlogs, getSingleBlog, deleteBlog, editBlog } = require('../../../controllers/blogsControllers');
const { upload } = require('../../../middlewares/multer');
const { verifyAdminByToken } = require('../../../utils/cookieutil');

router.post('/create',verifyAdminByToken, upload.array('image'), createBlogs); // to create blog
router.get('/get', getBlogs); // to get all the blogs
router.get('/get/:blogId', getSingleBlog); // to get single blog
router.delete('/delete/:blogId',verifyAdminByToken, deleteBlog); // to delete blog
router.put('/edit/:blogId', verifyAdminByToken, upload.array('image'), editBlog); // to edit blog

module.exports = router;