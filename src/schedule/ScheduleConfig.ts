import logger from "../commons/logger";
import { scanBoxJob } from "./BoxScanJob";
import { scanNFTJob } from "./NFTScanJob";
import { swapNFTJob } from "./SwapMetadataJob";
import { swapAplusJob } from "./SwapTokenJob";
export async function initSchedule() {
    // syncItemMetadataJob().then(() => {
    //     logger.info("Init sync Item Metadata Job");
    // });

    scanBoxJob().then(() => {
        logger.info("Init sync Scan box smartContract Job");
    });

    scanNFTJob().then(() => {
        logger.info("Init sync scan NFT smartContract Job");
    });

    swapNFTJob().then(() => {
        logger.info("Init sync swap NFT smartContract Job");
    });

    swapAplusJob().then(() => {
        logger.info("Init sync swap Aplus Job");
    });
}