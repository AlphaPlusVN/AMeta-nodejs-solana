// import NFT, { NFTAttribute, NFTTokenMetadata, NFTType } from "./NFT";
// import { readFileSync } from 'fs';
// import * as path from 'path';
// export enum OuterRank {
//     C = 'C',
//     B = 'B',
//     A = 'A',
//     S = 'S',
//     SS = 'SS'
// }

// export enum OuterTraits {
//     Kindly = 'Kindly',
//     Angry = 'Angry',
//     Funny = 'Funny',
//     Hardly = 'Hardly'
// }

// export interface Outer {
//     energy: number,
//     power: number,
//     speed: number,
//     traits: OuterTraits,
//     level: 1 | 2 | 3,
//     rank: OuterRank,
//     skill: string,
//     ADN: string,
//     hashADN: string,
// }

// export var OuterCount: number = 1;

// class OuterNFT extends NFT {
//     constructor() {
//         super(NFTType.Outer)
//     }



//     generate = async (payerWallet: string): Promise<NFTTokenMetadata> => {
//         let name = await this.getNextId();
//         let energy = this.getRandomEnergy();
//         let power = this.getRandomPower();
//         let speed = this.getRandomSpeed();
//         let traits = this.getRandomTraits();
//         let level = 1;
//         let rank = OuterRank.A;
//         let skill = 'None';

//         // let ADN = `${name}${energy}${power}${speed}${traits}${level}${rank}`
//         let attributes: NFTAttribute[] = [
//             {
//                 trait_type: 'Energy',
//                 value: energy.toString(),
//             },
//             {
//                 trait_type: 'Power',
//                 value: power.toString(),
//             },
//             {
//                 trait_type: 'Speed',
//                 value: speed.toString(),
//             },
//             {
//                 trait_type: 'Traits',
//                 value: traits.toString(),
//             },
//             {
//                 trait_type: 'Level',
//                 value: level.toString(),
//             },
//             {
//                 trait_type: 'Rank',
//                 value: rank.toString(),
//             },
//             {
//                 trait_type: 'Skill',
//                 value: skill.toString(),
//             },
//         ]
//         try {
//             let imgUri = await this.getImageUri();

//             this.tokenMetadata = {
//                 name: name,
//                 symbol: 'OUTER',
//                 description: 'Outer of Outer Space NFT game',
//                 seller_fee_basis_points: 1,
//                 attributes: attributes,
//                 image: imgUri,
//                 properties: {
//                     creators: [{ address: payerWallet, share: 100 }],
//                     files: [{ uri: imgUri, type: 'image/png' }]
//                 },
//                 collection: { name: 'Outer', family: 'Outer Space' }
//             }

//             this.tokenMetadata.attributes.push({
//                 trait_type: 'ADN',
//                 value: this.getHashADN()
//             })
//         } catch (err) {
//             return null;
//         }

//         return this.tokenMetadata;
//     }

//     getRandomEnergy = () => {
//         return this.getRandomNumber(20, 100);
//     }

//     getRandomPower = () => {
//         return this.getRandomNumber(20, 100);
//     }

//     getRandomSpeed = () => {
//         return this.getRandomNumber(3, 10);
//     }

//     getRandomTraits = () => {
//         var rand = Math.floor(Math.random() * Object.keys(OuterTraits).length);
//         var randomTraits = OuterTraits[Object.keys(OuterTraits)[rand]];
//         return randomTraits;
//     }

//     getImageUri = async (): Promise<string> => {
//         try {
//             let img = readFileSync(path.resolve(__dirname, './outer.png'));
//             let imgUri = await this.uploadToIpfs(img);
//             return imgUri;
//         } catch (err) {
//             throw new Error('upload image failed');
//         }

//     }

// }

// export default OuterNFT;