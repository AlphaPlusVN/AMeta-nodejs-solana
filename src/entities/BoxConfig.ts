import { Entity, Property } from '@mikro-orm/core';
import { Payment } from '../commons/type';
import { BaseEntity } from './BaseEntity';

export type ItemOnBox = {
    itemType: number;
    rewardCode: string;
    itemName: string;
    rarity: number;
    quantity: { from: number, to: number };
    imageUrl: string;
}

@Entity({ collection: "box_config" })
export class BoxConfig extends BaseEntity {
    @Property() code: string;
    @Property() description: string;
    @Property() name: string;
    @Property() address: string;
    @Property() payments: Payment[];
    @Property() isNFT: number;
    @Property() rarityRate: Map<string, number>;
    @Property() randomPool: ItemOnBox[];
    @Property() normalPool: ItemOnBox[];
    @Property() inactive: number = 0;
    @Property() itemType: number;
    @Property() imageUrl: string;
}