import { MY_WALLET } from "../ameta/SolUtils";
import BaseController, { BaseInput } from "./BaseController";
import { Request, Response } from 'express';
import { buyBox, connection, openBox } from "../ameta/SolAMeta";
import { PublicKey } from "@solana/web3.js";
import { buildResponse, isNullOrEmptyString } from "../commons/Utils";

import AuthMiddleWare from "../middleware/AuthMiddleWare";
import { closeDb, collection } from "../commons/mongo";
import { MktBoxesForSale } from "../models/MktBoxForSale";

import BoxNFT from "../ameta/BoxNFT";
import TransactionHelper from "../commons/TransactionHelper";
import { ErrorCode, HandleErrorException, SUCCESS } from "../config/ErrorCodeConfig";

interface BuyBoxInput extends BaseInput {    
    transferSig: string,
    boxId: string,
}
interface BuyBoxInput extends BaseInput {
    boxId: string,
    transferSig: string,
}

interface OpenBoxInput extends BaseInput {    
    boxAddress: string,
}

class BuyBoxController extends BaseController {
    constructor() {
        super();
        this.initializeRoutes();
    }

    initializeRoutes = () => {
        this.router.get('/test', this.test);
        this.router.post('/buyBox', [AuthMiddleWare.verifyToken], this.buyBox);
        // this.router.post('/buyBox', this.buyBox);
        this.router.post('/boxesForSale', [AuthMiddleWare.verifyToken], this.getBoxesForSale);
        this.router.post('/openBox', [AuthMiddleWare.verifyToken], this.openBox);
        // this.router.post('/openBox', this.openBox);
    }

    test = async (req: Request, res: Response) => {
        buildResponse('input.refNo', res, SUCCESS, {});
    }

    getBoxesForSale = async (req: Request, res: Response) => {
        let input: BaseInput = req.body;
        let mkt_box_for_sale = await collection('mkt_box_for_sale');
        let boxesForSale: MktBoxesForSale[] = await mkt_box_for_sale.find<MktBoxesForSale>({}).toArray();
        closeDb();
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

            const mkt_box_for_sale_collection = await collection('mkt_box_for_sale');
            const box: MktBoxesForSale = await mkt_box_for_sale_collection.findOne<MktBoxesForSale>({ boxId: input.boxId, status: '1' });
            closeDb();
            if (!box) {
                throw new Error(ErrorCode.BoxIDIsInvalid);

            }

            if (!TransactionHelper.isValidTransferTokenSig(input.transferSig, walletAddress, Number(box.price))) {
                throw new Error(ErrorCode.TransferSigIsInvalid)
            }


            let sig = await buyBox(walletAddress);
            
            // console.log("getTransaction ", await connection.getTransaction(sig));
            buildResponse(input.refNo, res, SUCCESS, {})

        } catch (err) {
            HandleErrorException(input, res, err.message);
        } finally{
            closeDb();
        }
        
    }

    openBox = async (req: Request, res: Response) => {
        let input: OpenBoxInput = req.body;
        try{
            //@ts-ignore
            const walletAddress = req.walletAddress;
            // const walletAddress = req.body.walletAddress;
            if(isNullOrEmptyString(input.boxAddress)){
                throw new Error(ErrorCode.ParamsIsInvalid);
            }
            // const sig = await openBox(walletAddress);
            let sig = await openBox(walletAddress, input.boxAddress);
            console.log("getTransaction ", await connection.getTransaction(sig));
            buildResponse(input.refNo, res, SUCCESS, {})
        }catch(err){
            HandleErrorException(input, res, err.message);
        }finally{
            closeDb();
        }
    }

}

export default BuyBoxController

