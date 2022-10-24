import { ethers, logger, BigNumber } from 'ethers';
import { depositErc20Trigger, depositErc721Trigger, linkWalletTrigger, mintBoxBatchTrigger, mintBoxTrigger, openBoxEventTrigger, unLinkWalletTrigger } from '../service/ContractEventHandler';
import { ChainId } from "./EnumObjs";
import { PoolSellBox } from './PoolSellBoxPublicABI';

export namespace BscUtil {

    const BSC_ENDPOINT = 'https://data-seed-prebsc-1-s2.binance.org:8545'; //test
    const BOX_CONTRACT_ADDRESS = "0xca8B840932c0Aa34B9E425774c15074B56877fF2"; //test
    const POOL_SELL_BOX_ADDRESS = "0xcF23F0750A9EA36b4E40912C5C8f4056dA54954e"; //test
    const NFT_ADDRESS = "0x02BA6C503fa44bfF2fd8Ecc4de76703080e4bBe4"; //TEST
    const GAME_ASSETS_ADDR = "0x170FdB78693872139c31548B41a950e160F6Ba3D";
    export const APLUS_ADDRESS = "0x80d04bd9F6f296cd7059208134f4A685cedC3291";//TEST

    // const BSC_ENDPOINT = 'https://bsc-dataseed.binance.org/'; //main
    // const BOX_CONTRACT_ADDRESS = "0xC42AB9A75D391Be6C4c94f7e53c4d374aBabDA24"; //main
    // const POOL_SELL_BOX_ADDRESS = "0xEddDC76025001cD276862D523046837f703b2f85"; //main

    const provider = new ethers.providers.JsonRpcProvider(BSC_ENDPOINT);
    const defaultChainId = ChainId.BSC_TEST;
    export const BoxContract = new ethers.Contract(
        BOX_CONTRACT_ADDRESS,
        getBoxABI(), // abi
        provider
    );

    export const PoolSellBoxContract = new ethers.Contract(
        POOL_SELL_BOX_ADDRESS,
        PoolSellBox._abi, // abi
        provider
    );
    export const NFTContract = new ethers.Contract(
        NFT_ADDRESS,
        getNFTABI(),
        provider
    );

    export const gameAssetsContract = new ethers.Contract(
        GAME_ASSETS_ADDR,
        getGameAssetsABI(),
        provider
    );

    export async function boxEventListener() {
        logger.info("listen box event of BSC " + BOX_CONTRACT_ADDRESS);
        BoxContract.on("Mint", async (...params) => {
            logger.info("Mint event")
            const eventData = params[params.length - 1];
            const { transactionHash, blockNumber, args } = eventData;
            const [tokenId, boxType, to] = args;
            logger.info("txHash " + transactionHash);
            await mintBoxTrigger(tokenId.toNumber(), to, boxType.toNumber(), BOX_CONTRACT_ADDRESS.toLowerCase());
        });
        BoxContract.on("MintBatch", async (...params) => {
            logger.info("Mint batch event")
            const eventData = params[params.length - 1];
            const { transactionHash, blockNumber, args } = eventData;
            const [tokenIds, boxType, to] = args;
            logger.info("txHash " + transactionHash);
            let listTokenId = new Array<number>();
            for (let tokenId of tokenIds) {
                listTokenId.push(tokenId.toNumber());
            }
            await mintBoxBatchTrigger(listTokenId, to, boxType.toNumber(), BOX_CONTRACT_ADDRESS);
        });

        BoxContract.on("OpenBox", async (...params) => {
            logger.info("OpenBox event")
            const eventData = params[params.length - 1];
            const { transactionHash, blockNumber, args } = eventData;
            const [owner, tokenId, collectionId, boxType] = args;
            logger.info("txHash " + transactionHash);
            logger.info(JSON.stringify(args));
            await openBoxEventTrigger(owner, tokenId.toNumber(), collectionId.toNumber(), boxType.toNumber(), NFT_ADDRESS);
        });
    }

    export async function gameAssetsEventListener() {
        logger.info("listen game asset event of BSC " + GAME_ASSETS_ADDR);
        gameAssetsContract.on("LinkAccount", async (...params) => {
            logger.info("Link Account Event");
            const eventData = params[params.length - 1];
            const { transactionHash, blockNumber, args } = eventData;
            const [email, address] = args;
            logger.info("DATA " + JSON.stringify(args));
            logger.info("txHash " + transactionHash);
            linkWalletTrigger(email, address, defaultChainId);
        });

        gameAssetsContract.on("UnlinkAccount", async (...params) => {
            logger.info("Unlink Account Event")
            const eventData = params[params.length - 1];
            const { transactionHash, blockNumber, args } = eventData;
            const [email, address] = args;
            logger.info("DATA " + JSON.stringify(args));
            logger.info("txHash " + transactionHash);
            unLinkWalletTrigger(email, address, defaultChainId);
        });

        gameAssetsContract.on("DepositErc20", async (...params) => {
            logger.info("Unlink Account Event")
            const eventData = params[params.length - 1];
            const { transactionHash, blockNumber, args } = eventData;
            const [email, walletAddress, tokenAddress, value] = args;
            logger.info("DATA " + JSON.stringify(args));
            logger.info("txHash " + transactionHash);
            depositErc20Trigger(email, walletAddress, tokenAddress, value.toNumber(), defaultChainId);
        });

        gameAssetsContract.on("DepositErc721", async (...params) => {
            logger.info("Unlink Account Event")
            const eventData = params[params.length - 1];
            const { transactionHash, blockNumber, args } = eventData;
            const [email, walletAddress, tokenAddress, tokenIds] = args;
            let tokenIdArr: Array<BigNumber> = tokenIds;
            logger.info("DATA " + JSON.stringify(args));
            logger.info("txHash " + transactionHash);
            depositErc721Trigger(email, walletAddress, tokenAddress, tokenIdArr, defaultChainId);
        });
    }

    export function getBoxABI() {
        const fs = require('fs');
        let jsonFile = __dirname + "/BoxABI.json";
        let parsed = JSON.parse(fs.readFileSync(jsonFile));
        return parsed;
    }

    export function getNFTABI() {
        const fs = require('fs');
        let jsonFile = __dirname + "/NFTABI.json";
        let parsed = JSON.parse(fs.readFileSync(jsonFile));
        return parsed;
    }
    export function getGameAssetsABI() {
        const fs = require('fs');
        let jsonFile = __dirname + "/GameAssetsABI.json";
        let parsed = JSON.parse(fs.readFileSync(jsonFile));
        return parsed;
    }
}