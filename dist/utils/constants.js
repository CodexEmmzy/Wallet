"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSessionToken = exports.saltRound = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const password_token_1 = require("../tokens/password.token");
exports.saltRound = 10;
const generateSessionToken = (userId) => {
    const expiration = Math.floor(Date.now() / 1000) + 5 * 24 * 60 * 60;
    return jsonwebtoken_1.default.sign({ userId, exp: expiration }, password_token_1.TOKEN_PASSWORD);
};
exports.generateSessionToken = generateSessionToken;
//# sourceMappingURL=constants.js.map