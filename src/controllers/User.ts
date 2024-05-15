import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { TOKEN_PASSWORD } from "../tokens/password.token";
import { saltRound } from "../utils/constants";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../errors/CustomError";
const ethers: any = require("ethers");

export const loginLifeStyleController = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundError(`User not found`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestError("Invalid credentials");
    }

    const token = jwt.sign({ email: user.email }, TOKEN_PASSWORD, {
      expiresIn: "15m",
    });

    res.status(201).json({
      message: "User logged in successfully to lifestyle",
      user,
      token,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    throw new BadRequestError("Error logging in", {
      originalError: error.message,
    });
  }
};

export const mnemonicLoginController = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { email, mnemonic } = req.body;

  if (!email || !mnemonic) {
    throw new BadRequestError("Email and Mnemonic are required");
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundError(`User not found`);
    }

    const isMnemonicValid = await bcrypt.compare(mnemonic, user.mnemonic);

    if (!isMnemonicValid) {
      throw new BadRequestError("Invalid credentials");
    }

    const token = jwt.sign({ email: user.email }, TOKEN_PASSWORD, {
      expiresIn: "15m",
    });

    res.json({
      message: "Login successful to wallet with Mnemonic",
      user,
      token,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    throw new BadRequestError("Error logging in", {
      originalError: error.message,
    });
  }
};

export const registerController = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const wallet = ethers.Wallet.createRandom();

  const balance = 0;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRound);
    let date = Date();
    let id = `${email}${date}${name}`;
    id = await bcrypt.hash(id, saltRound);
    let hasedId = await bcrypt.hash(id, saltRound);
    let hashedMnemonic = await bcrypt.hash(wallet.mnemonic.phrase, saltRound);
    let address = wallet.address;
    let private_key = wallet.privateKey;

    await User.create({
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
  } catch (error) {
    console.error("Error registering user:", error);
    throw new BadRequestError("Error creating user", {
      originalError: error.message,
    });
  }
};

export const findAllUserController = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.params.id;

  try {
    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    res.status(200).json({ message: "User found successfully", user });
  } catch (error) {
    console.error("Error retrieving user:", error);
    throw new InternalServerError("Internal server error");
  }
};

export const transferByAddressController = async (
  req: Request,
  res: Response
) => {
  const { recipientWallet, amount } = req.body;
  const userId = req.params.id;

  try {
    const sender = await User.findOne({ where: { id: userId } });
    if (!sender) {
      throw new NotFoundError(`Sender not found`);
    }

    if (sender.amount < amount) {
      throw new BadRequestError(`Sender not found`);
    }

    const recipient = await User.findOne(recipientWallet);
    if (!recipient) {
      throw new NotFoundError(`Recipient not found`);
    }

    const provider = ethers.providers.JsonRpcProvider("your_provider_url");

    const senderWallet = ethers.Wallet(sender.private_key, provider);

    const tx = await senderWallet.sendTransaction({
      to: recipient.address,
      value: ethers.utils.parseEther(amount.toString()),
    });

    await tx.wait();

    const senderBalanceAfter = await provider.getBalance();

    // Update sender's balance
    sender.amount -= senderBalanceAfter;
    await sender.save();

    // Update recipient's balance
    recipient.amount += amount;
    await recipient.save();

    // Construct receipt
    const receipt = {
      sender: sender.address,
      recipient: recipient.address,
      amount: amount,
      senderBalance: sender.amount,
    };

    res.json({ message: "Transfer successful", receipt });
  } catch (error) {
    console.error("Error transferring funds:", error);
    throw new BadRequestError("Error transferring funds", {
      originalError: error.message,
    });
  }
};

export const transferByIdController = async (req: Request, res: Response) => {
  const { recipientId, amount } = req.body;
  const userId = req.params.id;

  try {
    // Check if user exists
    const sender = await User.findOne({ where: { id: userId } });
    if (!sender) {
      throw new NotFoundError("Sender not found");
    }

    // Check if sender has sufficient balance
    if (sender.amount < amount) {
      throw new BadRequestError("Insufficient funds");
    }

    const recipient = await User.findOne({
      where: { id: recipientId },
    });
    if (!recipient) {
      throw new NotFoundError("Recipient not found");
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

    // Update sender's balance
    sender.amount -= senderBalanceAfter;
    await sender.save();

    // Construct receipt
    const receipt = {
      sender: sender.address,
      recipient: recipient.address,
      amount: amount,
      senderBalance: sender.amount,
    };

    res.json({ message: "Transfer successful", receipt });
  } catch (error) {
    console.error("Error transferring funds:", error);
    throw new BadRequestError("Error transferring funds", {
      originalError: error.message,
    });
  }
};

export const stepToTokenController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const user: any = req?.user;
    console.log("user", user);

    if (!user) {
      throw new NotFoundError(`User with ID ${user.id} not found`);
    }
    const steps: number = user.steps;
    const tokenamount = Math.floor(steps / 5000);

    let token = user.tokens;
    token += tokenamount;
    await user.save();

    res.status(201).json({ message: "Steps successfully converted", token });
  } catch (error) {
    console.error("Error converting steps to tokens:", error);
    throw new InternalServerError("Internal server error");

  }
};

export const stakingController = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { amount, duration } = req.body;

  try {
    const user = req.user;

    if (!user) {
      throw new NotFoundError(`User not found`);
    }

    // Check if the user has enough money for staking
    let tokenBalance = user.amount;
    if (tokenBalance < amount) {
      throw new BadRequestError(`Insufficient amount`);
    }

    // Check if the duration is valid (3, 6, or 12 months)
    if (![3, 6, 12].includes(duration)) {
      throw new BadRequestError(`Invalid staking duration`);
    }

    // Connect to the Ethereum network
    // const provider = new ethers.providers.JsonRpcProvider();

    ///! Load the contract instance
    // const contract = new ethers.Contract(
    //   STAKING_CONTRACT_ADDRESS,
    //   ["function stake(uint256, uint256)"],
    //   provider
    // );

    ///! Call the stake function of the smart contract to stake tokens
    // const tx = await contract.stake(amount, duration);
    // await tx.wait();

    //! You may want to adjust this part based on your application's logic for updating the user's token balance
    tokenBalance -= amount; // Then i deducted the staked amounts from the user's balance

    res.status(200).json({ message: "Tokens staked successfully" });
  } catch (error) {
    console.error("Error staking amount:", error);
    throw new BadRequestError("Error staking amount", {
      originalError: error.message,
    });  }
};

export const mintingController = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { amount }: any = req.body;

  try {
    const user = req?.user;

    if (!user) {
      throw new NotFoundError(`User not found`);
    }

    // Check if the user has enough tokens for minting
    let tokenBalance = user.tokens;
    if (tokenBalance < amount) {
      throw new BadRequestError(`Insufficient amount`);
    }

    //This will help you connect to the Ethereum network
    // const provider = new ethers.providers.JsonRpcProvider();

    // Loading contract hear
    // const contract = new Contract(TOKEN_CONTRACT_ADDRESS, ["function mint(uint256)"], provider);

    // Call the mint function of the smart contract to mint tokens
    // const tx = await contract.mint(amount);
    // await tx.wait();

    user.tokens -= amount; // Assuming you deduct the minted tokens from the user's balance

    // Return success response
    res.status(200).json({ message: "Tokens minted successfully" });
  } catch (error) {
    console.error("Error minting tokens:", error);
    throw new InternalServerError("Internal server error");
  }
};
