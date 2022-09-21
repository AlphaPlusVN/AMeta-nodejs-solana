import { Request, Response } from 'express';
// import { burnItem, buyBoxNew, connection, mintNFTItem, openBox } from '../ameta/SolAMeta';
import { buildResponse } from "../commons/Utils";
import BaseController, { BaseInput } from "./BaseController";

import { ObjectId } from '@mikro-orm/mongodb';
import { mintBoxKar, mintKarNFTItem } from '../aplus_kar/NFTContractKar';
import { Constants } from '../commons/Constants';
import { KAR_NFT_ADDRESS } from '../commons/KardiaUtils';
import { ErrorCode, HandleErrorException, SUCCESS } from "../config/ErrorCodeConfig";
import { DI } from '../configdb/database.config';
import { BoxConfig } from '../entities/BoxConfig';
import { Item, ItemConfig } from '../entities/ItemEntity';
import { MktBoxesForSale } from "../entities/MktBoxForSale";
import { User } from '../entities/User';
import AuthMiddleWare from "../middleware/AuthMiddleWare";


interface BuyBoxInput extends BaseInput {
    sessionId: string;
    boxId: string
}

interface MintItemInput extends BaseInput {
    sessionId: string;
    itemId: string
}

interface OpenBoxInput extends BaseInput {
    boxAddress: string,
    transferSig: string,
}

class BuyBoxController extends BaseController {
    constructor() {
        super();
        this.initializeRoutes();
    }

    initializeRoutes = () => {
        this.router.get('/test', this.test);
        // this.router.post('/buyBox', [AuthMiddleWare.verifyToken], this.buyBox);
        // this.router.post('/buyBoxNew', this.buyBoxNew);
        // this.router.post('/buyBox', this.buyBox);
        this.router.post('/buyBox', this.buyBoxKar);
        this.router.post('/mintItem', this.mintItem);
        this.router.post('/boxesForSale', this.getBoxesForSale);
        // this.router.post('/openBox', [AuthMiddleWare.verifyToken], this.openBox);
        // this.router.post('/openBox', this.openBox);
        // this.router.post('/burnItem', this.burnItem);
    }

    test = async (req: Request, res: Response) => {
        buildResponse('input.refNo', res, SUCCESS, {});
    }

    getBoxesForSale = async (req: Request, res: Response) => {
        let input: BaseInput = req.body;
        let mktBoxForSalRepo = DI.em.fork().getRepository(BoxConfig);
        let boxesForSale: BoxConfig[] = await mktBoxForSalRepo.find({isNFT:Constants.STATUS_YES});
        if (!boxesForSale) boxesForSale = [];
        buildResponse(input.refNo, res, SUCCESS, boxesForSale);
    }

    // buyBox = async (req: Request, res: Response) => {
    //     let input: BuyBoxInput = req.body;
    //     try {
    //         const sessionId = input.sessionId;
    //         const userRepo = DI.em.fork().getRepository(User);
    //         let user = await userRepo.findOne({ activeSessionId: sessionId });
    //         if (!user) {
    //             throw "Session is invalid";
    //         }
    //         const boxConfigRepo = DI.em.fork().getRepository(BoxConfig);
    //         let box = await boxConfigRepo.findOne({ code: input.boxId, isNFT: Constants.STATUS_YES });
    //         if (!box) {
    //             throw new Error(ErrorCode.BoxIDIsInvalid);
    //         }
    //         let price = 0;
    //         for (let payment of box.payments) {
    //             //ameta method
    //             if (payment.method == 2) {
    //                 price = payment.price;
    //             }
    //         }
    //         if (price == 0) {
    //             throw new Error(ErrorCode.PaymentMethodNotSupported);
    //         }
    //         let nftAddress = await mintBox(user.walletAddress, box, price);
    //         if (isNullOrEmptyString(nftAddress)) {
    //             throw new Error(ErrorCode.TransactionFailed);
    //         } else {
    //             const itemConfigRepo = DI.em.fork().getRepository(ItemConfig);
    //             const itemRepo = DI.em.fork().getRepository(Item);
    //             let itemConfig = await itemConfigRepo.findOne({ itemType: box.itemType });
    //             let item = new Item();
    //             item.itemType = box.itemType;
    //             item.group = itemConfig.group;
    //             item.name = itemConfig.name;
    //             item.description = itemConfig.desc;
    //             item.nftAddress = nftAddress;
    //             item.isNFT = Constants.STATUS_YES;
    //             item.owner = user.id;
    //             await itemRepo.persistAndFlush(item);
    //             buildResponse(input.refNo, res, SUCCESS, { box: item });
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         HandleErrorException(input, res, err + "");
    //     }

    // }

    buyBoxKar = async (req: Request, res: Response) => {
        let input: BuyBoxInput = req.body;
        try {
            const sessionId = input.sessionId;
            const userRepo = DI.em.fork().getRepository(User);
            let user = await userRepo.findOne({ activeSessionId: sessionId });
            if (!user) {
                throw "Session is invalid";
            }
            const boxConfigRepo = DI.em.fork().getRepository(BoxConfig);
            let box = await boxConfigRepo.findOne({ code: input.boxId, isNFT: Constants.STATUS_YES });
            if (!box) {
                throw new Error(ErrorCode.BoxIDIsInvalid);
            }

            let price = 0;
            for (let payment of box.payments) {
                //ameta method
                if (payment.method == 2) {
                    price = payment.price;
                }
            }
            if (price == 0) {
                throw new Error(ErrorCode.PaymentMethodNotSupported);
            }
            let mintBoxSucess = await mintBoxKar(user.walletAddress, box, price);
            if (mintBoxSucess) {
                throw new Error(ErrorCode.TransactionFailed);
            } else {
                const itemConfigRepo = DI.em.fork().getRepository(ItemConfig);
                const itemRepo = DI.em.fork().getRepository(Item);
                let itemConfig = await itemConfigRepo.findOne({ itemType: box.itemType });
                let item = new Item();
                item.itemType = box.itemType;
                item.group = itemConfig.group;
                item.name = itemConfig.name;
                item.description = itemConfig.desc;
                item.isNFT = Constants.STATUS_YES;
                item.owner = user.id;
                item.nftAddress = KAR_NFT_ADDRESS;
                await itemRepo.persistAndFlush(item);
                buildResponse(input.refNo, res, SUCCESS, { box: item });
            }
        } catch (err) {
            console.error(err);
            HandleErrorException(input, res, err + "");
        }
    }

    // openBox = async (req: Request, res: Response) => {
    //     let input: OpenBoxInput = req.body;
    //     try {
    //         //@ts-ignore
    //         // const walletAddress = req.walletAddress;
    //         const walletAddress = req.body.walletAddress;
    //         if (isNullOrEmptyString(input.boxAddress)
    //             || isNullOrEmptyString(input.transferSig)
    //         ) {
    //             throw new Error(ErrorCode.ParamsIsInvalid);
    //         }
    //         await TransactionHelper.validateTransferTokenSig(input.transferSig, walletAddress, 1, input.boxAddress, 0);

    //         const sig = await openBox(walletAddress, input.boxAddress);
    //         console.log("getTransaction ", await connection.getTransaction(sig));
    //         await TransactionHelper.markDoneTransferSig(input.transferSig);
    //         buildResponse(input.refNo, res, SUCCESS, {})
    //     } catch (err) {
    //         HandleErrorException(input, res, err + "");
    //     }
    // }
    // buyBoxNew = async (req: Request, res: Response) => {
    //     let input: BuyBoxInput = req.body;
    //     let sessionId: string = input.sessionId;
    //     try {
    //         const userRepo = DI.em.fork().getRepository(User);
    //         let user = await userRepo.findOne({ activeSessionId: sessionId });
    //         if (!user) {
    //             throw new Error(ErrorCode.AuthFailed);
    //         }
    //         buyBoxNew(user);
    //     } catch (err) {
    //         console.log(err);
    //         HandleErrorException(input, res, err + "");
    //     }
    // }

    mintItem = async (req: Request, res: Response) => {
        let input: MintItemInput = req.body;
        let sessionId: string = input.sessionId;
        try {
            const userRepo = DI.em.fork().getRepository(User);
            let user = await userRepo.findOne({ activeSessionId: sessionId });
            if (!user) {
                throw new Error(ErrorCode.AuthFailed);
            }
            const itemRepo = DI.em.fork().getRepository(Item);
            let item = await itemRepo.findOne({ _id: new ObjectId(input.itemId) });
            if (!item || item.owner != user.id) {
                throw new Error(ErrorCode.ParamsIsInvalid);
            }
            let mintSuccess = await mintKarNFTItem(user.walletAddress, item);
            if (mintSuccess) {
                item.isLocked = Constants.STATUS_NO;
                item.nftAddress = KAR_NFT_ADDRESS;
                await itemRepo.persistAndFlush(item);
            } else {
                throw new Error(ErrorCode.TransactionFailed);
            }
            buildResponse(input.refNo, res, SUCCESS, {})
        } catch (err) {
            console.log(err);
            HandleErrorException(input, res, err + "");
        }
    }

    // burnItem = async (req: Request, res: Response) => {
    //     let input: MintItemInput = req.body;
    //     let sessionId: string = input.sessionId;
    //     try {
    //         const userRepo = DI.em.fork().getRepository(User);
    //         let user = await userRepo.findOne({ activeSessionId: sessionId });
    //         if (!user) {
    //             throw new Error(ErrorCode.AuthFailed);
    //         }
    //         const itemRepo = DI.em.fork().getRepository(Item);
    //         let item = await itemRepo.findOne({ _id: new ObjectId(input.itemId) });
    //         if (!item || item.owner != user.id) {
    //             throw new Error(ErrorCode.ParamsIsInvalid);
    //         }
    //         let burnHash = await burnItem(user.walletAddress, item);
    //         if (isNullOrEmptyString(burnHash)) {
    //             throw new Error(ErrorCode.TransactionFailed);
    //         }
    //         buildResponse(input.refNo, res, SUCCESS, { burnHash })
    //     } catch (err) {
    //         console.log(err);
    //         HandleErrorException(input, res, err + "");
    //     }
    // }
}

export default BuyBoxController

