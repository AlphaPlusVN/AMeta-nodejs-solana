import { BscUtil } from '../commons/BSCUtils';
import { KardiaUtils } from "../commons/KardiaUtils";
import { ChainId } from '../commons/EnumObjs';
import { BigNumber, Contract } from "ethers";
import logger from "../commons/logger";
import { User } from '../entities/User';

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

export function getAplusAddressByChainId(chainId: number) {
    let address: string;
    switch (chainId) {
        case ChainId.KAR_MAIN:
        case ChainId.KAR_TEST:
            address = BscUtil.APLUS_ADDRESS;
            break;
        case ChainId.BSC_MAIN:
        case ChainId.BSC_TEST:
            address = BscUtil.APLUS_ADDRESS;
            break;
        default: return null;
    }
    return address;
}
export async function getERC20Assets(walletAddress: string, chainId: number) {
    logger.info("Call GameAssets ERC20 infor ")
    let erc20Info: Array<[tokenAddress: string, value: BigNumber]> = await BscUtil.gameAssetsContract.viewErc20ByUser(walletAddress);
    logger.info(JSON.stringify(erc20Info));
    let value = 0;
    for (let erc20token of erc20Info) {
        if (erc20token[0] == getAplusAddressByChainId(chainId)) {
            value = erc20token[1].toNumber();
        }
    }
    return value;
}