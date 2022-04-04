import { MY_WALLET } from "../outer-space/SolUtils";
import BaseController from "./BaseController";
import { Request, Response } from 'express';
import { connection } from "../outer-space/SolOuterSpace";
import { PublicKey } from "@solana/web3.js";

interface BuyBoxInput{
    payer: string
}
class BuyBoxController extends BaseController {
    constructor() {
        super();
        this.intializeRoutes();
    }

    intializeRoutes = () => {
        this.router.post('/buyBox', this.buyBox)
    }

    buyBox = async (req: Request, res: Response) => {
        let buyBoxInput : BuyBoxInput = req.body;
        let sig = await this.createNft(new PublicKey(buyBoxInput.payer));
        console.log(await connection.getTransaction(sig));
        res.send({ sig })
    }

}

export default BuyBoxController