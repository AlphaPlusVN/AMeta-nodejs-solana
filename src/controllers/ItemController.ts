import BaseController from './BaseController';
import { SCNFTMetadata } from '../entities/NFTMetadataMapping';
import { DI } from '../configdb/database.config';
import { ItemConfig } from '../entities/ItemEntity';
import { buildResponse } from '../commons/Utils';
import { SUCCESS } from '../config/ErrorCodeConfig';
export default class ItemController extends BaseController {
    constructor() {
        super();
        this.initializeRoutes();
    }

    public initializeRoutes = () => {
        this.router.post("/")
        this.router.get("/metadata/:address/:tokenId", this.getItemMetadata);
        this.router.get("/getItemConfig/:itemCode")
    }

    getItemMetadata = async (req: any, res: any) => {
        let tokenId = parseInt(req.params.tokenId);
        let address = req.params.address;
        const itemMetadataRepo = DI.em.fork().getRepository(SCNFTMetadata);
        let metadata = await itemMetadataRepo.findOne({ contractAddress: address, tokenId });
        if (metadata) {
            res.send(metadata.jsonMetadata);
        } else {
            res.send({ message: "Data is processing!" });
        }
    }

    getItemConfig = async (req: any, res: any) => {
        let itemCode = req.params.itemCode;
        const itemConfigRepo = DI.em.fork().getRepository(ItemConfig);
        let itemConfig = await itemConfigRepo.findOne({ code: itemCode });
        buildResponse("input.refNo", res, SUCCESS, itemConfig);
    }
}
