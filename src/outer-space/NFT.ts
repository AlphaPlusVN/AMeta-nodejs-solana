import { createHash } from "crypto";
import { min } from "moment";

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
    collection: { name: "Box" | "Outer" | 'Planet', family: "Outer Space" }
}

export enum NFTType {
    Box = 'Box',
    Outer = 'Outer',
    Planet = 'Planet'
}

export default abstract class NFT {
    type: NFTType;
    tokenMetadata: NFTTokenMetadata | null = null;

    ADN: string;
    public hashADN: string;

    constructor(type: NFTType) {
        this.type = type;
    }

    abstract getNextId: () => string;

    abstract generate: (payerWallet: string) => NFTTokenMetadata;
    upload = async (): Promise<string> => {
        return '';
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
}