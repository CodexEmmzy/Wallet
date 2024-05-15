"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = void 0;
const CustomError_1 = require("./CustomError");
class BadRequestError extends CustomError_1.CustomError {
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
//# sourceMappingURL=BadRequestError.js.map