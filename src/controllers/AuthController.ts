import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import logger from "../commons/logger";
import { buildResponse, genRandomString, isNullOrEmptyString } from "../commons/Utils";
import { SECRET } from "../config/AuthConfig";
import { ErrorCode, HandleErrorException, SUCCESS } from "../config/ErrorCodeConfig";

import { Constants } from '../commons/Constants';
import { DI } from '../configdb/database.config';
import { Item } from '../entities/ItemEntity';
import { SCNFTMetadata } from '../entities/NFTMetadataMapping';
import { User } from '../entities/User';
import AuthMiddleWare from "../middleware/AuthMiddleWare";
import { getErc20OfAssetByUser, getWalletByUser } from "../service/GameAssetsService";
import { getAllBoxInfo, getAllNFTInfo, getBoxContractByChainId, getNFTContractByChainId } from '../service/ServiceCommon';
import BaseController, { BaseInput } from "./BaseController";
import { constants } from "ethers";

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
        this.router.get("/getTokenAssets/:chainId/:walletAddress", this.getTokenAssets);
        this.router.get("/getWalletMapping/:chainId/:userEmail", this.getWalletMappingInfo);
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

    getTokenAssets = async (req: any, res: any) => {
        try {
            let walletAddress = req.params.walletAddress;
            let chainId = req.params.chainId;
            let aplus = await getErc20OfAssetByUser(walletAddress, chainId);
            buildResponse("", res, SUCCESS, aplus);
        } catch (err) {
            logger.error(err);
            HandleErrorException({ refNo: null }, res, err + "");
        }
    }

    getWalletMappingInfo = async (req: any, res: any) => {
        try {
            let email = req.params.userEmail;
            let chainId = req.params.chainId;
            let walletAddress = await getWalletByUser(email, chainId);
            logger.info("return walletAddr " + walletAddress);
            let aplus = 0;
            let items = new Array<Item>();
            if (walletAddress != constants.AddressZero) {
                aplus = await getErc20OfAssetByUser(walletAddress, chainId);
            }
            buildResponse("", res, SUCCESS, { walletAddress, aplus, items });
        } catch (err) {
            logger.error(err);
            HandleErrorException({ refNo: null }, res, err + "");
        }
    }
}
