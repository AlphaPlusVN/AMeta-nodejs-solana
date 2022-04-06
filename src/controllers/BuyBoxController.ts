import { MY_WALLET } from "../outer-space/SolUtils";
import BaseController, { BaseInput } from "./BaseController";
import { Request, Response } from 'express';
import { connection } from "../outer-space/SolOuterSpace";
import { PublicKey } from "@solana/web3.js";
import { buildResponse } from "../commons/Utils";
import { ErrorCode } from "../config/ErrorCodeConfig";
import AuthMiddleWare from "../middleware/AuthMiddleWare";

interface BuyBoxInput extends BaseInput {
    payer: string
}
class BuyBoxController extends BaseController {
    constructor() {
        super();
        this.intializeRoutes();
    }

    intializeRoutes = () => {
        this.router.post('/buyBox', this.buyBox);
        this.router.post('/listBox', [AuthMiddleWare.verifyToken], this.listBox);
    }

    listBox = async (req: Request, res: Response) => {

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
        buildResponse(buyBoxInput.refNo, res, ErrorCode.SUCCESS, 'ok', { sig })
    }

}

export default BuyBoxController