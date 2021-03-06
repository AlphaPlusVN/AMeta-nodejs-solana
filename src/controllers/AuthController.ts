import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { buildResponse, genRandomString, isNullOrEmptyString } from "../commons/Utils";
import { SECRET } from "../config/AuthConfig";
import { ErrorCode, HandleErrorException, SUCCESS } from "../config/ErrorCodeConfig";

import AuthMiddleWare from "../middleware/AuthMiddleWare";
import { createTokenAccount, AMETA_TOKEN } from '../ameta/SolUtils';
import BaseController, { BaseInput } from "./BaseController";
import { DI } from '../configdb/database.config';
import { User } from '../entities/User';
import { WalletCache } from '../entities/WalletCache';
import { Logger } from 'mongodb';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { TokenCode } from '../commons/Constants';
import { connection } from '../ameta/SolAMeta';
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
        this.router.post('/createUserWallet', this.createUserWallet);
        this.router.get('/getAmetaBalance', this.getAmetaBalance);
    }

    getToken = async (req: Request, res: Response) => {
        let input: GeTokenInput = req.body;
        try {
            console.log(input);
            if (isNullOrEmptyString(input.sig) || isNullOrEmptyString(input.walletAddress)) {
                throw new Error(ErrorCode.ParamsIsInvalid);

            }
            const userRepo = DI.em.fork().getRepository(User);
            let user: User = await userRepo.findOne({
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
            HandleErrorException(input, res, err + "");
        }
    }

    getNonce = async (req: Request, res: Response) => {
        let getNonceInput: GeNonceInput = req.body;
        try {
            if (isNullOrEmptyString(getNonceInput.walletAddress)) {
                throw new Error(ErrorCode.ParamsIsInvalid);
            }
            let nonce = genRandomString(6).toUpperCase();
            const userRepo = DI.em.fork().getRepository(User);
            let user: User = await userRepo.findOne({
                walletAddress: getNonceInput.walletAddress
            });
            console.log('user', user);
            if (user) {
                user.nonce = nonce;
                await userRepo.persistAndFlush(user);
            } else {
                user = userRepo.create({
                    nonce: nonce,
                    walletAddress: getNonceInput.walletAddress,
                    username: '',
                    password: ''
                });
                await userRepo.persistAndFlush(user);
                console.log('new user', user);
            }

            buildResponse(getNonceInput.refNo, res, SUCCESS, { nonce })
        } catch (err) {
            HandleErrorException(getNonceInput, res, err + "");
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
            let userRepo = DI.em.fork().getRepository(User);

            let emailExist = await userRepo.findOne({
                email: input.email
            });
            if (emailExist) {
                throw new Error(ErrorCode.EmailIsExist);

            }
            let userExist = await userRepo.findOne({
                username: input.username
            });
            if (userExist) {
                throw new Error(ErrorCode.UserNameIsExist);

            }
            let user = await userRepo.findOne({
                walletAddress: input.walletAddress
            })

            if (!user) {
                throw new Error(ErrorCode.WalletAddressIsNotExist);
            }
            let salt = await bcrypt.genSalt(10);
            let passwordPlainText = genRandomString(9);
            let hashPassword = await bcrypt.hash(passwordPlainText, salt);
            let newUser = userRepo.create({
                username: input.username,
                email: input.email,
                password: hashPassword
            });
            await userRepo.persistAndFlush(newUser);

            buildResponse(input.refNo, res, SUCCESS, {
                user: {
                    username: input.username,
                    email: input.email,
                    walletAddress: input.walletAddress
                }
            })
        } catch (err) {
            HandleErrorException(input, res, err + "");
        }
    }

    createUserWallet = async (req: Request, res: Response) => {
        let input = req.body;
        try {
            //save to db
            let userRepo = DI.em.fork().getRepository(User);
            let walletRepo = DI.em.fork().getRepository(WalletCache);
            let user = await userRepo.findOne({ username: input.username });
            if (user && isNullOrEmptyString(user.walletAddress)) {
                console.log("Create wallet for " + req.body.username);
                //generate wallet
                let keypair = Keypair.generate();
                const privateKey = bs58.encode(keypair.secretKey);
                //create token account
                await createTokenAccount(keypair, AMETA_TOKEN, TokenCode.AMETA);

                user.walletAddress = keypair.publicKey.toBase58();
                await userRepo.persistAndFlush(user);
                let wallet = new WalletCache();
                wallet.walletAddress = keypair.publicKey.toBase58();
                wallet.secretKey = privateKey;
                await walletRepo.persistAndFlush(wallet);
            }
            buildResponse(input.refNo, res, SUCCESS, {
                user
            });
        } catch (err) {
            console.error(err);
            HandleErrorException(input, res, err + "");
        }
    };

    getAmetaBalance = async (req: Request, res: Response) => {
        console.log(req.query);
        let refNo = req.query.refNo;
        let walletAddress = req.query.walletAddress;
        console.log("check balance of :" + walletAddress);
        try {
            let tokenAcct = (await connection.getTokenAccountsByOwner(new PublicKey(walletAddress), { mint: AMETA_TOKEN })).value[0].pubkey;
            let balance = (await connection.getTokenAccountBalance(tokenAcct)).value.uiAmount;
            buildResponse(refNo + "", res, SUCCESS, {
                balance
            });
        } catch (err) {
            console.error(err);
            HandleErrorException(walletAddress, res, err + "");
        }
    }
}
