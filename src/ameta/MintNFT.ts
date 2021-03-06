import { NFTStorageClient } from '../client/nft-storage/NFTStorageRequest';
import { DI } from '../configdb/database.config';
import { BoxConfig } from '../entities/BoxConfig';
import { Item } from '../entities/ItemEntity';
export namespace MintNFT
{
    export async function uploadItemMetadata(item: Item, walletAdress: string) {
        let cid = "";       
        let imageUrl = item.imageUrl;
        const metadata = {
            name: item.name,
            symbol: "Item",
            description: item.description,
            seller_fee_basis_points: 1,
            external_url: "https://ameta.games",
            attributes: [
                {
                    trait_type: "Item Attributes",
                    value: JSON.stringify(item.attr),
                },
            ],
            collection: {
                name: "Ameta Item",
                family: "NFTs",
            },
            properties: {
                files: [
                    {
                        uri: imageUrl,
                        type: "image/png",
                    },
                ],
                category: "image",
                maxSupply: 1,
                creators: [
                    {
                        address: walletAdress,
                        share: 100,
                    },
                ],
            },
            image: imageUrl,
        };
        cid = "https://ipfs.io/ipfs/" + await NFTStorageClient.storeMetadata(JSON.stringify(metadata));
        return cid;
    }

    export async function uploadBoxMetadata(boxCode: string, walletAdress: string) {
        let cid = "";
        const boxRepo = DI.em.fork().getRepository(BoxConfig);
        let box = await boxRepo.findOne({ code: boxCode });
        if (!box) {
            return null;
        }
        let imageUrl = box.imageUrl;
        const metadata = {
            name: box.code,
            symbol: "Box",
            description: box.description,
            seller_fee_basis_points: 1,
            external_url: "https://ameta.games",
            attributes: [
                {
                    trait_type: "Box",
                    value: "Custom",
                },
            ],
            collection: {
                name: "Ameta Box",
                family: "NFTs",
            },
            properties: {
                files: [
                    {
                        uri: imageUrl,
                        type: "image/png",
                    },
                ],
                category: "image",
                maxSupply: 1,
                creators: [
                    {
                        address: walletAdress,
                        share: 100,
                    },
                ],
            },
            image: imageUrl,
        };
        cid = "https://ipfs.io/ipfs/" + await NFTStorageClient.storeMetadata(JSON.stringify(metadata));
        return cid;
    }
}


