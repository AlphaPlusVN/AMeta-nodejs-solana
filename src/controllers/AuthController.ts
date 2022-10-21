import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import logger from "../commons/logger";
import { buildResponse, genRandomString, isNullOrEmptyString } from "../commons/Utils";
import { SECRET } from "../config/AuthConfig";
import { ErrorCode, HandleErrorException, SUCCESS } from "../config/ErrorCodeConfig";

// import { connection, systemTransfer } from '../ameta/SolAMeta';
// import { AMETA_TOKEN, createTokenAccount } from '../ameta/SolUtils';
import { DI } from '../configdb/database.config';
import { SCNFTMetadata } from '../entities/NFTMetadataMapping';
import { User } from '../entities/User';
import AuthMiddleWare from "../middleware/AuthMiddleWare";
import { getAllBoxInfo, getAllNFTInfo, getBoxContractByChainId, getNFTContractByChainId } from '../service/ServiceCommon';
import BaseController, { BaseInput } from "./BaseController";

const bcrypt = require('bcryptjs');

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
        this.router.post('/updateUser', [AuthMiddleWare.verifyToken], this.updateUser);

        this.router.post("/getWalletItemInfo", this.getWalletItemInfo)
    }

    getWalletItemInfo = async (req: Request, res: Response) => {
        try {
            const refNo = req.body.refNo;
            const walletAddress = req.body.walletAddress;
            const chainId = parseInt(req.body.chainId);
            let boxTokenIds = await getAllBoxInfo(walletAddress, chainId);
            let boxContract = getBoxContractByChainId(chainId);
            let nftTokenIds = await getAllNFTInfo(walletAddress, chainId);
            let nftContract = getNFTContractByChainId(chainId);
            const metadataRepo = DI.em.fork().getRepository(SCNFTMetadata);
            logger.info("chaiID " + chainId + " addr " + boxContract.address + " BoxtokenID: " + JSON.stringify(boxTokenIds));
            logger.info("chaiID " + chainId + " addr " + boxContract.address + " NFTtokenID: " + JSON.stringify(nftTokenIds));
            let boxMetadata = await metadataRepo.find({ tokenId: { $in: boxTokenIds }, contractAddress: boxContract.address.toLowerCase() });
            let nftMetaData = await metadataRepo.find({ tokenId: { $in: nftTokenIds }, contractAddress: nftContract.address.toLowerCase() });
            let data = { boxs: boxMetadata, items: nftMetaData };
            buildResponse(refNo, res, SUCCESS, data);
        } catch (err) {
            logger.info(err);
            HandleErrorException(req.body, res, err + "");
        }
        // let 
    }
    getToken = async (req: Request, res: Response) => {
        let input: GeTokenInput = req.body;
        try {
            logger.info(input);
            if (isNullOrEmptyString(input.sig) || isNullOrEmptyString(input.walletAddress)) {
                throw new Error(ErrorCode.ParamsIsInvalid);

            }
            const userRepo = DI.em.fork().getRepository(User);
            let user: User = await userRepo.findOne({
                walletAddress: input.walletAddress
            });
            // if (!user || isNullOrEmptyString(user.nonce)) {
            //     throw new Error(ErrorCode.ParamsIsInvalid);
            // }

            let token = sign({ walletAddress: input.walletAddress }, SECRET, {
                expiresIn: '365d' // 60 mins
            });
            buildResponse(input.refNo, res, SUCCESS, { token: token, user: { username: user.username } });
        } catch (err) {
            logger.info(err);
            HandleErrorException(input, res, err + "");
        }
    }

    // getNonce = async (req: Request, res: Response) => {
    //     let getNonceInput: GeNonceInput = req.body;
    //     try {
    //         if (isNullOrEmptyString(getNonceInput.walletAddress)) {
    //             throw new Error(ErrorCode.ParamsIsInvalid);
    //         }
    //         let nonce = genRandomString(6).toUpperCase();
    //         const userRepo = DI.em.fork().getRepository(User);
    //         let user: User = await userRepo.findOne({
    //             walletAddress: getNonceInput.walletAddress
    //         });
    //         logger.info('user', user);
    //         if (user) {
    //             user.nonce = nonce;
    //             await userRepo.persistAndFlush(user);
    //         } else {
    //             user = userRepo.create({
    //                 nonce: nonce,
    //                 walletAddress: getNonceInput.walletAddress,
    //                 username: '',
    //                 password: ''
    //             });
    //             await userRepo.persistAndFlush(user);
    //             logger.info('new user', user);
    //         }

    //         buildResponse(getNonceInput.refNo, res, SUCCESS, { nonce })
    //     } catch (err) {
    //         HandleErrorException(getNonceInput, res, err + "");
    //     }
    // }

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

    // createUserWallet = async (req: Request, res: Response) => {
    //     let input = req.body;
    //     try {
    //         //save to db
    //         let userRepo = DI.em.fork().getRepository(User);
    //         let walletRepo = DI.em.fork().getRepository(WalletCache);
    //         let user = await userRepo.findOne({ username: input.username });
    //         if (user && isNullOrEmptyString(user.walletAddress)) {
    //             logger.info("Create wallet for " + req.body.username);
    //             //generate wallet
    //             let keypair = Keypair.generate();
    //             const privateKey = bs58.encode(keypair.secretKey);
    //             //create token account
    //             await createTokenAccount(keypair, AMETA_TOKEN, TokenCode.AMETA);

    //             user.walletAddress = keypair.publicKey.toBase58();
    //             await userRepo.persistAndFlush(user);
    //             let wallet = new WalletCache();
    //             wallet.walletAddress = keypair.publicKey.toBase58();
    //             wallet.secretKey = privateKey;
    //             await walletRepo.persistAndFlush(wallet);
    //         }
    //         buildResponse(input.refNo, res, SUCCESS, {
    //             user
    //         });
    //     } catch (err) {
    //         console.error(err);
    //         HandleErrorException(input, res, err + "");
    //     }
    // };

    // createKarWallet = async (req: any, res: any) => {
    //     let input = req.body;
    //     try {
    //         //save to db
    //         let userRepo = DI.em.fork().getRepository(User);
    //         let walletRepo = DI.em.fork().getRepository(WalletCache);
    //         let user = await userRepo.findOne({ username: input.username });
    //         if (user && isNullOrEmptyString(user.walletAddress)) {
    //             logger.info("Create wallet for " + req.body.username);
    //             //generate wallet
    //             let walletAcct = null;
    //             if (user.chainCode == ChainCode.KARDIACHAIN) {
    //                 walletAcct = web3Kar.eth.accounts.create();
    //             } else {
    //                 walletAcct = web3OKRC.eth.accounts.create();
    //             }
    //             user.walletAddress = walletAcct.address;
    //             await userRepo.persistAndFlush(user);
    //             let wallet = new WalletCache();
    //             wallet.walletAddress = walletAcct.address;
    //             wallet.secretKey = walletAcct.privateKey;
    //             await walletRepo.persistAndFlush(wallet);
    //         }
    //         buildResponse(input.refNo, res, SUCCESS, {
    //             user
    //         });
    //     } catch (err) {
    //         console.error(err);
    //         HandleErrorException(input, res, err + "");
    //     }
    // };

    // getAmetaBalance = async (req: Request, res: Response) => {
    //     logger.info(req.query);
    //     let refNo = req.query.refNo;
    //     let walletAddress = req.query.walletAddress;
    //     logger.info("check balance of :" + walletAddress);
    //     try {
    //         let tokenAcct = (await connection.getTokenAccountsByOwner(new PublicKey(walletAddress), { mint: AMETA_TOKEN })).value[0].pubkey;
    //         let balance = (await connection.getTokenAccountBalance(tokenAcct)).value.uiAmount;
    //         buildResponse(refNo + "", res, SUCCESS, {
    //             balance
    //         });
    //     } catch (err) {
    //         console.error(err);
    //         HandleErrorException(walletAddress, res, err + "");
    //     }
    // }

    // getKarAmetaBalance = async (req: any, res: any) => {
    //     logger.info(req.query);
    //     let refNo = req.query.refNo;
    //     let walletAddress: string = req.query.walletAddress;
    //     logger.info("check balance of :" + walletAddress);
    //     try {
    //         const balance = await getAPlusBalance(walletAddress);
    //         buildResponse(refNo + "", res, SUCCESS, {
    //             balance
    //         });
    //     } catch (err) {
    //         console.error(err);
    //         HandleErrorException(walletAddress, res, err + "");
    //     }
    // }

    // systemTransfer = async (req: Request, res: Response) => {
    //     let sessionId = req.body.sessionId;
    //     let amount = req.body.amount;
    //     let refNo = req.query.refNo;
    //     const userRepo = DI.em.fork().getRepository(User);
    //     let user = await userRepo.findOne({ activeSessionId: sessionId });
    //     try {
    //         if (!user) {
    //             throw new Error("Session expire");
    //         }
    //         let hash = await systemTransfer(user.walletAddress, amount);
    //         buildResponse(refNo + "", res, SUCCESS, {
    //             hash: hash
    //         })
    //     } catch (err) {
    //         console.error(err);
    //         HandleErrorException(req.body, res, err + "");
    //     }
    // }
    // systemTransferKar = async (req: Request, res: Response) => {
    //     let sessionId = req.body.sessionId;
    //     let amount = req.body.amount;
    //     let refNo = req.query.refNo;
    //     const userRepo = DI.em.fork().getRepository(User);
    //     let user = await userRepo.findOne({ activeSessionId: sessionId });
    //     try {
    //         if (!user) {
    //             throw new Error("Session expire");
    //         }
    //         let result = await systemTransferAplusKar(user.walletAddress, amount);
    //         buildResponse(refNo + "", res, SUCCESS, {
    //             status: result
    //         })
    //     } catch (err) {
    //         console.error(err);
    //         HandleErrorException(req.body, res, err + "");
    //     }
    // }
}
