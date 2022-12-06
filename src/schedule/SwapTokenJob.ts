import { BigNumber, logger } from 'ethers';
import { getAddress, parseEther } from 'ethers/lib/utils';
import { WALLET_BLACKLIST } from '../commons/BlackList';
import { OnusUtils } from '../commons/OnusUtils';
import { DI } from '../configdb/database.config';
import { TokenWalletHolder } from '../entities/TokenWalletHolder';
import { ScheduleUtils } from './ScheduleUtils';

var cron = require('node-cron');
export async function swapAplusJob() {
    let task = cron.schedule(ScheduleUtils.SWAP_METADATA_TIME, swapTokenToOnus, ScheduleUtils.DEFALT_TIMEZONE);
    task.start();
}

export async function swapTokenToOnus() {
    const tokenHolderRepo = DI.em.fork().getRepository(TokenWalletHolder);
    let tokenHolders = await tokenHolderRepo.findAll();
    for (let tokenHolder of tokenHolders) {
        if (!WALLET_BLACKLIST.includes(tokenHolder.walletAddress)) {
            let balanceClean = tokenHolder.balance.replace(".", "");
            let walletOwner = await OnusUtils.getOwner();
            await OnusUtils.AplusContract.connect(walletOwner).transfer(getAddress(tokenHolder.walletAddress), BigNumber.from(balanceClean));
            logger.info("Send " + parseEther(balanceClean) + " to " + tokenHolder.walletAddress);
        }
    }
    logger.info("send Aplus to user Done!");
}