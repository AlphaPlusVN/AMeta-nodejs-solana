import { BigNumber } from 'ethers';
import { getAddress, parseEther } from 'ethers/lib/utils';
import { WALLET_BLACKLIST } from '../commons/BlackList';
import { OnusUtils } from '../commons/OnusUtils';
import { DI } from '../configdb/database.config';
import { TokenWalletHolder } from '../entities/TokenWalletHolder';
import { ScheduleUtils } from './ScheduleUtils';
import { Constants } from '../commons/Constants';
import logger from '../commons/logger';

var cron = require('node-cron');
export async function swapAplusJob() {
    let task = cron.schedule(ScheduleUtils.SWAP_APLUS_TIME, swapTokenToOnus, ScheduleUtils.DEFALT_TIMEZONE);
    task.start();
}

export async function swapTokenToOnus() {
    const tokenHolderRepo = DI.em.fork().getRepository(TokenWalletHolder);
    let tokenHolders = await tokenHolderRepo.find({ updateStatus: Constants.STATUS_NO });
    let walletOwner = await OnusUtils.getOwner();
    let aplusCt = OnusUtils.AplusContract.connect(walletOwner);
    for (let tokenHolder of tokenHolders) {
        try {
            if (!WALLET_BLACKLIST.toLowerCase().includes(tokenHolder.walletAddress.toLowerCase())) {
                let balanceClean = tokenHolder.balance.replace(".", "");
                await aplusCt.transfer(getAddress(tokenHolder.walletAddress), BigNumber.from(balanceClean));
                logger.info("Send " + parseEther(balanceClean) + " to " + tokenHolder.walletAddress);
                tokenHolder.updateStatus = Constants.STATUS_YES;
            }
        } catch (e) {
            logger.error(e);
            continue;
        }
    }
    await tokenHolderRepo.persistAndFlush(tokenHolders);
    logger.info("send Aplus to user Done!");
}