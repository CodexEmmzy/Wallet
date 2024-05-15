"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.NotFoundError = exports.BadRequestError = exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
exports.CustomError = CustomError;
class BadRequestError extends CustomError {
    constructor(message, context) {
        super(message);
        this.context = context;
        this.logging = true;
    }
    get errors() {
        return [{ message: this.message, context: this.context }];
    }
    get statusCode() {
        return BadRequestError.statusCode;
    }
    getLogging() {
        return this.logging;
    }
}
exports.BadRequestError = BadRequestError;
BadRequestError.statusCode = 400;
class NotFoundError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = 404;
    }
}
exports.NotFoundError = NotFoundError;
class InternalServerError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = 500;
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=CustomError.js.map