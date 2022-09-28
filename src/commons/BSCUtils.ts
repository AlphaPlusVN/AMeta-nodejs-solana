import { DI } from '../configdb/database.config';
import { BoxConfig, ItemOnBox } from '../entities/BoxConfig';
import { ItemConfig } from '../entities/ItemEntity';
import { SCNFTMetadata } from '../entities/NFTMetadataMapping';
import { generateItemSkill, getFameByRarity, getRandomNumber, getRandomPercent } from './Utils';
import { ethers } from "ethers";
import { PoolSellBox } from './PoolSellBoxPublicABI';

export namespace BscUtil {

    // const BSC_ENDPOINT = 'https://data-seed-prebsc-1-s1.binance.org:8545'; //test
    // const BOX_CONTRACT_ADDRESS = "0xca8B840932c0Aa34B9E425774c15074B56877fF2"; //test
    const BSC_ENDPOINT = 'https://bsc-dataseed.binance.org/'; //main
    const BOX_CONTRACT_ADDRESS = "0xC42AB9A75D391Be6C4c94f7e53c4d374aBabDA24"; //main
    const POOL_SELL_BOX_ADDRESS = "0xEddDC76025001cD276862D523046837f703b2f85"; //main
    const NFT_ADDRESS = "";

    const provider = new ethers.providers.JsonRpcProvider(BSC_ENDPOINT);

    const boxContract = new ethers.Contract(
        BOX_CONTRACT_ADDRESS,
        getBoxABI(), // abi
        provider
    );

    export const PoolSellBoxContract = new ethers.Contract(
        POOL_SELL_BOX_ADDRESS,
        PoolSellBox._abi, // abi
        provider
    );

    export async function boxEventListener() {
        console.log("listen event of " + BOX_CONTRACT_ADDRESS);
        boxContract.on("Mint", async (...params) => {
            console.log("Mint event")
            const eventData = params[params.length - 1];
            const { transactionHash, blockNumber, args } = eventData;
            const [tokenId, boxType, to] = args;
            console.log("txHash " + transactionHash);
            await mintBoxTrigger(tokenId.toNumber(), to, boxType.toNumber());
        });
        boxContract.on("MintBatch", async (...params) => {
            console.log("Mint batch event")
            const eventData = params[params.length - 1];
            const { transactionHash, blockNumber, args } = eventData;
            const [tokenIds, boxType, to] = args;
            console.log("txHash " + transactionHash);
            let listTokenId = new Array<number>();
            for (let tokenId of tokenIds) {
                listTokenId.push(tokenId.toNumber());
            }
            await mintBoxBatchTrigger(listTokenId, to, boxType.toNumber());
        });
        boxContract.on("OpenBox", async (...params) => {
            console.log("OpenBox event")
            const eventData = params[params.length - 1];
            const { transactionHash, blockNumber, args } = eventData;
            const [owner, tokenId, collectionId, boxType] = args;
            console.log("txHash " + transactionHash);
            console.log(JSON.stringify(args));
            await openBoxEventTrigger(owner, tokenId.toNumber(), collectionId.toNumber(), boxType.toNumber());
        });
    }

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
        let jsonFile = __dirname + "/BoxABI.json";
        let parsed = JSON.parse(fs.readFileSync(jsonFile));
        return parsed;
    }
}