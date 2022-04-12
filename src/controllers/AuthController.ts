import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { PublicKey } from "@solana/web3.js";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { closeDb, collection } from "../commons/mongo";
import { buildResponse, genRandomString, isNullOrEmptyString } from "../commons/Utils";
import { SECRET } from "../config/AuthConfig";
import { EMAIL_EXIST, MESSAGE_INVALID, PARAMS_INVALID, SUCCESS, USERNAME_EXIST, WALLET_NOT_EXIST } from "../config/ErrorCodeConfig";
import AuthMiddleWare from "../middleware/AuthMiddleWare";
import { User } from "../models/User";
import { isValidMessage } from "../outer-space/SolUtils";
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
    userName: string,
}

export default class AuthController extends BaseController {
    constructor() {
        super();
        this.initializeRoutes();
    }

    initializeRoutes = () => {
        this.router.post('/getToken', this.getToken);
        this.router.post('/getNonce', this.getNonce);
        this.router.post('/updateUser', this.updateUser);
    }

    getToken = async (req: Request, res: Response) => {
        let input: GeTokenInput = req.body;
        if (isNullOrEmptyString(input.sig) || isNullOrEmptyString(input.walletAddress)) {
            buildResponse(input.refNo, res, PARAMS_INVALID, {});
            return;
        }

        let userCollection = await collection('user');
        let user: User = await userCollection.findOne<User>({
            walletAddress: input.walletAddress
        });
        closeDb();
        if (!user || isNullOrEmptyString(user.nonce)) {
            buildResponse(input.refNo, res, PARAMS_INVALID, {});
            return;
        }
        let isValidMsg = isValidMessage(user.nonce, input.walletAddress, input.sig);
        if (isValidMsg == false) {
            buildResponse(input.refNo, res, MESSAGE_INVALID, {});
            return;
        }

        let token = sign({ walletAddress: input.walletAddress }, SECRET, {
            expiresIn: '365d' // 60 mins
        });

        buildResponse(input.refNo, res, SUCCESS, { token: token, user: { userName: user.userName } });
    }

    getNonce = async (req: Request, res: Response) => {
        let getNonceInput: GeNonceInput = req.body;
        if (isNullOrEmptyString(getNonceInput.walletAddress)) {
            buildResponse(getNonceInput.refNo, res, PARAMS_INVALID, {});
            return;
        }
        let nonce = genRandomString(6).toUpperCase();
        let userCollection = await collection('user');
        let user: User = await userCollection.findOne<User>({
            walletAddress: getNonceInput.walletAddress
        });
        if (user) {
            let newUser = { $set: { nonce: nonce } }
            await userCollection.updateOne({ walletAddress: getNonceInput.walletAddress }, newUser);
        } else {
            user = {
                nonce: nonce,
                walletAddress: getNonceInput.walletAddress,
                userName: '',
                password: ''
            }
            user.walletAddress = getNonceInput.walletAddress;
            await userCollection.insertOne(user);
        }

        closeDb();

        buildResponse(getNonceInput.refNo, res, SUCCESS, { nonce })
    }

    updateUser = async (req: Request, res: Response) => {
        let input: UpdateUserInput = req.body;
        if (isNullOrEmptyString(input.walletAddress)
            || isNullOrEmptyString(input.email)
            || isNullOrEmptyString(input.userName)
        ) {
            buildResponse(input.refNo, res, PARAMS_INVALID, {});
            return;
        }
        let userCollection = await collection('user');

        let emailExist = await userCollection.findOne<User>({
            email: input.email
        });
        if (emailExist) {
            buildResponse(input.refNo, res, EMAIL_EXIST, {});
            return;
        }
        let userExist = await userCollection.findOne<User>({
            userName: input.userName
        });
        if (userExist) {
            buildResponse(input.refNo, res, USERNAME_EXIST, {});
            return;
        }
        let user: User = await userCollection.findOne<User>({
            walletAddress: input.walletAddress
        })

        if (!user) {
            buildResponse(input.refNo, res, WALLET_NOT_EXIST, {});
            return;
        }
        let salt = await bcrypt.genSalt(10);
        let passwordPlainText = genRandomString(9);
        let hashPassword = await bcrypt.hash(passwordPlainText, salt);
        let newUser = {
            $set: {
                userName: input.userName,
                email: input.email,
                password: hashPassword
            }
        }
        await userCollection.updateOne({ walletAddress: input.walletAddress }, newUser);
        closeDb();
        buildResponse(input.refNo, res, SUCCESS, {
            user: {
                userName: input.userName,
                email: input.email,
                walletAddress: input.walletAddress,
                password: passwordPlainText
            }
        })
    }
}

