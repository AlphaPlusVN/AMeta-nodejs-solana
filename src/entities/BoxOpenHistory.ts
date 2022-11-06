import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
@Entity({ collection: "box_open_history" })
export class BoxOpenHistory extends BaseEntity {
    @Property() boxType: number;
    @Property() boxName: string;
    @Property() itemName: string;
    @Property() itemRarity: number;
}