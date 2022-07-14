import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from './BaseEntity';

export class ItemAttribute {
    damage: number = 0;
    maxCharge: number = 0;
    remainCharge: number = 0;
    amor: number = 0;
}

@Entity()
export class Item extends BaseEntity {
    @Property() owner: string;
    @Property() itemType!: number;
    @Property() buyFee?: number;
    @Property() sellFee?: number;
    @Property() name: string;
    @Property() description: string;
    @Property() rank: number;
    @Property() group: number;
    @Property() quantity: number = 1;
    @Property() hotItem: number = 0;
    @Property() modelId: number = 0;
    @Property() equiped: number = 0;
    @Property() attr?: ItemAttribute = new ItemAttribute();
    @Property() nftAddress: string;
    @Property() isNFT: number;
    @Property() isLocked: number;
}


@Entity({ collection: "item_config" })
export class ItemConfig extends BaseEntity {
    @Property() itemType!: number;
    @Property() code: string;
    @Property() name: string;
    @Property() desc: string;
    @Property() group: number;
    @Property() rank: number = 0;
    @Property() buyFee: number;
    @Property() sellFee: number;
    @Property() shopType: number;
    @Property() attr: ItemAttribute = new ItemAttribute();
}