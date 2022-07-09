import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { TokenCode } from '../commons/Constants';


export type ItemOnBox = {
    itemType: number;
    ratePoint: number;
}

@Entity({ collection: "box_config" })
export class BoxConfig extends BaseEntity {
    @Property() code: TokenCode;
    @Property() address: string;
    @Property() price: number;
    @Property() isNFT: number;
    @Property() items: ItemOnBox[];
}