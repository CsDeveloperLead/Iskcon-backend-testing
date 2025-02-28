class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400; // Status codes less than 400 indicate success
    }

    // Optional: Method to send the response directly
    send(res) {
        return res.status(this.statusCode).json({
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
            success: this.success,
        });
    }
}

module.exports = ApiResponse;