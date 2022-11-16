import BaseController from './BaseController';
import { SCNFTMetadata } from '../entities/NFTMetadataMapping';
import { DI } from '../configdb/database.config';
import { ItemConfig } from '../entities/ItemEntity';
import { buildResponse } from '../commons/Utils';
import { SUCCESS, HandleErrorException } from '../config/ErrorCodeConfig';
import { getProviderByChainId } from '../service/ServiceCommon';
import logger from '../commons/logger';
export default class ItemController extends BaseController {
    constructor() {
        super();
        this.initializeRoutes();
    }

    public initializeRoutes = () => {
        this.router.post("/")
        this.router.get("/metadata/:address/:tokenId", this.getItemMetadata);
        this.router.get("/getItemConfig/:itemCode", this.getItemConfig);
        this.router.post("/generateItemMetadata", this.generateItemMetadata);
    }

    getItemMetadata = async (req: any, res: any) => {
        let tokenId = parseInt(req.params.tokenId);
        let address: string = req.params.address;
        const itemMetadataRepo = DI.em.fork().getRepository(SCNFTMetadata);
        let metadata = await itemMetadataRepo.findOne({ contractAddress: address.toLowerCase(), tokenId });
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

    generateItemMetadata = async (req: any, res: any) => {
        try {
            const txHash = req.body.txHash;
            const chainId = parseInt(req.body.chainId);
            const provider = getProviderByChainId(chainId);
            let checkTxHash = await provider.getTransactionReceipt(txHash);
            logger.info("getTransaction:");
            logger.info(JSON.stringify(checkTxHash));
            buildResponse("input.refNo", res, SUCCESS, JSON.stringify(checkTxHash));
        } catch (e) {
            logger.error(e);
            HandleErrorException({ refNo: null }, res, e + "");
        }
    }
}
