import BaseController, { BaseInput } from "./BaseController";
import { Request, Response } from 'express';
import { buyBox, buyBoxNew, connection, openBox } from "../ameta/SolAMeta";
import { PublicKey } from "@solana/web3.js";
import { buildResponse, isNullOrEmptyString } from "../commons/Utils";

import AuthMiddleWare from "../middleware/AuthMiddleWare";
import TransactionHelper from "../commons/TransactionHelper";
import { ErrorCode, HandleErrorException, SUCCESS } from "../config/ErrorCodeConfig";
import { MktBoxesForSale } from "../entities/MktBoxForSale";
import { DI } from '../configdb/database.config';
import { User } from '../entities/User';
import { BoxConfig } from '../entities/BoxConfig';
import { Constants } from '../commons/Constants';


interface BuyBoxInput extends BaseInput {
    sessionId: string;
    boxId: string
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
        this.router.post('/buyBoxNew', this.buyBoxNew);
        this.router.post('/buyBox', this.buyBox);
        this.router.post('/boxesForSale', [AuthMiddleWare.verifyToken], this.getBoxesForSale);
        // this.router.post('/openBox', [AuthMiddleWare.verifyToken], this.openBox);
        this.router.post('/openBox', this.openBox);
    }

    test = async (req: Request, res: Response) => {
        buildResponse('input.refNo', res, SUCCESS, {});
    }

    getBoxesForSale = async (req: Request, res: Response) => {
        let input: BaseInput = req.body;
        let mktBoxForSalRepo = DI.em.fork().getRepository(MktBoxesForSale);
        let boxesForSale: MktBoxesForSale[] = await mktBoxForSalRepo.findAll();
        if (!boxesForSale) boxesForSale = [];
        buildResponse(input.refNo, res, SUCCESS, boxesForSale);
    }

    buyBox = async (req: Request, res: Response) => {
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
            buyBox(user.walletAddress,box, price);
            buildResponse(input.refNo, res, SUCCESS, {})

        } catch (err) {
            console.error(err);
            HandleErrorException(input, res, err + "");
        }

    }

    openBox = async (req: Request, res: Response) => {
        let input: OpenBoxInput = req.body;
        try {
            //@ts-ignore
            // const walletAddress = req.walletAddress;
            const walletAddress = req.body.walletAddress;
            if (isNullOrEmptyString(input.boxAddress)
                || isNullOrEmptyString(input.transferSig)
            ) {
                throw new Error(ErrorCode.ParamsIsInvalid);
            }
            await TransactionHelper.validateTransferTokenSig(input.transferSig, walletAddress, 1, input.boxAddress, 0);

            const sig = await openBox(walletAddress, input.boxAddress);
            console.log("getTransaction ", await connection.getTransaction(sig));
            await TransactionHelper.markDoneTransferSig(input.transferSig);
            buildResponse(input.refNo, res, SUCCESS, {})
        } catch (err) {
            HandleErrorException(input, res, err + "");
        }
    }
    buyBoxNew = async (req: Request, res: Response) => {
        let input: BuyBoxInput = req.body;
        let sessionId: string = input.sessionId;
        try {
            const userRepo = DI.em.fork().getRepository(User);
            let user = await userRepo.findOne({ activeSessionId: sessionId });
            if (!user) {
                throw new Error(ErrorCode.AuthFailed);
            }
            buyBoxNew(user);
        } catch (err) {
            console.log(err);
            HandleErrorException(input, res, err + "");
        }
    }

    buyFTBox = async (req: Request, res: Response) => {
        let input: BuyBoxInput = req.body;
        let sessionId: string = input.sessionId;
        try {
            const userRepo = DI.em.fork().getRepository(User);
            let user = await userRepo.findOne({ activeSessionId: sessionId });
            if (!user) {
                throw new Error(ErrorCode.AuthFailed);
            }
            buyBoxNew(user);
        } catch (err) {
            console.log(err);
            HandleErrorException(input, res, err + "");
        }
    }
}

export default BuyBoxController

