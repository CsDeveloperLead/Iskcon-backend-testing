const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
// all admins routes
const blogRouterAdmin = require('./v1/admin/blogs.routes');
const mediaRouterAdmin = require('./v1/admin/media.routes');
const donationRouterAdmin = require('./v1/admin/donation.routes');
const guestHouseRouterAdmin = require('./v1/admin/guestHouse.routes');
const eventRouterAdmin = require('./v1/admin/events.routes');
const serviceRouterAdmin = require('./v1/admin/services.routes');
const orderRouterAdmin = require('./v1/admin/order.routes');
const adminCreate = require('./v1/admin/admin.routes');
const offlineClassesRouter = require('./v1/admin/offlineClasses.routes');
const productAdminRouter = require('./v1/admin/product.routes');
const csrDonationRouter = require('./v1/admin/csrdonation.routes');
const registerUser = require('./v1/admin/users');
const contactRouter = require('./v1/admin/contact.routes');
const donationOrderRouter = require('./v1/admin/donationOrder.routes');
const liveDarshanRouter = require('./v1/admin/liveDarshan.routes');
const dailyStoryRouter = require('./v1/admin/dailyStory.routes');
// const iskconCore = require('../routes/v1/iskconCore');
// const apiKeyCheck = require("../middlewares/apiKeyCheck");

const router = express.Router();
// router.use(apiKeyCheck);
// router.use('/v1', iskconCore);
// all admins routes
router.use(bodyParser.json());
router.use('/v1/secure', registerUser);
router.use('/v1/admin/add', adminCreate);
router.use('/v1/admin/blog', blogRouterAdmin);
router.use('/v1/admin/media', mediaRouterAdmin);
router.use('/v1/admin/donation', donationRouterAdmin);
router.use('/v1/admin/guestHouse', guestHouseRouterAdmin);
router.use('/v1/admin/event', eventRouterAdmin);
router.use('/v1/admin/service', serviceRouterAdmin);
router.use('/v1/admin/order', orderRouterAdmin);
router.use('/v1/admin/offlineClasses', offlineClassesRouter);
router.use('/v1/admin/product', productAdminRouter);
router.use('/v1/admin/csrdonation', csrDonationRouter);
router.use('/v1/admin/contact', contactRouter);
router.use('/v1/admin/donationOrder', donationOrderRouter);
router.use('/v1/admin/liveDarshan', liveDarshanRouter);
router.use('/v1/admin/daily-story', dailyStoryRouter);



module.exports = router;