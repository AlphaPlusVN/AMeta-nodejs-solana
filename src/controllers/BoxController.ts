import { MY_WALLET } from "../outer-space/SolUtils";
import BaseController, { BaseInput } from "./BaseController";
import { Request, Response } from 'express';
import { connection, openBox } from "../outer-space/SolOuterSpace";
import { PublicKey } from "@solana/web3.js";
import { buildResponse, isNullOrEmptyString } from "../commons/Utils";

import AuthMiddleWare from "../middleware/AuthMiddleWare";
import { closeDb, collection } from "../commons/mongo";
import { MktBoxesForSale } from "../models/MktBoxForSale";
import { BOXID_IS_INVALID, PARAMS_INVALID, SUCCESS, TRANSACTION_FAILED, TRANSFER_SIG_IS_INVALID, WALLET_IS_INVALID } from "../config/ErrorCodeConfig";
import BoxNFT from "../outer-space/BoxNFT";
import TransactionHelper from "../commons/TransactionHelper";

interface BuyBoxInput extends BaseInput {
    payer: string,
    transferSig: string,
    boxId: string,
}
interface BuyBoxInput extends BaseInput {
    payer: string,    
    boxId: string,
}

interface OpenBoxInput extends BaseInput {
    payer: string,
}

class BuyBoxController extends BaseController {
    constructor() {
        super();
        this.initializeRoutes();
    }

    initializeRoutes = () => {
        this.router.get('/test', this.test);
        this.router.post('/buyBox',[AuthMiddleWare.verifyToken], this.buyBox);
        this.router.post('/boxesForSale', [AuthMiddleWare.verifyToken], this.getBoxesForSale);
        // this.router.post('/openBox', [AuthMiddleWare.verifyToken], this.openBox);
        this.router.post('/openBox', this.openBox);
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
        if (isNullOrEmptyString(input.payer)
            || isNullOrEmptyString(input.boxId)
            || isNullOrEmptyString(input.transferSig)
        ) {
            buildResponse(input.refNo, res, PARAMS_INVALID, {});
            return;
        }
        let walletPayer: PublicKey = null;
        try {
            walletPayer = new PublicKey(input.payer);
        } catch (err) {
            buildResponse(input.refNo, res, WALLET_IS_INVALID, {});
            return;
        }

        const mkt_box_for_sale_collection = await collection('mkt_box_for_sale');
        const box : MktBoxesForSale = await mkt_box_for_sale_collection.findOne<MktBoxesForSale>({boxId: input.boxId, status: '1'});
        closeDb();
        if(!box){
            buildResponse(input.refNo, res, BOXID_IS_INVALID, {});
            return;
        }

        if(!TransactionHelper.isValidTransferTokenSig(input.transferSig, input.payer, Number(box.price))){
            buildResponse(input.refNo, res, TRANSFER_SIG_IS_INVALID, {});
            return;
        }

        try {
            let boxNft = new BoxNFT();
            let metadata = await boxNft.generate(input.payer);
            let url = await boxNft.upload();
            console.log(url);
            let sig = await this.createNft(
                walletPayer,
                box.name,
                box.symbol,
                url
            );
            console.log(await connection.getTransaction(sig));
        } catch (err) {
            console.log(err.message);
            buildResponse(input.refNo, res, TRANSACTION_FAILED, {error: err.message}, err.message);
            return;
        }
        buildResponse(input.refNo, res, SUCCESS, {})
    }

    openBox = async (req: Request, res: Response) => {
        let input: OpenBoxInput = req.body;
        await openBox(input.payer)

        buildResponse(input.refNo, res, SUCCESS, {})
    }

}

export default BuyBoxController

