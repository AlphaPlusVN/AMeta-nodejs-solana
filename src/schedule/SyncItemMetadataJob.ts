import CronTime from "cron-time-generator";
import { BscUtil } from '../commons/BSCUtils';
import { ScheduleUtils } from "./ScheduleUtils";
import { DI } from '../configdb/database.config';
import { SystemParam } from '../entities/SystemParam';
import { SystemParamCode } from '../commons/Constants';
import { SCNFTMetadata } from '../entities/NFTMetadataMapping';
import { getSystemConfigParam } from "../service/ServiceCommon";
import { openBoxEventTrigger } from "../service/ContractEventHandler";
import logger from "../commons/logger";
import { KardiaUtils } from "../commons/KardiaUtils";

var cron = require('node-cron');
export async function syncItemMetadataJob() {
    let task = cron.schedule(CronTime.every(ScheduleUtils.SYNC_METADATA_INTERVAL).minutes(), syncDataEvent);
    task.start();
}
const syncDataEvent = async () => {
    //bsc
    await bscSynchData();
    await karSynchData()
    logger.info("synch metadata done");
}

async function bscSynchData() {
    const boxCtBsc = BscUtil.BoxContract;
    let eventFilter = boxCtBsc.filters.OpenBox();
    let endBlock = await BscUtil.provider.getBlockNumber();
    const systemParamRepo = DI.em.fork().getRepository(SystemParam);
    let bscLastBlockConfig = await getSystemConfigParam(SystemParamCode.BSC_LAST_BLOCK_SCAN);
    let bscLastTokenIdconfig = await getSystemConfigParam(SystemParamCode.BSC_LAST_TOKENID_SCAN);

    let startBlock = bscLastBlockConfig.value;
    let events = await boxCtBsc.queryFilter(eventFilter, startBlock, endBlock);
    const datas = events.map(({ args: { tokenId, owner, collectionId, boxType }, event }) => ({
        event,
        tokenId: tokenId.toNumber(),
        collectionId: collectionId.toNumber(),
        boxType: boxType.toNumber(),
        owner,
    }));
    //get metadata
    const nftMetaDataRepo = DI.em.fork().getRepository(SCNFTMetadata);
    let metadatas = await nftMetaDataRepo.find({ contractAddress: BscUtil.NFT_ADDRESS.toLowerCase(), tokenId: { $gt: bscLastTokenIdconfig.value } });
    let nftMetadataMap = new Map<number, SCNFTMetadata>();
    for (let metadata of metadatas) {
        nftMetadataMap.set(metadata.tokenId, metadata);
    }
    let lastTokenId: number = 0;
    //scan block
    for (let data of datas) {
        logger.info(JSON.stringify(data));
        if (data.collectionId > lastTokenId) {
            lastTokenId = data.collectionId;
        }
        if (!nftMetadataMap.has(data.collectionId)) {
            await openBoxEventTrigger(data.owner, data.collectionId, data.boxType, BscUtil.NFT_ADDRESS);
        }
    }
    bscLastBlockConfig.value = endBlock;
    bscLastTokenIdconfig.value = lastTokenId; 
    systemParamRepo.persist(bscLastBlockConfig);
    systemParamRepo.persist(bscLastTokenIdconfig);
    await systemParamRepo.flush();
}
async function karSynchData() {
    const boxCtKar = KardiaUtils.BoxContract;
    let eventFilter = boxCtKar.filters.OpenBox();
    let endBlock = await KardiaUtils.provider.getBlockNumber();
    const systemParamRepo = DI.em.fork().getRepository(SystemParam);
    let karLastBlockConfig = await getSystemConfigParam(SystemParamCode.KAR_LAST_BLOCK_SCAN);
    let karLastTokenIdconfig = await getSystemConfigParam(SystemParamCode.KAR_LAST_TOKENID_SCAN);

    let startBlock = karLastBlockConfig.value;
    let events = await boxCtKar.queryFilter(eventFilter, startBlock, endBlock);
    const datas = events.map(({ args: { tokenId, owner, collectionId, boxType }, event }) => ({
        event,
        tokenId: tokenId.toNumber(),
        collectionId: collectionId.toNumber(),
        boxType: boxType.toNumber(),
        owner,
    }));
    //get metadata
    const nftMetaDataRepo = DI.em.fork().getRepository(SCNFTMetadata);
    let metadatas = await nftMetaDataRepo.find({ contractAddress: KardiaUtils.NFT_ADDRESS.toLowerCase(), tokenId: { $gt: karLastTokenIdconfig.value } });
    let nftMetadataMap = new Map<number, SCNFTMetadata>();
    for (let metadata of metadatas) {
        nftMetadataMap.set(metadata.tokenId, metadata);
    }
    let lastTokenId: number = 0;
    //scan block
    for (let data of datas) {
        logger.info(JSON.stringify(data));
        if (data.collectionId > lastTokenId) {
            lastTokenId = data.collectionId;
        }
        if (!nftMetadataMap.has(data.collectionId)) {
            await openBoxEventTrigger(data.owner, data.collectionId, data.boxType, KardiaUtils.NFT_ADDRESS);
        }
    }
    karLastBlockConfig.value = endBlock;
    karLastTokenIdconfig.value = lastTokenId;
    systemParamRepo.persist(karLastBlockConfig);
    systemParamRepo.persist(karLastTokenIdconfig);
    await systemParamRepo.flush();
}
