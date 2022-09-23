import { DI } from '../configdb/database.config';
import { BoxConfig, ItemOnBox } from '../entities/BoxConfig';
import { ItemConfig } from '../entities/ItemEntity';
import { SCNFTMetadata } from '../entities/NFTMetadataMapping';
import { generateItemSkill, getFameByRarity, getRandomNumber, getRandomPercent } from './Utils';
import { ethers } from "ethers";

const BSC_ENDPOINT = 'https://data-seed-prebsc-1-s1.binance.org:8545';
const BOX_CONTRACT_ADDRESS = "0xca8B840932c0Aa34B9E425774c15074B56877fF2";
const NFT_ADDRESS = "";

const provider = new ethers.providers.JsonRpcProvider(BSC_ENDPOINT);

const boxContract = new ethers.Contract(
    BOX_CONTRACT_ADDRESS,
    getBoxABI(), // abi
    provider
);

boxContract.on("Mint", async (...params) => {
    const eventData = params[params.length - 1];
    const { transactionHash, blockNumber, args } = eventData;
    const { tokenId, boxType, to } = args;
    console.log("txHash " + transactionHash);
    await mintBoxTrigger(tokenId, to, boxType);
});
boxContract.on("MintBatch", async (...params) => {
    const eventData = params[params.length - 1];
    const { transactionHash, blockNumber, args } = eventData;
    const { tokenIds, boxType, to } = args;
    console.log("txHash " + transactionHash);
    await mintBoxBatchTrigger(tokenIds, to, boxType);
});
boxContract.on("OpenBox", async (...params) => {
    const eventData = params[params.length - 1];
    const { transactionHash, blockNumber, args } = eventData;
    const { owner, tokenId, collectionId, boxType } = args;
    console.log("txHash " + transactionHash);
    await openBoxEventTrigger(owner, tokenId, collectionId, boxType);
});
export async function mintBoxBatchTrigger(tokenIds: number[], to: string, boxType: number) {
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
                metadata.contractAddress = BOX_CONTRACT_ADDRESS.toLowerCase();
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
        console.error(e);
    }
}

export async function mintBoxTrigger(tokenId: number, to: string, boxType: number) {
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
            metadata.contractAddress = BOX_CONTRACT_ADDRESS.toLowerCase();
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

export async function openBoxEventTrigger(owner: string, boxId: number, nftTokenId: number, boxType: number) {
    const SILVER = 1;
    const GOLD = 2;
    const DIAMOND = 3;
    console.log("miner event trigger");
    try {
        let boxCode = "";
        console.log(JSON.stringify(event));
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
            for (let key of box.rarityRate.keys()) {
                currentRate += box.rarityRate.get(key);
                if (rate < currentRate) {
                    rarity = parseInt(key);
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
            metadata.contractAddress = NFT_ADDRESS.toLowerCase();
            metadata.tokenId = nftTokenId;
            metadata.owner = owner;
            metadata.jsonMetadata = {
                name: itemConfig.name,
                image: itemConfig.imageUrl,
                symbol: "AmetaBox",
                description: itemConfig.desc,
                collection: { family: "Item", name: itemConfig.name },
                external_url: "https://ameta.games",
                seller_fee_basis_points: 0,
                attributes: [{ trait_type: "itemCode", value: itemConfig.code },
                { trait_type: "fame", value: getFameByRarity(rarity) },
                { trait_type: "skills", value: generateItemSkill(itemConfig) }
                ]
            }
            await metadataRepo.persistAndFlush(metadata);
        }
    } catch (e) {
        console.error(e);
    }
}

export function getBoxABI() {
    const fs = require('fs');
    var jsonFile = __dirname + "/BoxABI.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    return abi;
}