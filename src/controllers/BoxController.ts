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


interface BuyBoxInput extends BaseInput {
    sessionId: string;
    boxId: string,
    transferSig: string,
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
        this.router.post('/buyBox', [AuthMiddleWare.verifyToken], this.buyBox);
        this.router.post('/buyBoxNew', this.buyBoxNew);
        // this.router.post('/buyBox', this.buyBox);
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

            if (isNullOrEmptyString(input.boxId)
                || isNullOrEmptyString(input.transferSig)
            ) {
                throw new Error(ErrorCode.ParamsIsInvalid);
            }
            let walletPayer: PublicKey = null;
            //@ts-ignore
            const walletAddress = req.walletAddress;
            // const walletAddress = 'BfvHGfacbqHe58NSD8mJQB9ZNqPb7ZG7gWHNRSAzwefh';
            try {

                console.log('walletAddress', walletAddress);
                //@ts-ignore
                walletPayer = new PublicKey(walletAddress);
            } catch (err) {
                throw new Error(ErrorCode.WalletAddressIsInvalid)

            }

            const mktBoxForSalRepo = DI.em.fork().getRepository(MktBoxesForSale);
            let box: MktBoxesForSale = await mktBoxForSalRepo.findOne({ boxId: input.boxId, status: '1' });
            if (!box) {
                throw new Error(ErrorCode.BoxIDIsInvalid);

            }

            // if (!TransactionHelper.isValidTransferTokenSig(input.transferSig, walletAddress, Number(box.price))) {
            //     throw new Error(ErrorCode.TransferSigIsInvalid)
            // }


            // let sig = await buyBox(walletAddress);

            // console.log("getTransaction ", await connection.getTransaction(sig));
            buildResponse(input.refNo, res, SUCCESS, {})

        } catch (err) {
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
        let sessionId:string = input.sessionId;
        try {
            const userRepo = DI.em.fork().getRepository(User);
            let user = await userRepo.findOne({activeSessionId: sessionId});
            if(!user)
            {
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

