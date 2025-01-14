exports.errorlist = {
    error_400: {
        invalid_params: {
            status: 400,
            message: 'Invalid prameters in request.',
            error_code: 'invalid_params',
        },
    },
    error_401: {
        invalid_credentials: {
            status: 401,
            message: 'Invalid API key provided.',
            error_code: 'invalid_credentials',
        },
    },
    error_404: {
        resource_notFound: {
            status: 404,
            message: 'Requested resource not found.',
            error_code: 'resource_notFound',
        },
    },
    error_409: {
        data_duplicate: {
            status: 409,
            message: 'data already exist',
            error_code: 'data_duplicate',
        },
    },
    error_500: {
        server_error: {
            status: 500,
            message: 'Internal server error.',
            error_code: 'server_error',
        },
    },
    error_503: {
        service_down: {
            status: 503,
            message: 'Under maintenance.',
            error_code: 'service_down',
        },
    },
    error_429: {
        max_req_limit: {
            status: 429,
            message: 'Maximum request limit reached.',
            error_code: 'max_req_limit',
        },
    },
};
const formatErrorObject = (errObj) => {
    const err = new Error();
    err.status = errObj.status;
    err.error_code = errObj.error_code;
    err.message = errObj.message;
    return err;
};
exports.formatErrorObject = formatErrorObject;