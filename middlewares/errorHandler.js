const errorconfig = require('../helpers/errorconfig');
const logger = require('../utils/logger');
const errorHandler = (err, req, res, next) => {
    // logger.error(`Error: ${err}`);
    if (err.status === 400) {
        res.status(err.status).send(errorconfig.formatErrorObject(errorconfig.errorlist['error_400']['invalid_params']));
    }
    else if (err.status === 401) {
        res.status(err.status).send(errorconfig.formatErrorObject(errorconfig.errorlist['error_401']['invalid_credentials']));
    }
    else if (err.status === 404) {
        res.status(err.status).send(errorconfig.formatErrorObject(errorconfig.errorlist['error_404']['resource_notFound']));
    }
    else if (err.error_code) {
        res.status(err.status).send(err);
    }
    else {
        res.status(500).send(errorconfig.formatErrorObject(errorconfig.errorlist['error_500']['server_error']));
    }
};
module.exports.errorHandler = errorHandler;