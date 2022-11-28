import { BscUtil } from "../commons/BSCUtils";
import { SmartContractDataScan } from '../entities/DataScanUser';
import { ChainId } from '../commons/EnumObjs';
import { getBoxContractByChainId } from '../service/ServiceCommon';
import { DI } from '../configdb/database.config';
import { Constants } from '../commons/Constants';
import { ScheduleUtils } from './ScheduleUtils';
import logger from "../commons/logger";
import { BigNumber } from "ethers";
import { KardiaUtils } from "../commons/KardiaUtils";

var cron = require('node-cron');

export async function scanBoxJob() {
    let task = cron.schedule(ScheduleUtils.SCANDATA_TIME, backupDataOnChain, ScheduleUtils.DEFALT_TIMEZONE);
    task.start();
}
export async function backupDataOnChain() {
    // scanBscBoxJob();
    scanKarBoxJob();
}

export async function scanBscBoxJob() {
    logger.info("scan bsc box job started");
    try {
        let contract = BscUtil.BoxContract;
        let maxTokenId = 1641;
        let scanList = new Array<SmartContractDataScan>();
        for (let i = 1; i <= maxTokenId; i++) {
            let scanData = new SmartContractDataScan();
            try {
                let address = await contract.ownerOf(i);
                logger.info(address);
                if (address != Constants.ADDRESS_0) {
                    scanData.chainId = ChainId.BSC_TEST;
                    scanData.contractAddress = getBoxContractByChainId(scanData.chainId).address;
                    scanData.walletOwner = address;
                    scanData.dataType = 1;
                    scanList.push(scanData);
                }
            } catch (e) {
                continue;
            }
        }
        const scanRepo = DI.em.fork().getRepository(SmartContractDataScan);
        await scanRepo.persistAndFlush(scanList);
        logger.info("scan bsc box done");
    } catch (e) {
        logger.error(e);
    }
}

export async function scanKarBoxJob() {
    logger.info("scan kar box job started");
    try {
        let contract = KardiaUtils.BoxContract;
        let maxTokenId = 21;
        let scanList = new Array<SmartContractDataScan>();
        for (let i = 1; i <= maxTokenId; i++) {
            let scanData = new SmartContractDataScan();
            try {
                let address = await contract.ownerOf(i);
                logger.info(address);
                if (address != Constants.ADDRESS_0) {
                    scanData.chainId = ChainId.KAR_TEST;
                    scanData.contractAddress = getBoxContractByChainId(scanData.chainId).address;
                    scanData.dataType = 1;
                    scanData.walletOwner = address;
                    scanList.push(scanData);
                }
            } catch (e) {
                continue;
            }
        }
        const scanRepo = DI.em.fork().getRepository(SmartContractDataScan);
        await scanRepo.persistAndFlush(scanList);
        logger.info("scan kar bsc box done");
    } catch (e) {
        logger.error(e);
    }
}