import { BscUtil } from "../commons/BSCUtils";
import { KardiaUtils } from "../commons/KardiaUtils";

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