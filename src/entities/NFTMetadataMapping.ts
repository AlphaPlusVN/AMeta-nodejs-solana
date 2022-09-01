import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';

@Entity({collection:"sc_nft_medata"})
export class SCNFTMetadata extends BaseEntity
{
    @Property() contractAddress:string;
    @Property() tokenId:number;
    @Property() jsonMetadata:string;
}