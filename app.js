require("dotenv").config();
const express = require("express");
const express_request_id = require("express-request-id");
const request_context = require("request-context");
const errorconfig = require("./helpers/errorconfig");
const { logger, expressLogger } = require("./utils/logger");
const cors = require("cors");
const { errorHandler } = require("./middlewares/errorHandler");
const routes = require("./routes/index");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const main = require("./routes/main.routes");
const PORT = process.env.PORT || 8080;

// const corsOptions = {
//     origin: ['http://localhost:3000', 'http://localhost:8080'], // allowed these origin only
//     credentials: true // // Allow cookies and credentials from the request
// }

// Dynamic Origin handling

app.use(expressLogger);

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:8080",
      "http://localhost:5173",
      "http://localhost:5175",
      "http://localhost:5174",
      "https://iskcon-backend-testing-pcnv.onrender.com",
      "https://truwix-isckon-frontend.vercel.app",
      "https://iskcon-wavecity-dev-api.truwix.com",
      "https://iskconwavecity.com",
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow the origin
    } else {
      callback(new Error("Origin not allowed by Cors"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express_request_id());
app.use(request_context.middleware("apirequest"));
app.use((req, _, next) => {
  request_context.set("apirequest:requestid", req["id"]);
  request_context.set("apirequest:apikey", req.headers["x-api-key"]);
  request_context.set("apirequest:IskconUser", req.headers["x-userid"]);
  next();
});

app.use(cookieParser());
app.use(bodyParser.json());

app.get("/", main);
app.use("/api/isckcon", routes);
// app.use((req, res, next) => {
//     next(errorconfig.formatErrorObject(errorconfig_1.errorlist['error_404']['resource_notFound']));
// });
// app.use(errorHandler);
app.use(express.static("public"));

process.on("uncaughtException", (err) => {
  logger.error(err);
});

app.listen(PORT, () => {
  logger.info(`server running on ${PORT}`);
});
exports.default = app;
