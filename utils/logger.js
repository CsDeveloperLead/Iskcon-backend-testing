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
const loggerInstance = pino(
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

// Separate Functions for Logging (Including `trace` and `fatal`)
const logger = {
  trace: function (...args) {
    const [message, data] = args;
    if (data) {
      return loggerInstance.trace({ message, data });
    }
    return loggerInstance.trace({ message });
  },

  debug: function (...args) {
    const [message, data] = args;
    if (data) {
      return loggerInstance.debug({ message, data });
    }
    return loggerInstance.debug({ message });
  },

  info: function (...args) {
    const [message, data] = args;
    if (data) {
      return loggerInstance.info({ message, data });
    }
    return loggerInstance.info({ message });
  },

  warn: function (...args) {
    const [message, data] = args;
    if (data) {
      return loggerInstance.warn({ message, data });
    }
    return loggerInstance.warn({ message });
  },

  error: function (...args) {
    const [message, error] = args;
    if (error instanceof Error) {
      return loggerInstance.error({
        message,
        errorMessage: error.message,
        stack: error.stack,
      });
    }
    return loggerInstance.error({ message, error });
  },

  fatal: function (...args) {
    const [message, data] = args;
    if (data) {
      return loggerInstance.fatal({ message, data });
    }
    return loggerInstance.fatal({ message });
  },
};

// Express Logger Middleware
const expressLogger = pinoHttp({
  logger: loggerInstance,
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
