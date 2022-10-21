import { BoxConfig, ItemOnBox } from '../entities/BoxConfig';
import { SCNFTMetadata } from '../entities/NFTMetadataMapping';
import { DI } from '../configdb/database.config';
import { getRandomPercent, getRandomNumber, getFameByRarity, generateItemSkill } from '../commons/Utils';
import { ItemConfig } from '../entities/ItemEntity';
import logger from '../commons/logger';
import { newItemFromConfig, setNewLevelItemData, setNewStarItemData } from '../commons/ObjectMapper';

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
        }
    } catch (e) {
        console.error(e);
    }
}