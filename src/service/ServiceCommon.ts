import { BscUtil } from "../commons/BSCUtils";
import { KardiaUtils } from "../commons/KardiaUtils";
import { ChainId } from '../commons/EnumObjs';
import { BigNumber, Contract } from "ethers";

export const getPoolInfo = async () => {
    const output = {
        totalAllocation: 0,
        countQtyDeposit: 0,
    }

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
    }
    return boxContract;
}