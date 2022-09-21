import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';

@Entity({ collection: "sc_nft_medata" })
export class SCNFTMetadata extends BaseEntity {
    @Property() contractAddress: string;
    @Property() tokenId: number;
    @Property() jsonMetadata: MetaDataFormat;
}
export type MetaDataAttr =
    {
        trait_type: string,
        value: any;
    }
export type MetaDataFormat =
    {
        name: string,
        symbol: string,
        description: string,
        seller_fee_basis_points: number,
        external_url: string,
        attributes: MetaDataAttr[],
        collection: {
            name: string,
            family: string
        },
        image: string
    }