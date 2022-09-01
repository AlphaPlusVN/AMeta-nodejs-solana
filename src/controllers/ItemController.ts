import BaseController from './BaseController';
import { SCNFTMetadata } from '../entities/NFTMetadataMapping';
import { DI } from '../configdb/database.config';
export default class ItemController extends BaseController {
    constructor() {
        super();
        this.initializeRoutes();
    }

    public initializeRoutes = () => {
        this.router.post("/")
        this.router.get("/metadata/:address/:tokenId", this.getItemMetadata);
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
}
