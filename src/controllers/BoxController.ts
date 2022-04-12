import { MY_WALLET } from "../outer-space/SolUtils";
import BaseController, { BaseInput } from "./BaseController";
import { Request, Response } from 'express';
import { connection } from "../outer-space/SolOuterSpace";
import { PublicKey } from "@solana/web3.js";
import { buildResponse } from "../commons/Utils";

import AuthMiddleWare from "../middleware/AuthMiddleWare";
import { closeDb, collection } from "../commons/mongo";
import { MktBoxesForSale } from "../models/MktBoxForSale";
import { SUCCESS } from "../config/ErrorCodeConfig";

interface BuyBoxInput extends BaseInput {
    payer: string
}
interface BoxForSaleInput extends BaseInput {

}

class BuyBoxController extends BaseController {
    constructor() {
        super();
        this.initializeRoutes();
    }

    initializeRoutes = () => {
        this.router.post('/buyBox', this.buyBox);
        this.router.post('/boxesForSale', [AuthMiddleWare.verifyToken], this.getBoxesForSale);
        this.router.post('/openBox', [AuthMiddleWare.verifyToken], this.openBox);
    }

    getBoxesForSale = async (req: Request, res: Response) => {
        let input : BoxForSaleInput = req.body;
        let mkt_box_for_sale = await collection('mkt_box_for_sale');
        let boxesForSale: MktBoxesForSale[] = await mkt_box_for_sale.find<MktBoxesForSale>({}).toArray();
        closeDb();
        if (!boxesForSale) boxesForSale = [];
        buildResponse(input.refNo, res, SUCCESS, boxesForSale);
    }

    buyBox = async (req: Request, res: Response) => {
        let buyBoxInput: BuyBoxInput = req.body;
        let sig = await this.createNft(
            new PublicKey(buyBoxInput.payer),
            'Starter Box',
            'BOX1',
            'http://referral-mb.herokuapp.com/box1.json'
        );
        console.log(await connection.getTransaction(sig));
        buildResponse(buyBoxInput.refNo, res, SUCCESS, { sig })
    }

    openBox = async (req: Request, res: Response) => {

    }

}

export default BuyBoxController