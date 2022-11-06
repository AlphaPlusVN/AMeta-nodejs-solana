import { BscUtil } from '../commons/BSCUtils';
import { KardiaUtils } from "../commons/KardiaUtils";
import { ChainId } from '../commons/EnumObjs';
import { BigNumber, Contract } from "ethers";
import logger from "../commons/logger";
import { User } from '../entities/User';
import { DI } from '../configdb/database.config';
import { SystemParam } from '../entities/SystemParam';

export const getPoolInfo = async () => {
    const output = {
        totalAllocation: 0,
        countQtyDeposit: 0,
    }
    logger.info("get pool box count ")
    try {

        {
            // BSC

            const [countQtyDeposit, totalAllocation] = await Promise.all([
                BscUtil.PoolSellBoxContract.countQtyDeposit(),
                BscUtil.PoolSellBoxContract.totalAllocation()
            ]);
            output.countQtyDeposit += countQtyDeposit.toNumber()
            output.totalAllocation += totalAllocation.toNumber()
        }

        {
            // KAI

            const [countQtyDeposit, totalAllocation] = await Promise.all([
                KardiaUtils.PoolSellBoxContract.countQtyDeposit(),
                KardiaUtils.PoolSellBoxContract.totalAllocation()
            ]);
            output.countQtyDeposit += countQtyDeposit.toNumber()
            output.totalAllocation += totalAllocation.toNumber()
        }
    }
    catch (e) {
        logger.error(e);
    }
    return output;
}

export async function getAllBoxInfo(walletAddress: string, chainId: number) {
    try {
        let boxContract = getBoxContractByChainId(chainId);
        const tokenIdsBig: BigNumber[] = await boxContract.tokenIdsOfOwner(walletAddress);
        const tokenIds = tokenIdsBig.map(v => v.toNumber())
        return tokenIds;
    } catch (e) {
        console.error(e);
        return new Array<number>();
    }
}

export async function getAllNFTInfo(walletAddress: string, chainId: number) {
    try {
        let nftContract = getNFTContractByChainId(chainId);
        const tokenIdsBig: BigNumber[] = await nftContract.tokenIdsOfOwner(walletAddress);
        const tokenIds = tokenIdsBig.map(v => v.toNumber())
        return tokenIds;
    } catch (e) {
        console.error(e);
        return new Array<number>();
    }
}

export function getBoxContractByChainId(chainId: number) {
    let boxContract: Contract;
    switch (chainId) {
        case ChainId.KAR_MAIN:
        case ChainId.KAR_TEST:
            boxContract = KardiaUtils.BoxContract;
            break;
        case ChainId.BSC_MAIN:
        case ChainId.BSC_TEST:
            boxContract = BscUtil.BoxContract;
            break;
        default: return null;
    }
    return boxContract;
}

export function getNFTContractByChainId(chainId: number) {
    let nftContract: Contract;
    switch (chainId) {
        case ChainId.KAR_MAIN:
        case ChainId.KAR_TEST:
            nftContract = KardiaUtils.NFTContract;
            break;
        case ChainId.BSC_MAIN:
        case ChainId.BSC_TEST:
            nftContract = BscUtil.NFTContract;
            break;
        default: return null;
    }
    return nftContract;
}

export async function getSystemConfigParam(key: string) {
    const systemConfigRepo = DI.em.fork().getRepository(SystemParam);
    const systemConfig = await systemConfigRepo.findOne({ code: key });
    return systemConfig;
}
