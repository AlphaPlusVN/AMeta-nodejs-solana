import NFT, { NFTAttribute, NFTTokenMetadata, NFTType } from "./NFT";
import { readFileSync } from 'fs';
import * as path from 'path';
class FishingRodNFT extends NFT {
    constructor(){
        super(NFTType.FishingRod);
    }
    generate = async (payerWallet: string): Promise<NFTTokenMetadata> => {
        try {
            let name = await this.getNextId();
            let attributes: NFTAttribute[] = [
                
            ]
            let imgUri = await this.getImageUri();

            this.tokenMetadata = {
                name: name,
                symbol: 'FISHING ROD',
                description: 'Fishing rod of AMeta',
                seller_fee_basis_points: 1,
                attributes: attributes,
                image: imgUri,
                properties: {
                    creators: [{ address: payerWallet, share: 100 }],
                    files: [{ uri: imgUri, type: 'image/png' }]
                },
                collection: { name: 'Fishing rod', family: 'AMeta' }
            }

        } catch (err) {
            return null;
        }


        return this.tokenMetadata;
    }

    getImageUri = async (): Promise<string> => {
        try {
            let img = readFileSync(path.resolve(__dirname, './fishingrod.png'));
            let imgUri = await this.uploadToIpfs(img);
            return imgUri;
        } catch (err) {
            throw new Error('upload image failed');
        }

    }
}

export default FishingRodNFT;