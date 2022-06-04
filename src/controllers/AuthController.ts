import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { PublicKey } from "@solana/web3.js";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { closeDb, collection } from "../commons/mongo";
import { buildResponse, genRandomString, isNullOrEmptyString } from "../commons/Utils";
import { SECRET } from "../config/AuthConfig";
import { ErrorCode, HandleErrorException, SUCCESS } from "../config/ErrorCodeConfig";

import AuthMiddleWare from "../middleware/AuthMiddleWare";
import { User } from "../models/User";
import { isValidMessage } from "../ameta/SolUtils";
import BaseController, { BaseInput } from "./BaseController";
var bcrypt = require('bcryptjs');

interface GeTokenInput extends BaseInput {
    walletAddress: string,
    sig: string,
}
interface GeNonceInput extends BaseInput {
    walletAddress: string
}
interface UpdateUserInput extends BaseInput {
    walletAddress: string,
    email: string,
    username: string,
}

export default class AuthController extends BaseController {
    constructor() {
        super();
        this.initializeRoutes();
    }

    initializeRoutes = () => {
        this.router.post('/getToken', this.getToken);
        this.router.post('/getNonce', this.getNonce);
        this.router.post('/updateUser', [AuthMiddleWare.verifyToken], this.updateUser);
    }

    getToken = async (req: Request, res: Response) => {
        let input: GeTokenInput = req.body;
        try {
            console.log(input);
            if (isNullOrEmptyString(input.sig) || isNullOrEmptyString(input.walletAddress)) {
                throw new Error(ErrorCode.ParamsIsInvalid);

            }

            let userCollection = await collection('user');
            let user: User = await userCollection.findOne<User>({
                walletAddress: input.walletAddress
            });
            if (!user || isNullOrEmptyString(user.nonce)) {
                throw new Error(ErrorCode.ParamsIsInvalid);

            }
            // let isValidMsg = isValidMessage(user.nonce, input.walletAddress, input.sig);
            // if (isValidMsg == false) {
            //     throw new Error(ErrorCode.MessageIsInvalid);
            // }

            let token = sign({ walletAddress: input.walletAddress }, SECRET, {
                expiresIn: '365d' // 60 mins
            });
            buildResponse(input.refNo, res, SUCCESS, { token: token, user: { username: user.username } });
        } catch (err) {
            console.log(err);
            HandleErrorException(input, res, err.message);
        } finally {
            closeDb();
        }
    }

    getNonce = async (req: Request, res: Response) => {
        let getNonceInput: GeNonceInput = req.body;
        try {
            if (isNullOrEmptyString(getNonceInput.walletAddress)) {
                throw new Error(ErrorCode.ParamsIsInvalid);
            }
            let nonce = genRandomString(6).toUpperCase();
            let userCollection = await collection('user');
            let user: User = await userCollection.findOne<User>({
                walletAddress: getNonceInput.walletAddress
            });
            console.log('user', user);
            if (user) {
                let newUser = { $set: { nonce: nonce } }
                await userCollection.updateOne({ walletAddress: getNonceInput.walletAddress }, newUser);
            } else {
                user = {
                    nonce: nonce,
                    walletAddress: getNonceInput.walletAddress,
                    username: '',
                    password: ''
                }
                user.walletAddress = getNonceInput.walletAddress;
                let newUser = await userCollection.insertOne(user);
                console.log('new user', newUser);
            }

            buildResponse(getNonceInput.refNo, res, SUCCESS, { nonce })
        } catch (err) {
            HandleErrorException(getNonceInput, res, err.message);
        } finally {
            console.log('Finnally');
            closeDb();
        }
    }

    updateUser = async (req: Request, res: Response) => {
        let input: UpdateUserInput = req.body;
        try {
            if (isNullOrEmptyString(input.walletAddress)
                || isNullOrEmptyString(input.email)
                || isNullOrEmptyString(input.username)
            ) {
                throw new Error(ErrorCode.ParamsIsInvalid);

            }
            let userCollection = await collection('user');

            let emailExist = await userCollection.findOne<User>({
                email: input.email
            });
            if (emailExist) {
                throw new Error(ErrorCode.EmailIsExist);

            }
            let userExist = await userCollection.findOne<User>({
                username: input.username
            });
            if (userExist) {
                throw new Error(ErrorCode.UserNameIsExist);

            }
            let user: User = await userCollection.findOne<User>({
                walletAddress: input.walletAddress
            })

            if (!user) {
                throw new Error(ErrorCode.WalletAddressIsNotExist);
            }
            let salt = await bcrypt.genSalt(10);
            let passwordPlainText = genRandomString(9);
            let hashPassword = await bcrypt.hash(passwordPlainText, salt);
            let newUser = {
                $set: {
                    username: input.username,
                    email: input.email,
                    password: hashPassword
                }
            }
            await userCollection.updateOne({ walletAddress: input.walletAddress }, newUser);

            buildResponse(input.refNo, res, SUCCESS, {
                user: {
                    username: input.username,
                    email: input.email,
                    walletAddress: input.walletAddress,
                    password: passwordPlainText
                }
            })
        } catch (err) {
            HandleErrorException(input, res, err.message);
        } finally {
            closeDb();
        }
    }
}

