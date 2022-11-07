import { BigNumber, Contract, ethers } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { BscUtil } from '../commons/BSCUtils';
import { ChainId } from '../commons/EnumObjs';
import logger from '../commons/logger';
import { DI } from '../configdb/database.config';
import { Item } from '../entities/ItemEntity';
import { SCNFTMetadata } from '../entities/NFTMetadataMapping';

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

export function getGameAssetsContractByChain(chainId: number) {
    let contract: Contract;
    switch (chainId) {
        case ChainId.KAR_MAIN:
        case ChainId.KAR_TEST:
            contract = BscUtil.gameAssetsContract;
            break;
        case ChainId.BSC_MAIN:
        case ChainId.BSC_TEST:
            contract = BscUtil.gameAssetsContract;
            break;
        default:
            contract = BscUtil.gameAssetsContract;
            break;
    }
    return contract;
}
export async function getOwnerContractByChain(chainId: number) {
    let wallet: ethers.Wallet;
    switch (chainId) {
        case ChainId.KAR_MAIN:
        case ChainId.KAR_TEST:
            wallet = await BscUtil.getOwner();
            break;
        case ChainId.BSC_MAIN:
        case ChainId.BSC_TEST:
            wallet = await BscUtil.getOwner();
            break;
        default:
            wallet = await BscUtil.getOwner();
            break;
    }
    return wallet;
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
    let gameAssetCt = getGameAssetsContractByChain(chainId);
    let erc20Info: Array<[tokenAddress: string, value: BigNumber]> = await gameAssetCt.viewErc20ByUser(getAddress(walletAddress));
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
    let gameAssetCt = getGameAssetsContractByChain(chainId);
    let erc20Info: [tokenAddress: string, value: string] = await gameAssetCt.viewErc20OfAssetByUser(getAddress(getAplusAddressByChainId(chainId).toLowerCase()), getAddress(walletAddress.toLowerCase()));
    logger.info(JSON.stringify(erc20Info));
    let valueToNumber = 0;
    try {
        valueToNumber = new Number(ethers.utils.formatEther(erc20Info[1])).valueOf();
    } catch (e) {
        logger.error(e);
    }
    return valueToNumber;
}

export async function getErc721OfAssetByUser(walletAddress: string, chainId: number) {
    logger.info("Call GameAssets 721 infor ")
    let gameAssetCt = getGameAssetsContractByChain(chainId);
    let erc721Info: [tokendAddress: string, tokenIds: Array<BigNumber>] = await gameAssetCt.viewErc721OfAssetByUser(getAddress(getNFTAddressByChainId(chainId).toLowerCase()), getAddress(walletAddress.toLowerCase()));
    logger.info(JSON.stringify(erc721Info));
    let tokenIdsNumber = new Array<number>();
    for (let tokenId of erc721Info[1]) {
        tokenIdsNumber.push(tokenId.toNumber());
    }
    const metaDataRepo = DI.em.fork().getRepository(SCNFTMetadata);
    let metaDatas = new Array<SCNFTMetadata>();
    metaDatas = await metaDataRepo.find({ tokenId: { $in: tokenIdsNumber }, contractAddress: getNFTAddressByChainId(chainId).toLowerCase() });
    let items = new Array<Item>();
    for (let metadata of metaDatas) {
        let item: Item = metadata.jsonMetadata.attributes[0].value;
        item.tokenId = metadata.tokenId;
        item.nftAddress = metadata.contractAddress;
        items.push(item);
    }
    return items;
}

export async function getWalletByUser(userEmail: string, chainId: number) {
    let gameAssetCt = getGameAssetsContractByChain(chainId);
    let walletAddress = await gameAssetCt.emailToWallet(userEmail);
    return walletAddress;
}

export async function syncErc20Token(walletAddress: string, token: number, chainId: number) {
    let gameAssetCt = getGameAssetsContractByChain(chainId);
    let owner = await getOwnerContractByChain(chainId);
    let data = await gameAssetCt.connect(owner).syncEr20(getAddress(getAplusAddressByChainId(chainId)), getAddress(walletAddress), token);
    logger.info("Sync wallet === " + data);
}   