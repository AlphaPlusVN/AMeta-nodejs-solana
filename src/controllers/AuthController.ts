import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { PublicKey } from "@solana/web3.js";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { closeDb, collection } from "../commons/mongo";
import { buildResponse, genRandomString, isNullOrEmptyString } from "../commons/Utils";
import { SECRET } from "../config/AuthConfig";
import { MESSAGE_INVALID, PARAMS_INVALID, SUCCESS } from "../config/ErrorCodeConfig";
import { User } from "../models/User";
import { isValidMessage } from "../outer-space/SolUtils";
import BaseController, { BaseInput } from "./BaseController";


interface GeTokenInput extends BaseInput {
    walletAddress: string,
    sig: string,
}
interface GeNonceInput extends BaseInput {
    walletAddress: string
}

export default class AuthController extends BaseController {
    constructor() {
        super();
        this.initializeRoutes();
    }

    initializeRoutes = () => {
        this.router.post('/getToken', this.getToken)
        this.router.post('/getNonce', this.getNonce)
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

        if (!user || isNullOrEmptyString(user.nonce)) {
            buildResponse(input.refNo, res, PARAMS_INVALID, {});
            return;
        }
        let isValidMsg = isValidMessage(user.nonce, input.walletAddress, input.sig);
        if (isValidMsg == false) {
            buildResponse(input.refNo, res, MESSAGE_INVALID, {});
            return;
        }

        let token = sign({ userId: 'outerspace' }, SECRET, {
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
}

