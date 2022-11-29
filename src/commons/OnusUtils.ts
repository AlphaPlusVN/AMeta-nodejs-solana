import { ethers, BigNumber, Wallet, providers } from 'ethers';
import { depositErc20Trigger, depositErc721Trigger, linkWalletTrigger, mintBoxBatchTrigger, mintBoxTrigger, openBoxEventTrigger, unLinkWalletTrigger } from '../service/ContractEventHandler';
import { ChainId } from "./EnumObjs";
import logger from './logger';
import { PoolSellBox } from './PoolSellBoxPublicABI';

export namespace OnusUtils {

    const ONUS_ENDPOINT = 'https://rpc-testnet.onuschain.io/'; //test
    const BOX_CONTRACT_ADDRESS = "0xf8A097f7b5628e9219267f11F993152be30Fc474"; //test
    const POOL_SELL_BOX_ADDRESS = "0x9FAdBC4e89a73E6DE53f3699851a57618251db80"; //test
    export const NFT_ADDRESS = "0xc8F7bF561816AC07BB2D0438aD31269590351e47"; //TEST
    const GAME_ASSETS_ADDR = "0x3B0212CC4F82EB38C740C82FD60CB5Ea49cfEa29";
    export const APLUS_ADDRESS = "0x69C2938769d7Aa35f69102F365303f4e380C12E1";//TEST

    // const BSC_ENDPOINT = 'https://bsc-dataseed.binance.org/'; //main
    // const BOX_CONTRACT_ADDRESS = "0xC42AB9A75D391Be6C4c94f7e53c4d374aBabDA24"; //main
    // const POOL_SELL_BOX_ADDRESS = "0xEddDC76025001cD276862D523046837f703b2f85"; //main

    export const provider = new ethers.providers.JsonRpcProvider(ONUS_ENDPOINT, providers.getNetwork({ chainId: ChainId.ONUS_TEST, name: "onus-testnet" }));
    const defaultChainId = ChainId.ONUS_TEST;
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
            await openBoxEventTrigger(owner, tokenId.toNumber(), boxType.toNumber(), NFT_ADDRESS);
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
            logger.info("Deposit ERC20 Account Event")
            const eventData = params[params.length - 1];
            const { transactionHash, blockNumber, args } = eventData;
            const [email, walletAddress, tokenAddress, value] = args;
            logger.info("DATA " + JSON.stringify(args));
            logger.info("txHash " + transactionHash);
            let valueToNumber = 0;
            try {
                valueToNumber = new Number(ethers.utils.formatEther(value)).valueOf();
            } catch (e) {
                logger.error(e);
            }
            depositErc20Trigger(email, walletAddress, tokenAddress, valueToNumber, defaultChainId);
        });

        gameAssetsContract.on("DepositErc721", async (...params) => {
            logger.info("Deposit ERC 721")
            const eventData = params[params.length - 1];
            const { transactionHash, blockNumber, args } = eventData;
            const [email, walletAddress, tokenAddress, tokenIds] = args;
            let tokenIdArr: Array<BigNumber> = tokenIds;
            logger.info("DATA " + JSON.stringify(args));
            logger.info("txHash " + transactionHash);
            await depositErc721Trigger(email, walletAddress, tokenAddress, tokenIdArr, defaultChainId);
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

    export async function getOwner() {
        const signer = await new Wallet(getPrivateKey());
        let account = signer.connect(provider);
        return account;
    }

    export function getPrivateKey() {
        const fs = require('fs');
        let jsonFile = __dirname + "/ga_private.pem";
        let parsed: Buffer = fs.readFileSync(jsonFile);
        return parsed.toString();
    }
}