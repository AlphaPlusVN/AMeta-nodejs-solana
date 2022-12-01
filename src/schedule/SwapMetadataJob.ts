import { getAddress } from 'ethers/lib/utils';
import logger from '../commons/logger';
import { OnusUtils } from '../commons/OnusUtils';
import { DI } from '../configdb/database.config';
import { SmartContractDataScan } from '../entities/DataScanUser';
import { MetaDataFormat, SCNFTMetadata } from '../entities/NFTMetadataMapping';
import { ScheduleUtils } from './ScheduleUtils';

type UserNFTData = {
    contractAddress: string,
    userAddress: string,
    tokenIds: Array<number>
}
var cron = require('node-cron');
export async function swapNFTJob() {
    let task = cron.schedule(ScheduleUtils.SWAP_METADATA_TIME, swapMetaDataJob, ScheduleUtils.DEFALT_TIMEZONE);
    task.start();
}

export async function swapMetaDataJob() {
    const blackList = ["0xA410158364Ab27f91b093ccD9ACB5e992b8bED40"];
    const scanNFTRepo = DI.em.fork().getRepository(SmartContractDataScan);
    const nftMetaDataRepo = DI.em.fork().getRepository(SCNFTMetadata);
    let BSC_BOX_ADDR = "0xca8B840932c0Aa34B9E425774c15074B56877fF2";
    let BSC_NFT_ADDR = "0x02BA6C503fa44bfF2fd8Ecc4de76703080e4bBe4";
    let KAR_BOX_ADDR = "0xAB72D4d28178c9f1AE628160a047201ec6582B5F";
    let KAR_NFT_ADDR = "0x2DDCB116Fb46eFe8855156300c027533fD32a556";
    const addressList = [BSC_BOX_ADDR, BSC_NFT_ADDR, KAR_BOX_ADDR, KAR_NFT_ADDR];
    let oldDatas = await scanNFTRepo.find({ contractAddress: { $in: addressList } });
    let mapBoxBsc = new Map<string, UserNFTData>();
    let mapBoxKar = new Map<string, UserNFTData>();
    let mapNFTBsc = new Map<string, UserNFTData>();
    let mapNFTKar = new Map<string, UserNFTData>();
    for (let data of oldDatas) {
        switch (data.contractAddress) {
            case BSC_BOX_ADDR:
                if (!mapBoxBsc.has(data.walletOwner)) {
                    mapBoxBsc.set(data.walletOwner, { contractAddress: data.contractAddress, userAddress: data.walletOwner, tokenIds: [data.tokenId] })
                } else {
                    let boxData = mapBoxBsc.get(data.walletOwner);
                    boxData.tokenIds.push(data.tokenId);
                    mapBoxBsc.set(data.walletOwner, boxData);
                }
                break;
            case BSC_NFT_ADDR:
                if (!mapNFTBsc.has(data.walletOwner)) {
                    mapNFTBsc.set(data.walletOwner, { contractAddress: data.contractAddress, userAddress: data.walletOwner, tokenIds: [data.tokenId] })
                } else {
                    let nftData = mapNFTBsc.get(data.walletOwner);
                    nftData.tokenIds.push(data.tokenId);
                    mapNFTBsc.set(data.walletOwner, nftData);
                }
                break;
            case KAR_BOX_ADDR:
                if (!mapBoxKar.has(data.walletOwner)) {
                    mapBoxKar.set(data.walletOwner, { contractAddress: data.contractAddress, userAddress: data.walletOwner, tokenIds: [data.tokenId] })
                } else {
                    let boxData = mapBoxKar.get(data.walletOwner);
                    boxData.tokenIds.push(data.tokenId);
                    mapBoxKar.set(data.walletOwner, boxData);
                }
                break;
            case KAR_NFT_ADDR:
                if (!mapNFTKar.has(data.walletOwner)) {
                    mapNFTKar.set(data.walletOwner, { contractAddress: data.contractAddress, userAddress: data.walletOwner, tokenIds: [data.tokenId] });
                } else {
                    let nftData = mapNFTKar.get(data.walletOwner);
                    nftData.tokenIds.push(data.tokenId);
                    mapNFTKar.set(data.walletOwner, nftData);
                }
                break;
        }
    }
    const addressListLower = [BSC_BOX_ADDR.toLowerCase(), BSC_NFT_ADDR.toLowerCase(), KAR_BOX_ADDR.toLowerCase(), KAR_NFT_ADDR.toLowerCase()];

    let metadaList = await nftMetaDataRepo.find({ contractAddress: { $in: addressListLower } });
    let bscBoxMetaDataMap = new Map<number, MetaDataFormat>();
    let bscNFTMetaDataMap = new Map<number, MetaDataFormat>();
    let karBoxMetaDataMap = new Map<number, MetaDataFormat>();
    let karNFTMetaDataMap = new Map<number, MetaDataFormat>();
    logger.info("bsc box size " + mapBoxBsc.size);
    logger.info("bsc nft size " + mapNFTBsc.size);
    logger.info("kar box size " + mapBoxKar.size);
    logger.info("kar nft size " + mapNFTKar.size);
    for (let metaData of metadaList) {
        switch (metaData.contractAddress) {
            case BSC_BOX_ADDR.toLowerCase():
                bscBoxMetaDataMap.set(metaData.tokenId, metaData.jsonMetadata);
                break;
            case BSC_NFT_ADDR.toLowerCase():
                bscNFTMetaDataMap.set(metaData.tokenId, metaData.jsonMetadata);
                break;
            case KAR_BOX_ADDR.toLowerCase():
                karBoxMetaDataMap.set(metaData.tokenId, metaData.jsonMetadata);
                break;
            case KAR_NFT_ADDR.toLowerCase():
                karNFTMetaDataMap.set(metaData.tokenId, metaData.jsonMetadata);
                break;
        }
    }
    //bscBox
    try {
        for (let userWallet of mapBoxBsc.keys()) {
            if (blackList.includes(userWallet)) {
                continue;
            }
            let minter = mapBoxBsc.get(userWallet);
            for (let tokenId of minter.tokenIds) {
                let scMetaData = new SCNFTMetadata();
                scMetaData.contractAddress = minter.contractAddress.toLowerCase();
                let newTokenId = await OnusUtils.BoxContract.connect(await OnusUtils.getOwner()).mint(getAddress(userWallet), 1);
                scMetaData.tokenId = newTokenId;
                scMetaData.owner = userWallet;
                scMetaData.jsonMetadata = bscBoxMetaDataMap.get(tokenId);
                nftMetaDataRepo.persist(scMetaData);
            }
            logger.info("mint bsc box for " + userWallet + " done");
        }
    } catch (e) {
        logger.error("mint Bsc Box Error");
        logger.error(e);
    }
    //bscNFT
    try {
        for (let userWallet of mapNFTBsc.keys()) {
            if (blackList.includes(userWallet)) {
                continue;
            }
            let minter = mapNFTBsc.get(userWallet);
            for (let tokenId of minter.tokenIds) {
                let scMetaData = new SCNFTMetadata();
                scMetaData.contractAddress = minter.contractAddress.toLowerCase();
                let newTokenId = await OnusUtils.NFTContract.connect(await OnusUtils.getOwner()).mint(getAddress(userWallet), 1);
                scMetaData.tokenId = newTokenId;
                scMetaData.owner = userWallet;
                scMetaData.jsonMetadata = bscNFTMetaDataMap.get(tokenId);
                nftMetaDataRepo.persist(scMetaData);
            }
            logger.info("mint bsc nft for " + userWallet + " done");
        }
    } catch (e) {
        logger.error("mint Bsc NFT Error");
        logger.error(e);
    }

    //karBox
    try {
        for (let userWallet of mapBoxKar.keys()) {
            if (blackList.includes(userWallet)) {
                continue;
            }
            let minter = mapBoxKar.get(userWallet);
            for (let tokenId of minter.tokenIds) {
                let scMetaData = new SCNFTMetadata();
                scMetaData.contractAddress = minter.contractAddress.toLowerCase();
                let newTokenId = await OnusUtils.BoxContract.connect(await OnusUtils.getOwner()).mint(getAddress(userWallet), 1);
                scMetaData.tokenId = newTokenId;
                scMetaData.owner = userWallet;
                scMetaData.jsonMetadata = karBoxMetaDataMap.get(tokenId);
                nftMetaDataRepo.persist(scMetaData);
            }
            logger.info("mint kar box for " + userWallet + " done");
        }
    } catch (e) {
        logger.error("mint kar box Error");
        logger.error(e);
    }
    try {
        for (let userWallet of mapNFTKar.keys()) {
            if (blackList.includes(userWallet)) {
                continue;
            }
            let minter = mapNFTKar.get(userWallet);
            for (let tokenId of minter.tokenIds) {
                let scMetaData = new SCNFTMetadata();
                scMetaData.contractAddress = minter.contractAddress.toLowerCase();
                let newTokenId = await OnusUtils.NFTContract.connect(await OnusUtils.getOwner()).mint(getAddress(userWallet), 1);
                scMetaData.tokenId = newTokenId;
                scMetaData.owner = userWallet;
                scMetaData.jsonMetadata = karNFTMetaDataMap.get(tokenId);
                nftMetaDataRepo.persist(scMetaData);
            }
            logger.info("mint kar nft for " + userWallet + " done");
        }
    } catch (e) {
        logger.error("kar nft Error");
        logger.error(e);
    }
}