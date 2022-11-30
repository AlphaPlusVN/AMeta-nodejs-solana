import { DI } from '../configdb/database.config';
import { SmartContractDataScan } from '../entities/DataScanUser';
import { SCNFTMetadata } from '../entities/NFTMetadataMapping';

type UserNFTData = {
    contractAddress: string,
    userAddress: string,
    tokenIds: Array<number>
}
export async function swapMetaDataJob() {
    const scanNFTRepo = DI.em.fork().getRepository(SmartContractDataScan);
    const nftMetaDataRepo = DI.em.fork().getRepository(SCNFTMetadata);
    let BSC_BOX_ADDR = "";
    let BSC_NFT_ADDR = "";
    let KAR_BOX_ADDR = "";
    let KAR_NFT_ADDR = "";
    let addressList = [BSC_BOX_ADDR, BSC_NFT_ADDR, KAR_BOX_ADDR, KAR_NFT_ADDR];
    let oldDatas = await scanNFTRepo.find({ contractAddress: { $in: addressList } });
    let mapBoxBsc = new Map<string, UserNFTData>();
    let mapBoxKar = new Map<string, UserNFTData>();
    let mapNFTBsc = new Map<string, UserNFTData>();
    let mapNFTKar = new Map<string, UserNFTData>();
    for (let data of oldDatas) {
        switch (data.contractAddress) {
            case BSC_BOX_ADDR:
                if(!mapBoxBsc.has(data.walletOwner))
                {
                    // mapBoxBsc.set(data.walletOwner, {contractAddress:data.contractAddress,userAddress:data.walletOwner,tokenIds:[data.tokenId]})
                }
            case BSC_NFT_ADDR:
            case KAR_BOX_ADDR:
            case KAR_NFT_ADDR:
        }
    }
}