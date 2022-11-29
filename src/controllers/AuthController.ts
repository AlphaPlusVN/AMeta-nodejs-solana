import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import logger from "../commons/logger";
import { buildResponse, isNullOrEmptyString } from "../commons/Utils";
import { SECRET } from "../config/AuthConfig";
import { ErrorCode, HandleErrorException, SUCCESS } from "../config/ErrorCodeConfig";

import { constants } from "ethers";
import { RSAUtil } from '../commons/CryptoUtility';
import { DI } from '../configdb/database.config';
import { Item } from '../entities/ItemEntity';
import { SCNFTMetadata } from '../entities/NFTMetadataMapping';
import { User } from '../entities/User';
import { getErc20OfAssetByUser, getErc721OfAssetByUser, getWalletByUser, syncErc20Token } from "../service/GameAssetsService";
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
        this.router.post("/getWalletItemInfo", this.getWalletItemInfo)
        this.router.get("/getTokenAssets/:chainId/:walletAddress", this.getTokenAssets);
        this.router.get("/getWalletMapping/:chainId/:userEmail", this.getWalletMappingInfo);
        this.router.post("/forceSyncWalletData", this.forceSyncWalletData);
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
            logger.info("chaiID " + chainId + " addr " + nftContract.address + " NFTtokenID: " + JSON.stringify(nftTokenIds));
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
            let chainId = parseInt(req.params.chainId);
            let walletAddress = await getWalletByUser(email, chainId);
            logger.info("return walletAddr " + walletAddress);
            let aplus = 0;
            let items = new Array<Item>();
            if (walletAddress != constants.AddressZero) {
                aplus = await getErc20OfAssetByUser(walletAddress, chainId);
                items = await getErc721OfAssetByUser(walletAddress, chainId);
            }
            buildResponse("", res, SUCCESS, { walletAddress, aplus, items });
        } catch (err) {
            logger.error(err);
            HandleErrorException({ refNo: null }, res, err + "");
        }
    }
    
    forceSyncWalletData = async (req: any, res: any) => {
        try {
            let refNo = req.body.refNo;
            let walletAddress = req.body.walletAddress;
            let token = parseInt(req.body.token);
            let chainId = parseInt(req.body.chainId);
            let signature = req.body.signature;
            let signatureStr = "refNo:" + refNo + ";walletAddress:" + walletAddress + ";token:" + token + ";chainId:" + chainId;
            logger.info("signatureStr " + signatureStr);
            logger.info("verify " + RSAUtil.getInstance().verifiedMessage(signatureStr, signature));
            logger.info("signature " + signature);
            if (!RSAUtil.getInstance().verifiedMessage(signatureStr, signature)) {
                throw new Error(ErrorCode.SignatureInvalid);
            }
            await syncErc20Token(walletAddress, token, chainId);
            buildResponse(refNo, res, SUCCESS, { refNo, walletAddress, token, chainId, signature });
        } catch (err) {
            logger.error(err);
            HandleErrorException({ refNo: null }, res, err + "");
        }
    }
}
