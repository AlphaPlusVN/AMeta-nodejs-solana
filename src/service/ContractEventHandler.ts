import { BigNumber } from 'ethers';
import { Constants, TransType } from '../commons/Constants';
import logger from '../commons/logger';
import { newItemFromConfig, setNewLevelItemData, setNewStarItemData } from '../commons/ObjectMapper';
import { generateItemSkill, getFameByRarity, getRandomNumber, getRandomPercent } from '../commons/Utils';
import { DI } from '../configdb/database.config';
import { BoxConfig, ItemOnBox } from '../entities/BoxConfig';
import { ItemConfig, Item } from '../entities/ItemEntity';
import { SCNFTMetadata } from '../entities/NFTMetadataMapping';
import { User } from '../entities/User';
import { WalletAccount } from '../entities/WalletAccount';
import { getAplusAddressByChainId, getErc20OfAssetByUser, getErc721OfAssetByUser, getNFTAddressByChainId } from './GameAssetsService';
import { saveItemTransaction, saveTokenTransaction, saveTransaction, saveUserBalanceHistory } from './TransactionService';
import { BoxOpenHistory } from '../entities/BoxOpenHistory';

export async function mintBoxBatchTrigger(tokenIds: number[], to: string, boxType: number, contractAddress: string) {
    const SILVER = 1;
    const GOLD = 2;
    const DIAMOND = 3;
    console.log("miner batch event trigger");
    try {
        let boxCode = "";
        console.log(JSON.stringify(tokenIds));
        switch (boxType) {
            case SILVER: boxCode = "SILVER_BOX";
                break;
            case GOLD: boxCode = "GOLD_BOX";
                break;
            case DIAMOND: boxCode = "DIAMOND_BOX";
                break;
            default: throw "BOX TYPE INVALID";
        }
        const boxRepo = DI.em.fork().getRepository(BoxConfig);
        const metadataRepo = DI.em.fork().getRepository(SCNFTMetadata);
        let box = await boxRepo.findOne({ code: boxCode });
        if (box) {
            for (let tokenId of tokenIds) {
                let metadata = new SCNFTMetadata();
                metadata.contractAddress = contractAddress.toLowerCase();
                metadata.tokenId = tokenId;
                metadata.owner = to;
                metadata.jsonMetadata = {
                    name: box.name,
                    image: box.imageUrl,
                    symbol: "AmetaBox",
                    description: box.description,
                    collection: { family: "Box", name: box.name },
                    external_url: "https://ameta.games",
                    seller_fee_basis_points: 0,
                    attributes: [{ trait_type: "boxCode", value: box.code }]
                }
                metadataRepo.persist(metadata);
            }
            await metadataRepo.flush();
        }
    } catch (e) {
        logger.error(e);
    }
}

export async function mintBoxTrigger(tokenId: number, to: string, boxType: number, contractAddress: string) {
    const SILVER = 1;
    const GOLD = 2;
    const DIAMOND = 3;
    console.log("miner event trigger");
    try {
        let boxCode = "";
        switch (boxType) {
            case SILVER: boxCode = "SILVER_BOX";
                break;
            case GOLD: boxCode = "GOLD_BOX";
                break;
            case DIAMOND: boxCode = "DIAMOND_BOX";
                break;
            default: throw "BOX TYPE INVALID";
        }
        const boxRepo = DI.em.fork().getRepository(BoxConfig);
        const metadataRepo = DI.em.fork().getRepository(SCNFTMetadata);
        let box = await boxRepo.findOne({ code: boxCode });
        if (box) {
            let metadata = new SCNFTMetadata();
            metadata.contractAddress = contractAddress.toLowerCase();
            metadata.tokenId = tokenId;
            metadata.owner = to;
            metadata.jsonMetadata = {
                name: box.name,
                image: box.imageUrl,
                symbol: "AmetaBox",
                description: box.description,
                collection: { family: "Box", name: box.name },
                external_url: "https://ameta.games",
                seller_fee_basis_points: 0,
                attributes: [{ trait_type: "boxCode", value: box.code }]
            }
            await metadataRepo.persistAndFlush(metadata);
        }
    } catch (e) {
        console.error(e);
    }
}

export async function openBoxEventTrigger(owner: string, boxId: number, nftTokenId: number, boxType: number, contractAddress: string) {
    const SILVER = 1;
    const GOLD = 2;
    const DIAMOND = 3;
    console.log("open box event trigger");
    try {
        let boxCode = "";
        switch (boxType) {
            case SILVER: boxCode = "SILVER_BOX";
                break;
            case GOLD: boxCode = "GOLD_BOX";
                break;
            case DIAMOND: boxCode = "DIAMOND_BOX";
                break;
            default: throw "BOX TYPE INVALID";
        }
        const boxRepo = DI.em.fork().getRepository(BoxConfig);
        const metadataRepo = DI.em.fork().getRepository(SCNFTMetadata);
        let box = await boxRepo.findOne({ code: boxCode });
        if (box) {
            let rate = getRandomPercent();
            let currentRate = 0;
            let rarity = 0;
            for (let i = 0; i < box.rarityRate.length; i++) {
                currentRate += box.rarityRate[i];
                if (rate < currentRate) {
                    rarity = i;
                    break;
                }
            }
            let itemByRares = new Array<ItemOnBox>();
            for (let item of box.randomPool) {
                if (item.rarity == rarity) {
                    itemByRares.push(item);
                }
            }
            let randomItemIdx = getRandomNumber(itemByRares.length);
            let item = itemByRares[randomItemIdx];
            const itemConfigRepo = DI.em.fork().getRepository(ItemConfig);
            let itemConfig = await itemConfigRepo.findOne({ code: item.rewardCode });
            let metadata = new SCNFTMetadata();
            let itemMetadata = newItemFromConfig(itemConfig);
            itemMetadata.attr.fame = getFameByRarity(itemConfig.rank);
            itemMetadata.level = 1;
            itemMetadata.star = 1;
            itemMetadata.skill = generateItemSkill(itemConfig);
            setNewStarItemData(itemMetadata);
            setNewLevelItemData(itemMetadata);
            metadata.contractAddress = contractAddress.toLowerCase();
            metadata.tokenId = nftTokenId;
            metadata.owner = owner;
            metadata.jsonMetadata = {
                name: itemConfig.name,
                image: itemConfig.imageUrl,
                symbol: "NFTITem",
                description: itemConfig.desc,
                collection: { family: "Item", name: itemConfig.name },
                external_url: "https://ameta.games",
                seller_fee_basis_points: 0,
                attributes: [{ trait_type: "itemInfo", value: itemMetadata }]
            }
            await metadataRepo.persistAndFlush(metadata);
            const boxRepo = DI.em.fork().getRepository(BoxOpenHistory);
            let boxOpen = new BoxOpenHistory();
            boxOpen.boxName = boxCode;
            boxOpen.boxType = boxType;
            boxOpen.itemName = itemMetadata.name;
            boxOpen.itemRarity = itemMetadata.rank;
            boxOpen.owner = owner;
            await boxRepo.persistAndFlush(boxOpen);
        }
    } catch (e) {
        console.error(e);
    }
}

export async function linkWalletTrigger(email: string, walletAddress: string, chainId: number) {
    try {
        const walletAccountRepo = DI.em.fork().getRepository(WalletAccount);
        logger.info("link wallet " + walletAddress + " to " + email);
        const userRepo = DI.em.fork().getRepository(User);
        let user = await userRepo.findOne({ email });
        if (user && user.chainId == chainId) {
            let tokenAdded = 0;
            let walletAccount = await walletAccountRepo.findOne({ walletAddress, chainId, isDeleted: Constants.STATUS_NO });
            if (walletAccount) {
                //remove old
                logger.info("Remove exist walletAccount " + walletAddress);
                walletAccount.isDeleted = Constants.STATUS_YES;
                walletAccountRepo.persist(walletAccount);
            } else {
                //link new
                walletAccount = new WalletAccount();
                walletAccount.isDeleted = Constants.STATUS_NO;
                walletAccount.tokenOnPool = 0;
                walletAccount.userEmail = email;
                walletAccount.walletAddress = walletAddress;
                walletAccount.chainId = chainId;
                tokenAdded = await getErc20OfAssetByUser(walletAddress, chainId);
                if (user && tokenAdded > 0) {
                    user.token = user.rewardToken + tokenAdded;
                    walletAccount.tokenOnPool += tokenAdded;
                    await userRepo.persistAndFlush(user);
                }
                walletAccountRepo.persist(walletAccount);
                await walletAccountRepo.flush();
                let items = await getErc721OfAssetByUser(walletAddress, chainId);
                if (items.length > 0) {
                    const itemRepo = DI.em.fork().getRepository(Item);
                    //clear old item
                    let itemByWallets = await itemRepo.find({ walletOwner: walletAddress });
                    let transaction = await saveTransaction(Constants.SYSTEM_ADMIN, user.id, TransType.WALLET_SYNC, { token: tokenAdded, items: items }, "", walletAddress, "Remove item by wallet");
                    if (itemByWallets && itemByWallets.length > 0) {
                        for (let item of itemByWallets) {
                            item.owner = "";
                            item.isDeleted = Constants.STATUS_YES;
                        }
                        itemRepo.persist(itemByWallets);
                        await saveItemTransaction(transaction.from, transaction.to, itemByWallets, transaction.transactionNumber);
                    }
                    //add new Item
                    for (let item of items) {
                        item.owner = user.id;
                        item.walletOwner = walletAddress;
                        item.mapList = [];
                        let itemNew = itemRepo.create(item);
                        itemRepo.persist(itemNew);
                    }
                    await itemRepo.flush();
                }
            }
            await walletAccountRepo.flush();
            if (tokenAdded > 0) {
                let transaction = await saveTransaction(Constants.SYSTEM_ADMIN, user.id, TransType.WALLET_SYNC, { walletAddress, tokenAdded }, chainId + "", walletAddress, "Link wallet address");
                // if (rewards && rewards.length > 0) {
                //     await saveItemTransaction(transaction.from, transaction.to, rewards, transaction.transactionNumber);
                // }
                await saveTokenTransaction(transaction.from, transaction.to, Math.abs(tokenAdded), transaction.transactionNumber);
                await saveUserBalanceHistory(user, 0, tokenAdded, transaction.transactionNumber);
            }

        } else {
            logger.warn("skip user by chainId " + chainId);
        }
    } catch (e) {
        logger.error(e);
    }
}

export async function unLinkWalletTrigger(email: string, walletAddress: string, chainId: number) {
    try {
        const walletAccountRepo = DI.em.fork().getRepository(WalletAccount);
        let walletAccount = await walletAccountRepo.findOne({ walletAddress, chainId, isDeleted: Constants.STATUS_NO });
        let token = await getErc20OfAssetByUser(walletAddress, chainId);
        const userRepo = DI.em.fork().getRepository(User);
        let user = await userRepo.findOne({ email: email });
        if (user && token > 0) {
            user.token = user.rewardToken;
            await userRepo.persistAndFlush(user);
        }
        if (token > 0) {
            let delta = -1 * token;
            let transaction = await saveTransaction(Constants.SYSTEM_ADMIN, user.id, TransType.WALLET_SYNC, { walletAddress, token: delta }, chainId + "", walletAddress, "Unlink wallet address");
            await saveTokenTransaction(transaction.from, transaction.to, Math.abs(delta), transaction.transactionNumber);
            await saveUserBalanceHistory(user, 0, delta, transaction.transactionNumber);
        }
        if (walletAccount) {
            walletAccount.isDeleted = Constants.STATUS_YES;
            await walletAccountRepo.persistAndFlush(walletAccount);
            const itemRepo = DI.em.fork().getRepository(Item);
            let itemByWallets = await itemRepo.find({ walletOwner: walletAddress });
            let transaction = await saveTransaction(Constants.SYSTEM_ADMIN, user.id, TransType.WALLET_SYNC, { walletAddress, itemByWallets }, "", walletAddress, "Remove Item unlink wallet");
            if (itemByWallets && itemByWallets.length > 0) {
                for (let item of itemByWallets) {
                    item.owner = "";
                    item.isDeleted = Constants.STATUS_YES;
                }
                await itemRepo.persistAndFlush(itemByWallets);
                await saveItemTransaction(transaction.from, transaction.to, itemByWallets, transaction.transactionNumber);
            }
        }
    } catch (e) {
        logger.error(e);
    }
}

export async function depositErc20Trigger(email: string, walletAddress: string, tokenAddress: string, value: number, chainId: number) {
    if (tokenAddress == getAplusAddressByChainId(chainId)) {
        const walletAccountRepo = DI.em.fork().getRepository(WalletAccount);
        logger.info("Deposit " + value + " Aplus to " + email + " by " + walletAddress);
        let walletAccount = await walletAccountRepo.findOne({ userEmail: email, walletAddress, chainId, isDeleted: Constants.STATUS_NO });
        if (walletAccount) {
            walletAccount.tokenOnPool += value;
            logger.info("walletAccount" + JSON.stringify(walletAccount));
            const userRepo = DI.em.fork().getRepository(User);
            await walletAccountRepo.persistAndFlush(walletAccount);
            let user = await userRepo.findOne({ email });
            if (user) {
                logger.info("user existed")
                user.token = user.rewardToken + walletAccount.tokenOnPool;
                await userRepo.persistAndFlush(user);
                let transaction = await saveTransaction(Constants.SYSTEM_ADMIN, user.id, TransType.WALLET_SYNC, { walletAddress, token: value }, chainId + "", walletAddress, "Deposit token to account");
                await saveTokenTransaction(transaction.from, transaction.to, value, transaction.transactionNumber);
                await saveUserBalanceHistory(user, 0, value, transaction.transactionNumber);
            }
        }
    }
}

export async function depositErc721Trigger(email: string, walletAddress: string, tokenAddress: string, tokendIds: Array<BigNumber>, chainId: number) {
    try {
        if (tokenAddress == getNFTAddressByChainId(chainId)) {
            const walletAccountRepo = DI.em.fork().getRepository(WalletAccount);
            let tokenIdsNumber = new Array<number>();
            for (let tokenId of tokendIds) {
                tokenIdsNumber.push(tokenId.toNumber());
            }
            logger.info("Deposit " + JSON.stringify(tokenIdsNumber) + " to " + email + " by " + walletAddress);
            const metaDataRepo = DI.em.fork().getRepository(SCNFTMetadata);
            let metaDatas = new Array<SCNFTMetadata>();
            metaDatas = await metaDataRepo.find({ tokenId: { $in: tokenIdsNumber }, contractAddress: tokenAddress.toLowerCase() });
            let mapItems = new Map<number, Item>();
            for (let metadata of metaDatas) {
                logger.info("data " + JSON.stringify(metadata.jsonMetadata.attributes[0].value));
                mapItems.set(metadata.tokenId, metadata.jsonMetadata.attributes[0].value);
            }
            const userRepo = DI.em.fork().getRepository(User);
            let user = await userRepo.findOne({ email });
            const itemRepo = DI.em.fork().getRepository(Item);
            for (let tokenId of mapItems.keys()) {
                let item = mapItems.get(tokenId);
                item.tokenId = tokenId;
                item.owner = user.id;
                item.walletOwner = walletAddress;
                item.nftAddress = tokenAddress;
                item.mapList = [];
                let itemNew = itemRepo.create(item);
                itemRepo.persist(itemNew);
            }
            if (mapItems.size > 0) {
                await itemRepo.flush();
            }
        }
    } catch (e) {
        logger.error(e);
    }
}