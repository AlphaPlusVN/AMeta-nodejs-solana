import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from './BaseEntity';
import { FromToObject } from '../commons/CommonType';

export class ItemAttribute {
    damage: number = 0;
    maxCharge: number = 0;
    remainCharge: number = 0;
    amor: number = 0;
    //fish and fighing rod
    fame: number = 0;
    netWeight: number = 0;
    //resourceItem
    value?: number = 0;
    //rod & fishing rod
    catcherBarSize: number | 0;
    catcherBarSpeed: number | 0;
}

@Entity({ collection: "item_skill" })
export class ItemSkill extends BaseEntity {
    @Property() code: string;
    @Property() name: string;
    @Property() type: number; //0 passive, 1 active
    @Property() description: string;
    @Property() effectType: number;
    @Property() coolDown: number; //sec
    @Property() duration: FromToObject;
    @Property() effectValue: FromToObject;
    @Property() accuracy: number;
    ratePoint: number;
}

export class ResourceItem {
    itemType: number;
    itemName: string;
    rarity: number | 0;
    point: number;
    code: string;
}

@Entity()
export class Item extends BaseEntity {
    @Property() owner: string;
    @Property() itemType!: number;
    @Property({ default: 0 }) buyFee?: number;
    @Property({ default: 0 }) sellFee?: number;
    @Property() name: string;
    @Property() description: string;
    @Property() rank: number;
    @Property() group: number;
    @Property({ default: 1 }) quantity: number = 1;
    @Property({ default: 0 }) hotItem: number = 0;
    @Property({ default: "0" }) modelId: string = "0";
    @Property({ default: 0 }) equiped: number = 0;
    @Property({ default: 0 }) canBuild: number = 0; //0 can't build
    @Property() mapList: Array<number> = new Array<number>();
    @Property({ default: 0 }) isNFT: number = 0;
    @Property() nftAddress: string;
    @Property() attr: ItemAttribute = new ItemAttribute();
    @Property({ default: 0 }) canStack: number = 0;
    @Property({ default: 0 }) isLocked: number = 0;
    @Property() imageUrl: string;
    @Property({ default: 0 }) durability: number = 0;
    @Property({ default: 0 }) durabilityMax: number = 0;
    @Property({ default: 1 }) level: number = 1;
    @Property({ default: 1 }) star: number = 1;
    @Property({ default: 100 }) nextLevelPoint: number = 100;
    @Property({ default: 100 }) nextStarPoint: number = 100;
    @Property({ default: 0 }) currentLevelPoint: number = 0;
    @Property({ default: 0 }) currentStarPoint: number = 0;
    @Property() levelUpradeRequires: Array<ResourceItem>;
    @Property() starUpradeRequires: Array<ResourceItem>;
    @Property() skill: Array<ItemSkill>;
    @Property() code: string;
    @Property() color: string = "0";
    @Property({ default: 0 }) lockedToTime: number | 0;
    @Property() walletOwner: string;
}


@Entity({ collection: "item_config" })
export class ItemConfig extends BaseEntity {
    @Property() itemType!: number;
    @Property() code: string;
    @Property() group: number;
    @Property({ default: 0 }) rank: number;
    @Property({ default: 0 }) buyFee: number;
    @Property({ default: 0 }) sellFee: number;
    @Property() shopType: number;
    @Property({ default: 0 }) canBuild: number = 0; //0 can't build
    @Property() mapList: Array<number> = new Array<number>();
    @Property() craftingItems: Array<number> = new Array<number>();
    @Property() canCraft: number = 0;
    @Property({ default: 0 }) durability: number = 0;
    @Property() attr: ItemAttribute = new ItemAttribute();
    @Property() name: string;
    @Property() desc: string;
    @Property({ default: 0 }) canStack: number;
    @Property({ default: 0 }) isNFT: number = 0;
    @Property() imageUrl: string;
    @Property({ default: 0 }) durabilityMax: number;
    @Property() skill: ItemSkill[];
    @Property() passiveSkill: ItemSkill[];
    @Property({ default: 0 }) nextLevelPoint: number;
    @Property({ default: 0 }) nextStarPoint: number;
    @Property() levelUpradeRequires: Array<ResourceItem>;
    @Property() starUpradeRequires: Array<ResourceItem>;
    @Property() modelId: string;
    @Property() level: number; //for fish
}