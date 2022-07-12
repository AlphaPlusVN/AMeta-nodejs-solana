import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { TokenCode } from '../commons/Constants';
import { Payment } from '../commons/type';


export type ItemOnBox = {
    itemType: number;
    itemName: string;
    ratePoint: number;
    quantity: { from: number, to: number };
}

@Entity({ collection: "box_config" })
export class BoxConfig extends BaseEntity {
    @Property() code: string;
    @Property() address: string;
    @Property() payments: Payment[];
    @Property() isNFT: number;
    @Property() randomPool: ItemOnBox[];
    @Property() normalPool: ItemOnBox[];
    @Property() inactive: number = 0;
    @Property() itemType: number;
}