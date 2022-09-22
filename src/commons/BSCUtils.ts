import Web3 from 'web3';
import { NFTMetaData } from '../ameta/NFTMetadata';
import { DI } from '../configdb/database.config';
import { BoxConfig, ItemOnBox } from '../entities/BoxConfig';
import { SCNFTMetadata, MetaDataFormat } from '../entities/NFTMetadataMapping';
import { getRandomPercent, randomFromTo, getRandomNumber, getFameByRarity, generateItemSkill } from './Utils';
import { ItemConfig } from '../entities/ItemEntity';

const BSC_ENDPOINT = 'https://data-seed-prebsc-1-s1.binance.org:8545';
const BOX_CONTRACT_ADDRESS = "0xca8B840932c0Aa34B9E425774c15074B56877fF2";
const NFT_ADDRESS = "";


export const web3Kar = new Web3(Web3.givenProvider || BSC_ENDPOINT);
export const boxContract = new web3Kar.eth.Contract(getBoxABI(), BOX_CONTRACT_ADDRESS);

let options = {
    filter: {
    },
    fromBlock: 0
};
//listen event mint box
boxContract.events.Mint(options, function (error: any, event: any) { console.log(event); })
    .on('data', mintBoxEventTrigger(event))
    .on('changed', function (changed: any) { console.log(changed) })
    .on('error', function (err: any) { console.log('error', err.message, err.stack) })
    .on('connected', function (str: any) { console.log(str) });

//listen event openBox
boxContract.events.OpenBox(options, function (error: any, event: any) { console.log(event); })
    .on('data', openBoxEventTrigger(event))
    .on('changed', function (changed: any) { console.log(changed) })
    .on('error', function (err: any) { console.log('error', err.message, err.stack) })
    .on('connected', function (str: any) { console.log(str) });

export async function mintBoxEventTrigger(event: any) {
    const SILVER = 1;
    const GOLD = 2;
    const DIAMOND = 3;
    console.log("miner event trigger");
    try {
        let boxCode = "";
        console.log(JSON.stringify(event));
        let returnValues = event.returnValues;
        switch (returnValues.boxType) {
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
            metadata.tokenId = returnValues.tokenId;
            metadata.owner = returnValues.to;
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

export async function openBoxEventTrigger(event: any) {
    const SILVER = 1;
    const GOLD = 2;
    const DIAMOND = 3;
    console.log("miner event trigger");
    try {
        let boxCode = "";
        console.log(JSON.stringify(event));
        let returnValues = event.returnValues;
        let nftTokenId = event.collectionId;
        switch (returnValues.boxType) {
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
            metadata.tokenId = returnValues.tokenId;
            metadata.owner = returnValues.to;
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