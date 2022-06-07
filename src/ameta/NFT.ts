import { createHash } from "crypto";
import { create } from "ipfs-http-client";
import { min } from "moment";
import { closeDb, collection } from "../commons/mongo";

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
    collection: { name: "Box" | "Fishing rod", family: "AMeta" }
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
        let mkt_cnf_collection = await collection('mkt_cnf');
        let mkt_cnf = await mkt_cnf_collection.findOne();
        if (mkt_cnf) {
            let nftCount = Number(mkt_cnf.nftCount);
            await mkt_cnf_collection.updateOne({ _id: mkt_cnf._id }, { $set: { nftCount: nftCount += 1 } })
            closeDb();
            return nftCount
        }
        return 0;
    }
    getNextId = async (): Promise<string> => {
        let count = await this.getCurrentCount();
        let nextId = `#${this.type}${String(count).padStart(9, '0')}`;
        return nextId;
    };
}