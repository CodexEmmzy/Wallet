"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintingController = exports.stakingController = exports.stepToTokenController = exports.transferByIdController = exports.transferByAddressController = exports.findAllUserController = exports.registerController = exports.mnemonicLoginController = exports.loginLifeStyleController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../entities/User");
const password_token_1 = require("../tokens/password.token");
const constants_1 = require("../utils/constants");
const CustomError_1 = require("../errors/CustomError");
const ethers = require("ethers");
const loginLifeStyleController = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new CustomError_1.BadRequestError("Email and password are required");
    }
    try {
        const user = await User_1.User.findOne({ where: { email } });
        if (!user) {
            throw new CustomError_1.NotFoundError(`User not found`);
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new CustomError_1.BadRequestError("Invalid credentials");
        }
        const token = jsonwebtoken_1.default.sign({ email: user.email }, password_token_1.TOKEN_PASSWORD, {
            expiresIn: "15m",
        });
        res.status(201).json({
            message: "User logged in successfully to lifestyle",
            user,
            token,
        });
    }
    catch (error) {
        console.error("Error logging in:", error);
        throw new CustomError_1.BadRequestError("Error logging in", {
            originalError: error.message,
        });
    }
};
exports.loginLifeStyleController = loginLifeStyleController;
const mnemonicLoginController = async (req, res) => {
    const { email, mnemonic } = req.body;
    if (!email || !mnemonic) {
        throw new CustomError_1.BadRequestError("Email and Mnemonic are required");
    }
    try {
        const user = await User_1.User.findOne({ where: { email } });
        if (!user) {
            throw new CustomError_1.NotFoundError(`User not found`);
        }
        const isMnemonicValid = await bcrypt_1.default.compare(mnemonic, user.mnemonic);
        if (!isMnemonicValid) {
            throw new CustomError_1.BadRequestError("Invalid credentials");
        }
        const token = jsonwebtoken_1.default.sign({ email: user.email }, password_token_1.TOKEN_PASSWORD, {
            expiresIn: "15m",
        });
        res.json({
            message: "Login successful to wallet with Mnemonic",
            user,
            token,
        });
    }
    catch (error) {
        console.error("Error logging in:", error);
        throw new CustomError_1.BadRequestError("Error logging in", {
            originalError: error.message,
        });
    }
};
exports.mnemonicLoginController = mnemonicLoginController;
const registerController = async (req, res) => {
    const { name, email, password } = req.body;
    const wallet = ethers.Wallet.createRandom();
    const balance = 0;
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, constants_1.saltRound);
        let date = Date();
        let id = `${email}${date}${name}`;
        id = await bcrypt_1.default.hash(id, constants_1.saltRound);
        let hasedId = await bcrypt_1.default.hash(id, constants_1.saltRound);
        let hashedMnemonic = await bcrypt_1.default.hash(wallet.mnemonic.phrase, constants_1.saltRound);
        let address = wallet.address;
        let private_key = wallet.privateKey;
        await User_1.User.create({
            id: hasedId,
            name,
            email,
            password: hashedPassword,
            address,
            private_key,
            mnemonic: hashedMnemonic,
            amount: balance,
        }).save();
        let data = {
            id,
            name,
            email,
            address,
            private_key,
        };
        res.status(201).json({ message: "User created successfully", data });
    }
    catch (error) {
        console.error("Error registering user:", error);
        throw new CustomError_1.BadRequestError("Error creating user", {
            originalError: error.message,
        });
    }
};
exports.registerController = registerController;
const findAllUserController = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User_1.User.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new CustomError_1.NotFoundError(`User with ID ${userId} not found`);
        }
        res.status(200).json({ message: "User found successfully", user });
    }
    catch (error) {
        console.error("Error retrieving user:", error);
        throw new CustomError_1.InternalServerError("Internal server error");
    }
};
exports.findAllUserController = findAllUserController;
const transferByAddressController = async (req, res) => {
    const { recipientWallet, amount } = req.body;
    const userId = req.params.id;
    try {
        const sender = await User_1.User.findOne({ where: { id: userId } });
        if (!sender) {
            throw new CustomError_1.NotFoundError(`Sender not found`);
        }
        if (sender.amount < amount) {
            throw new CustomError_1.BadRequestError(`Sender not found`);
        }
        const recipient = await User_1.User.findOne(recipientWallet);
        if (!recipient) {
            throw new CustomError_1.NotFoundError(`Recipient not found`);
        }
        const provider = ethers.providers.JsonRpcProvider("your_provider_url");
        const senderWallet = ethers.Wallet(sender.private_key, provider);
        const tx = await senderWallet.sendTransaction({
            to: recipient.address,
            value: ethers.utils.parseEther(amount.toString()),
        });
        await tx.wait();
        const senderBalanceAfter = await provider.getBalance();
        sender.amount -= senderBalanceAfter;
        await sender.save();
        recipient.amount += amount;
        await recipient.save();
        const receipt = {
            sender: sender.address,
            recipient: recipient.address,
            amount: amount,
            senderBalance: sender.amount,
        };
        res.json({ message: "Transfer successful", receipt });
    }
    catch (error) {
        console.error("Error transferring funds:", error);
        throw new CustomError_1.BadRequestError("Error transferring funds", {
            originalError: error.message,
        });
    }
};
exports.transferByAddressController = transferByAddressController;
const transferByIdController = async (req, res) => {
    const { recipientId, amount } = req.body;
    const userId = req.params.id;
    try {
        const sender = await User_1.User.findOne({ where: { id: userId } });
        if (!sender) {
            throw new CustomError_1.NotFoundError("Sender not found");
        }
        if (sender.amount < amount) {
            throw new CustomError_1.BadRequestError("Insufficient funds");
        }
        const recipient = await User_1.User.findOne({
            where: { id: recipientId },
        });
        if (!recipient) {
            throw new CustomError_1.NotFoundError("Recipient not found");
        }
        const provider = new ethers.providers.JsonRpcProvider(sender.address);
        console.log("Proider ", provider);
        const senderWallet = ethers.Wallet(sender.private_key, provider);
        const tx = await senderWallet.sendTransaction({
            to: recipient.address,
            value: ethers.utils.parseEther(amount.toString()),
        });
        await tx.wait();
        const senderBalanceAfter = await provider.getBalance();
        sender.amount -= senderBalanceAfter;
        await sender.save();
        const receipt = {
            sender: sender.address,
            recipient: recipient.address,
            amount: amount,
            senderBalance: sender.amount,
        };
        res.json({ message: "Transfer successful", receipt });
    }
    catch (error) {
        console.error("Error transferring funds:", error);
        throw new CustomError_1.BadRequestError("Error transferring funds", {
            originalError: error.message,
        });
    }
};
exports.transferByIdController = transferByIdController;
const stepToTokenController = async (req, res) => {
    try {
        const user = req === null || req === void 0 ? void 0 : req.user;
        console.log("user", user);
        if (!user) {
            throw new CustomError_1.NotFoundError(`User with ID ${user.id} not found`);
        }
        const steps = user.steps;
        const tokenamount = Math.floor(steps / 5000);
        let token = user.tokens;
        token += tokenamount;
        await user.save();
        res.status(201).json({ message: "Steps successfully converted", token });
    }
    catch (error) {
        console.error("Error converting steps to tokens:", error);
        throw new CustomError_1.InternalServerError("Internal server error");
    }
};
exports.stepToTokenController = stepToTokenController;
const stakingController = async (req, res) => {
    const { amount, duration } = req.body;
    try {
        const user = req.user;
        if (!user) {
            throw new CustomError_1.NotFoundError(`User not found`);
        }
        let tokenBalance = user.amount;
        if (tokenBalance < amount) {
            throw new CustomError_1.BadRequestError(`Insufficient amount`);
        }
        if (![3, 6, 12].includes(duration)) {
            throw new CustomError_1.BadRequestError(`Invalid staking duration`);
        }
        tokenBalance -= amount;
        res.status(200).json({ message: "Tokens staked successfully" });
    }
    catch (error) {
        console.error("Error staking amount:", error);
        throw new CustomError_1.BadRequestError("Error staking amount", {
            originalError: error.message,
        });
    }
};
exports.stakingController = stakingController;
const mintingController = async (req, res) => {
    const { amount } = req.body;
    try {
        const user = req === null || req === void 0 ? void 0 : req.user;
        if (!user) {
            throw new CustomError_1.NotFoundError(`User not found`);
        }
        let tokenBalance = user.tokens;
        if (tokenBalance < amount) {
            throw new CustomError_1.BadRequestError(`Insufficient amount`);
        }
        user.tokens -= amount;
        res.status(200).json({ message: "Tokens minted successfully" });
    }
    catch (error) {
        console.error("Error minting tokens:", error);
        throw new CustomError_1.InternalServerError("Internal server error");
    }
};
exports.mintingController = mintingController;
//# sourceMappingURL=User.js.map