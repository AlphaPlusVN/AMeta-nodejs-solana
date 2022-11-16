import logger from "../commons/logger";
import { syncItemMetadataJob } from "./SyncItemMetadataJob";
export async function initSchedule() {
    syncItemMetadataJob().then(() => {
        logger.info("Init sync Item Metadata Job");
    });
}