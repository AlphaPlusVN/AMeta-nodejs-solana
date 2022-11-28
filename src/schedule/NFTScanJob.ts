import { BscUtil } from "../commons/BSCUtils";
import { SmartContractDataScan } from '../entities/DataScanUser';
import { ChainId } from '../commons/EnumObjs';
import { getBoxContractByChainId, getNFTContractByChainId } from '../service/ServiceCommon';
import { DI } from '../configdb/database.config';
import { Constants } from '../commons/Constants';
import { ScheduleUtils } from './ScheduleUtils';
import logger from "../commons/logger";
import { BigNumber } from "ethers";
import { KardiaUtils } from "../commons/KardiaUtils";

var cron = require('node-cron');

export async function scanNFTJob() {
    let task = cron.schedule(ScheduleUtils.SCANDATA_TIME, backupDataOnChain, ScheduleUtils.DEFALT_TIMEZONE);
    task.start();
}
async function backupDataOnChain() {
    scanBscNFTJob();
    scanKarNFTJob();
}

export async function scanBscNFTJob() {
    logger.info("scan bsc nft job started");
    try {
        let contract = BscUtil.NFTContract;
        let maxTokenId = 100;
        let scanList = new Array<SmartContractDataScan>();
        for (let i = 1; i <= maxTokenId; i++) {
            let scanData = new SmartContractDataScan();
            try {
                let address = await contract.ownerOf(i);
                logger.info(address);
                if (address != Constants.ADDRESS_0) {
                    scanData.chainId = ChainId.BSC_TEST;
                    scanData.contractAddress = getNFTContractByChainId(scanData.chainId).address;
                    scanData.walletOwner = address;
                    scanData.dataType = 2;
                    scanData.tokenId = i;
                    scanList.push(scanData);
                }
            } catch (e) {
                continue;
            }
        }
        const scanRepo = DI.em.fork().getRepository(SmartContractDataScan);
        await scanRepo.persistAndFlush(scanList);
        logger.info("scan bsc nft done");
    } catch (e) {
        logger.error(e);
    }
}

export async function scanKarNFTJob() {
    logger.info("scan kar nft job started");
    try {
        let contract = KardiaUtils.NFTContract;
        let maxTokenId = 21;
        let scanList = new Array<SmartContractDataScan>();
        for (let i = 1; i <= maxTokenId; i++) {
            let scanData = new SmartContractDataScan();
            try {
                let address = await contract.ownerOf(i);
                logger.info(address);
                if (address != Constants.ADDRESS_0) {
                    scanData.chainId = ChainId.KAR_TEST;
                    scanData.contractAddress = getNFTContractByChainId(scanData.chainId).address;
                    scanData.dataType = 2;
                    scanData.tokenId = i;
                    scanData.walletOwner = address;
                    scanList.push(scanData);
                }
            } catch (e) {
                continue;
            }
        }
        const scanRepo = DI.em.fork().getRepository(SmartContractDataScan);
        await scanRepo.persistAndFlush(scanList);
        logger.info("scan nft kar done");
    } catch (e) {
        logger.error(e);
    }
}