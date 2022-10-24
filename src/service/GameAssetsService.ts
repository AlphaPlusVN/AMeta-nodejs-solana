import { BscUtil } from '../commons/BSCUtils';
import { ChainId } from '../commons/EnumObjs';
import { BigNumber } from 'ethers';
import logger from '../commons/logger';
import { getAddress } from 'ethers/lib/utils';

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
        default: address = BscUtil.APLUS_ADDRESS;
            break;
    }
    return address;
}
export function getNFTAddressByChainId(chainId: number) {
    let address: string;
    switch (chainId) {
        case ChainId.KAR_MAIN:
        case ChainId.KAR_TEST:
            address = BscUtil.NFT_ADDRESS;
            break;
        case ChainId.BSC_MAIN:
        case ChainId.BSC_TEST:
            address = BscUtil.NFT_ADDRESS;
            break;
        default: address = BscUtil.NFT_ADDRESS;
            break;
    }
    return address;
}

export async function getERC20Assets(walletAddress: string, chainId: number) {
    logger.info("Call GameAssets ERC20 infor ")
    let erc20Info: Array<[tokenAddress: string, value: BigNumber]> = await BscUtil.gameAssetsContract.viewErc20ByUser(getAddress(walletAddress));
    logger.info(JSON.stringify(erc20Info));
    let value = 0;
    for (let erc20token of erc20Info) {
        if (erc20token[0] == getAplusAddressByChainId(chainId)) {
            value = erc20token[1].toNumber();
        }
    }
    return value;
}
export async function getErc20OfAssetByUser(walletAddress: string, chainId: number) {
    logger.info("Call GameAssets ERC20 infor ")
    let erc20Info: [tokenAddress: string, value: BigNumber] = await BscUtil.gameAssetsContract.viewErc20OfAssetByUser(getAddress(getAplusAddressByChainId(chainId).toLowerCase()), getAddress(walletAddress.toLowerCase()));
    logger.info(JSON.stringify(erc20Info));
    return erc20Info[1].toNumber();
}


export async function getWalletByUser(userEmail: string, chainId: number) {
    let walletAddress = await BscUtil.gameAssetsContract.emailToWallet(userEmail);
    return walletAddress;
}