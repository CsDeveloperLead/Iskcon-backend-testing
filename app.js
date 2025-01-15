const express = require('express');
// const express_request_id = require('express-request-id');
// const request_context = require('request-context');
// const errorconfig = require('./helpers/errorconfig');
const { logger, expressLogger } = require('./utils/logger');
const cors = require('cors');
const { errorHandler } = require("./middlewares/errorHandler");
const routes = require('./routes/index');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 8080;

// const corsOptions = {
//     origin: ['http://localhost:3000', 'http://localhost:8080'], // allowed these origin only
//     credentials: true // // Allow cookies and credentials from the request
// }

// Dynamic Origin handling
// const corsOptions = {
//     origin: function (origin, callback) {
//         const allowedOrigins = ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173','http://localhost:5175'];
//         if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//             callback(null, true); // Allow the origin
//         } else {
//             callback(new Error('Origin not allowed by Cors'));
//         }
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
// }
app.use(cors('*'));
// app.use(express_request_id());
// app.use(request_context.default.middleware('apirequest'));
// app.use((req, _, next) => {
//     request_context.set('apirequest:requestid', req['id']);
//     request_context.set('apirequest:apikey', req.headers['x-api-key']);
//     request_context.set('apirequest:IskconUser', req.headers['x-userid']);
//     next();
// });
app.use(cookieParser());
app.use(bodyParser.json());
// app.use(expressLogger);

// check heartbeat

app.use('/api/isckcon', routes);
// app.use((req, res, next) => {
//     next(errorconfig.formatErrorObject(errorconfig_1.errorlist['error_404']['resource_notFound']));
// });
app.use(errorHandler);
app.use(express.static("public"))

process.on('uncaughtException', (err) => {
    // logger.error(err);
});

app.listen(PORT, () => {
    logger.debug(`server running on ${PORT}`);
});
exports.default = app;

