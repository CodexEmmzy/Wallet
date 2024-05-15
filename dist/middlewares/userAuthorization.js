"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../entities/User");
const password_token_1 = require("../tokens/password.token");
const CustomError_1 = require("../errors/CustomError");
const auth = async (req, _res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header) {
            throw new CustomError_1.BadRequestError("Authorization header is missing");
        }
        const tokenParts = header.split(" ");
        if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
            throw new CustomError_1.BadRequestError("Invalid authorization header format");
        }
        const token = tokenParts[1];
        if (!token) {
            throw new CustomError_1.BadRequestError("Token is missing");
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, password_token_1.TOKEN_PASSWORD);
        if (!decodedToken) {
            throw new CustomError_1.BadRequestError("Token has expired");
        }
        const user = await User_1.User.findOne({ where: { id: decodedToken.userId } });
        if (!user) {
            throw new CustomError_1.NotFoundError("User not found");
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Authentication error:", error.message);
        throw new CustomError_1.BadRequestError("Error Authentication Token", {
            originalError: error.message,
        });
    }
};
exports.auth = auth;
//# sourceMappingURL=userAuthorization.js.map