import CronTime from "cron-time-generator";
import { BscUtil } from '../commons/BSCUtils';
import { SystemParamCode } from '../commons/Constants';
import { KardiaUtils } from "../commons/KardiaUtils";
import logger from "../commons/logger";
import { OnusUtils } from "../commons/OnusUtils";
import { DI } from '../configdb/database.config';
import { SCNFTMetadata } from '../entities/NFTMetadataMapping';
import { SystemParam } from '../entities/SystemParam';
import { openBoxEventTrigger } from "../service/ContractEventHandler";
import { getSystemConfigParam } from "../service/ServiceCommon";
import { ScheduleUtils } from "./ScheduleUtils";

var cron = require('node-cron');
export async function syncItemMetadataJob() {
    let task = cron.schedule(CronTime.every(ScheduleUtils.SYNC_METADATA_INTERVAL).minutes(), syncDataEvent);
    task.start();
}
var RUNNING_STATE = 0;
const syncDataEvent = async () => {
    //bsc
    if (RUNNING_STATE == 0) {
        logger.info("sync metadata");
        RUNNING_STATE = 1;
        // await bscSynchData();
        // await karSynchData();

        RUNNING_STATE = 0;
        logger.info("synch metadata done");
    }
}
async function bscSynchData() {
    try {
        const boxCtBsc = BscUtil.BoxContract;
        let eventFilter = boxCtBsc.filters.OpenBox();
        let currentBlock = await BscUtil.provider.getBlockNumber();
        const systemParamRepo = DI.em.fork().getRepository(SystemParam);
        let bscLastBlockConfig = await getSystemConfigParam(SystemParamCode.BSC_LAST_BLOCK_SCAN);
        let bscLastTokenIdconfig = await getSystemConfigParam(SystemParamCode.BSC_LAST_TOKENID_SCAN);

        let startBlock = bscLastBlockConfig.value;
        let loopCheck = Math.ceil((currentBlock - startBlock) / 5000);
        let datas = new Array();
        for (let i = 0; i < loopCheck; i++) {
            let nextStartBlock = startBlock + 5000 * i;
            let endBlock = Math.min((startBlock + 5000 * (i + 1)), currentBlock);
            let events = await boxCtBsc.queryFilter(eventFilter, nextStartBlock, endBlock);
            const data = events.map(({ args: { tokenId, owner, collectionId, boxType }, event }) => ({
                event,
                tokenId: tokenId.toNumber(),
                collectionId: collectionId.toNumber(),
                boxType: boxType.toNumber(),
                owner,
            }));
            if (data.length > 0) {
                datas = datas.concat(data);
            }
        }
        //get metadata
        logger.info("scan bsc datablock length " + datas.length);
        const nftMetaDataRepo = DI.em.fork().getRepository(SCNFTMetadata);
        let metadatas = await nftMetaDataRepo.find({ contractAddress: BscUtil.NFT_ADDRESS.toLowerCase(), tokenId: { $gt: bscLastTokenIdconfig.value } });
        let nftMetadataMap = new Map<number, SCNFTMetadata>();
        for (let metadata of metadatas) {
            nftMetadataMap.set(metadata.tokenId, metadata);
        }
        let lastTokenId: number = 0;
        //scan block
        for (let data of datas) {
            try {
                logger.info(JSON.stringify(data));
                if (data.collectionId > lastTokenId) {
                    lastTokenId = data.collectionId;
                }
                if (!nftMetadataMap.has(data.collectionId)) {
                    await openBoxEventTrigger(data.owner, data.collectionId, data.boxType, BscUtil.NFT_ADDRESS);
                }
            } catch (e) {
                logger.error(e);
                continue;
            }
        }
        bscLastBlockConfig.value = currentBlock;
        bscLastTokenIdconfig.value = lastTokenId;
        systemParamRepo.persist(bscLastBlockConfig);
        systemParamRepo.persist(bscLastTokenIdconfig);
        await systemParamRepo.flush();
    } catch (e) {
        logger.error(e);
    }
}
async function karSynchData() {
    const boxCtKar = KardiaUtils.BoxContract;
    let eventFilter = boxCtKar.filters.OpenBox();
    let currentBlock = await KardiaUtils.provider.getBlockNumber();
    const systemParamRepo = DI.em.fork().getRepository(SystemParam);
    let karLastBlockConfig = await getSystemConfigParam(SystemParamCode.KAR_LAST_BLOCK_SCAN);
    let karLastTokenIdconfig = await getSystemConfigParam(SystemParamCode.KAR_LAST_TOKENID_SCAN);

    let startBlock = karLastBlockConfig.value;
    let loopCheck = Math.ceil((currentBlock - startBlock) / 5000);
    let datas = new Array();
    for (let i = 0; i < loopCheck; i++) {
        let nextStartBlock = startBlock + 5000 * i;
        let endBlock = Math.min((startBlock + 5000 * (i + 1)), currentBlock);
        let events = await boxCtKar.queryFilter(eventFilter, nextStartBlock, endBlock);
        const data = events.map(({ args: { tokenId, owner, collectionId, boxType }, event }) => ({
            event,
            tokenId: tokenId.toNumber(),
            collectionId: collectionId.toNumber(),
            boxType: boxType.toNumber(),
            owner,
        }));
        if (data.length > 0) {
            datas = datas.concat(data);
        }
    }
    //get metadata
    logger.info("scan kar datablock length " + datas.length);
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
    karLastBlockConfig.value = currentBlock;
    karLastTokenIdconfig.value = lastTokenId;
    systemParamRepo.persist(karLastBlockConfig);
    systemParamRepo.persist(karLastTokenIdconfig);
    await systemParamRepo.flush();
}
async function onusSynchData() {
    const boxCtKar = OnusUtils.BoxContract;
    let eventFilter = boxCtKar.filters.OpenBox();
    let currentBlock = await OnusUtils.provider.getBlockNumber();
    const systemParamRepo = DI.em.fork().getRepository(SystemParam);
    let karLastBlockConfig = await getSystemConfigParam(SystemParamCode.KAR_LAST_BLOCK_SCAN);
    let karLastTokenIdconfig = await getSystemConfigParam(SystemParamCode.KAR_LAST_TOKENID_SCAN);

    let startBlock = karLastBlockConfig.value;
    let loopCheck = Math.ceil((currentBlock - startBlock) / 5000);
    let datas = new Array();
    for (let i = 0; i < loopCheck; i++) {
        let nextStartBlock = startBlock + 5000 * i;
        let endBlock = Math.min((startBlock + 5000 * (i + 1)), currentBlock);
        let events = await boxCtKar.queryFilter(eventFilter, nextStartBlock, endBlock);
        const data = events.map(({ args: { tokenId, owner, collectionId, boxType }, event }) => ({
            event,
            tokenId: tokenId.toNumber(),
            collectionId: collectionId.toNumber(),
            boxType: boxType.toNumber(),
            owner,
        }));
        if (data.length > 0) {
            datas = datas.concat(data);
        }
    }
    //get metadata
    logger.info("scan kar datablock length " + datas.length);
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
    karLastBlockConfig.value = currentBlock;
    karLastTokenIdconfig.value = lastTokenId;
    systemParamRepo.persist(karLastBlockConfig);
    systemParamRepo.persist(karLastTokenIdconfig);
    await systemParamRepo.flush();
}