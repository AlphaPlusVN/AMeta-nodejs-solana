import { ArrayCollection, Collection, Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from './BaseEntity';

export class ItemAttribute {
    damage: number = 0;
    maxCharge: number = 0;
    remainCharge: number = 0;
    amor: number = 0;
    fame: number = 0;
}

@Entity()
export class Item extends BaseEntity {
    @Property() owner: string;
    @Property() itemType!: number;
    @Property({default:0}) buyFee: number = 0;
    @Property({default:0}) sellFee: number = 0;
    @Property() name: string;
    @Property() description: string;
    @Property({default:0}) rank: number = 0;
    @Property() group: number;
    @Property({default:1}) quantity: number = 1;
    @Property({default:0}) hotItem: number = 0;
    @Property({default:0}) modelId: number = 0;
    @Property({default:0}) equiped: number = 0;
    @Property({default:0}) canBuild: number = 0; //0 can't build
    @Property() mapList: Array<number> = new Array<number>();
    @Property({default:0}) isNFT: number = 0;
    @Property() nftAddress: string;
    @Property({default:0}) durability: number;
    @Property() attr?: ItemAttribute = new ItemAttribute();
    @Property({default:0}) canStack: number = 0;
    @Property({default:0}) isLocked: number = 0;
    @Property() imageUrl: string;
    @Property({default:0}) tokenId: number = 0;
}


@Entity({ collection: "item_config" })
export class ItemConfig extends BaseEntity {
    @Property() itemType!: number;
    @Property() code: string;
    @Property() group: number;
    @Property() rank: number = 0;
    @Property() buyFee: number;
    @Property() sellFee: number;
    @Property() shopType: number;
    @Property() canBuild: number = 0; //0 can't build
    @Property() mapList: Array<number> = new Array<number>();
    @Property() craftingItems: Array<number> = new Array<number>();
    @Property() canCraft: number = 0;
    @Property() durability: number;
    @Property() attr: ItemAttribute = new ItemAttribute();
    @Property() name: string;
    @Property() desc: string;
    @Property() canStack: number;
    @Property() isNFT: number = 0;
    @Property() imageUrl: string;
}