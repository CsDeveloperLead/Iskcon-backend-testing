const fs = require('fs');
const pino = require('pino');
const moment = require('moment-timezone');
const pino_http = require('pino-http');
const request_context = require('request-context');
require('dotenv').config();

console.log(process.env.LOG_LEVEL);

const logLevels = {
  levels: {
    trace: 0,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60
  },
  useOnlyCustom: true
};

const logDestination = process.stdout; // Can be changed to a file stream or any other writable stream
const logger = pino(logLevels, {
  level: process.env.LOG_LEVEL || 'info',
  mixin() {
    return {
      requestId: request_context.get('apirequest:requestid') || '',
      client: request_context.get('apirequest:client') || '',
      user: request_context.get('apirequest:iskconUser') || '',
    };
  },
  redact: ['req.headers["x-api-key"]', 'req.headers["dm_token"]'],
  timestamp: () => `"timestamp":"${moment().tz("Asia/Kolkata").format('YYYY-MM-DDTHH:mm:ss.SSS')}"`,
  destination: logDestination // Ensure this is a writable stream
});

const expressLogger = pino_http({
  logger: logger,
  serializers: {
    req(req) {
      req.body = req.raw.body;
      return req;
    },
  },
});

module.exports.expressLogger = expressLogger;
module.exports.logger = logger;
