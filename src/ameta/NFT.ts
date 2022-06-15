import { createHash } from "crypto";
import { create } from "ipfs-http-client";
import { DI } from "../configdb/database.config";
import { MarKetConfig } from '../entities/MarketConfig';
export interface NFTAttribute {
    trait_type: string,
    value: string
}
export interface NFTCreators {
    address: string,
    share: number
}
export interface NFTTokenMetadata {

    name: string,
    symbol: string,
    description: string,
    seller_fee_basis_points: number,
    image: string,
    attributes: NFTAttribute[],
    properties: {
        creators: NFTCreators[],
        files: { uri: string, type: 'image/png' }[]
    },
    collection: { name: string, family: string }
}

export enum NFTType {
    Box = 'Box',
    FishingRod = 'Fishing rod',
}

export default abstract class NFT {
    type: NFTType;
    tokenMetadata: NFTTokenMetadata | null = null;

    ADN: string;
    public hashADN: string;

    constructor(type: NFTType) {
        this.type = type;
    }

    // abstract getNextId: () => string;

    abstract generate: (payerWallet: string) => Promise<NFTTokenMetadata>;
    uploadToIpfs = async (entry: any, options?: any): Promise<string> => {
        console.log("=====Uploading to IPFS======")
        let ipfs = await create({
            host: 'ipfs.infura.io',
            port: 5001,
            protocol: 'https'
        })
        // let data = OuterNFT.generate('8f9G9mnpWw3m3zPaQxHAc4doqsqs5ctwakjo6mXGJKxb');
        let result = await ipfs.add(entry);
        return `https://ipfs.io/ipfs/${result.cid.toString()}`;
    }
    upload = async (): Promise<string> => {

        if (!this.tokenMetadata) return null;
        let url = await this.uploadToIpfs({ path: `${this.tokenMetadata.name}.json`, content: JSON.stringify(this.tokenMetadata) });
        console.log(url);
        return url;
    }

    getRandomNumber = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getADN = (): string => {
        let ADN = '';
        if (this.tokenMetadata) {
            let attributes: NFTAttribute[] = this.tokenMetadata.attributes;
            attributes.map((value, index) => {
                ADN = ADN + value.value.toString();
            })
        }
        console.log(ADN);
        this.ADN = ADN;
        return ADN;
    }

    getHashADN = (): string => {
        this.hashADN = createHash('md5').update(this.getADN()).digest('hex').toUpperCase();
        return this.hashADN;
    }

    getCurrentCount = async (): Promise<Number> => {
        const mktCnfRepo = DI.em.fork().getRepository(MarKetConfig);
        let mktCnf = await mktCnfRepo.findOne({});
        if (mktCnf) {
            mktCnf.nftCount += 1;
            await mktCnfRepo.persistAndFlush(mktCnf)
            return mktCnf.nftCount;
        }
        return 0;
    }
    getNextId = async (): Promise<string> => {
        let count = await this.getCurrentCount();
        let nextId = `#${this.type}${String(count).padStart(9, '0')}`;
        return nextId;
    };
}