"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../controllers/User");
const User_2 = require("../controllers/User");
const userAuthorization_1 = require("../middlewares/userAuthorization");
const router = express_1.default.Router();
router.post('/login/lifestyle', User_1.loginLifeStyleController);
router.post('/login/wallet', User_1.mnemonicLoginController);
router.post('/register', User_1.registerController);
router.post('/transfer/wallet/:id', userAuthorization_1.auth, User_2.transferByAddressController);
router.post('/transfer/id/:id', userAuthorization_1.auth, User_2.transferByIdController);
router.post('/minting', userAuthorization_1.auth, User_1.mintingController);
router.get('/stepToToken', userAuthorization_1.auth, User_1.stepToTokenController);
router.get('/staking', userAuthorization_1.auth, User_1.stakingController);
router.get('/:id', userAuthorization_1.auth, User_2.findAllUserController);
module.exports = router;
//# sourceMappingURL=User.js.map