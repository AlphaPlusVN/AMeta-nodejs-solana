import { Request, Response } from 'express';
// import { burnItem, buyBoxNew, connection, mintNFTItem, openBox } from '../ameta/SolAMeta';
import { buildResponse } from "../commons/Utils";
import BaseController, { BaseInput } from "./BaseController";

import { Constants } from '../commons/Constants';
import { SUCCESS } from "../config/ErrorCodeConfig";
import { DI } from '../configdb/database.config';
import { BoxConfig } from '../entities/BoxConfig';
import { getPoolInfo } from '../service/ServiceCommon';

class BuyBoxController extends BaseController {
    constructor() {
        super();
        this.initializeRoutes();
    }

    initializeRoutes = () => {
        this.router.post('/boxesForSale', this.getBoxesForSale);
        this.router.get("/getPoolBoxInfo", this.getPoolBoxInfo);
    }

    getBoxesForSale = async (req: Request, res: Response) => {
        try {
            let input: BaseInput = req.body;
            let mktBoxForSalRepo = DI.em.fork().getRepository(BoxConfig);
            let boxesForSale: BoxConfig[] = await mktBoxForSalRepo.find({ isNFT: Constants.STATUS_YES });
            if (!boxesForSale) boxesForSale = [];
            if (!input.refNo) {
                input.refNo = "refNo";
            }
            buildResponse(input.refNo, res, SUCCESS, boxesForSale);
        } catch (e) {
            console.error(e);
        }
    }

    getPoolBoxInfo = async (req: Request, res: Response) => {
        let poolInfo = await getPoolInfo();
        buildResponse("input.refNo", res, SUCCESS, poolInfo);

    }
}

export default BuyBoxController

