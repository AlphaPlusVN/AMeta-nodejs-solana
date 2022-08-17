import { NFTStorageClient } from '../client/nft-storage/NFTStorageRequest';
import { Item } from '../entities/ItemEntity';
import { DI } from '../configdb/database.config';
import { BoxConfig } from '../entities/BoxConfig';
export namespace NFTMetaData {
    export async function uploadItemMetadata(item: Item, walletAdress: string) {
        let cid = "";
        let imageUrl = item.imageUrl;
        const metadata = {
            name: item.name,
            description: item.description,
            external_url: "https://ameta.games",
            image: imageUrl,
            attributes: [
                {
                    trait_type: "Item Attributes",
                    value: JSON.stringify(item.attr),
                }
            ]
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
            name: box.name,
            description: box.description,
            external_url: "https://ameta.games",
            attributes: [
                {
                    trait_type: "Box",
                    value: "Custom",
                },
            ],
            image: imageUrl,
        };
        cid = "https://ipfs.io/ipfs/" + await NFTStorageClient.storeMetadata(JSON.stringify(metadata));
        return cid;
    }
}

