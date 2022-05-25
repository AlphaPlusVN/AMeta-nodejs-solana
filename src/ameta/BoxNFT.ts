import NFT, { NFTTokenMetadata, NFTType } from "./NFT";

class BoxNFT extends NFT {
    constructor(){
        super(NFTType.Box);
    }
    generate = async (payerWallet: string): Promise<NFTTokenMetadata> => {
        let name = await this.getNextId();
        this.tokenMetadata  = {
            name: name,
            symbol: 'BOX',
            description: 'Starter Box Outer Space NFT game',
            seller_fee_basis_points: 1,
            attributes: [
                {
                    trait_type: 'Type',
                    value: 'Starter Box'
                }
            ],
            image: 'http://referral-mb.herokuapp.com/box1.png',
            properties: {
                creators: [{ address: payerWallet, share: 100 }],
                files: [{ uri: 'http://referral-mb.herokuapp.com/box1.png', type: 'image/png' }]
            },
            collection: { name: 'Box', family: 'Outer Space' }

        }
        
        return this.tokenMetadata;
    }

    
}

export default BoxNFT;