const fs = require("fs");
const pino = require("pino");
const moment = require("moment-timezone");
const pinoHttp = require("pino-http");
const requestContext = require("request-context");
require("dotenv").config();

// Retrieve log level from environment variables or default to 'info'
const defaultLogLevel = process.env.LOG_LEVEL || "info";

const logLevels = {
  levels: {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
  },
  useOnlyCustom: true,
};

if (!logLevels.levels[defaultLogLevel]) {
  throw new Error(
    `Default level '${defaultLogLevel}' must be included in custom levels.`
  );
}

// Define log destination
const logDestination = process.stdout; // Change to a file stream if needed

// Custom Logger
const logger = pino(
  {
    customLevels: logLevels.levels,
    useOnlyCustomLevels: logLevels.useOnlyCustom,
    level: defaultLogLevel,
    mixin() {
      return {
        requestId: requestContext.get("apirequest:requestid") || "",
        client: requestContext.get("apirequest:client") || "",
        user: requestContext.get("apirequest:iskconUser") || "",
      };
    },
    redact: ["req.headers['x-api-key']", "req.headers['dm_token']"],
    timestamp: () =>
      `,"timestamp":"${moment()
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DDTHH:mm:ss.SSS")}"`,
  },
  logDestination
);

const originalError = logger.error;
logger.error = function (...args) {
  const [message, error] = args;
  if (error instanceof Error) {
    return originalError.call(logger, {
      message,
      errorMessage: error.message,
      stack: error.stack,
    });
  }
  return originalError.call(logger, message);
};

const originalWarn = logger.warn;
logger.warn = function (...args) {
  const [message, data] = args;
  if (data) {
    return originalWarn.call(logger, { message, data });
  }
  return originalWarn.call(logger, message);
};

const originalDebug = logger.debug;
logger.debug = function (...args) {
  if (args.length > 1) {
    return originalDebug.call(logger, {
      message: args[0],
      data: args.slice(1),
    });
  }
  return originalDebug.call(logger, ...args);
};

// Express Logger
const expressLogger = pinoHttp({
  logger: logger,
  serializers: {
    req(req) {
      req.body = req.raw.body;
      return req;
    },
  },
});

module.exports = {
  expressLogger,
  logger,
};
