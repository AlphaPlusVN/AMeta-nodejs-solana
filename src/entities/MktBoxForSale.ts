import { Entity, Property } from "@mikro-orm/core";
import { Document } from "mongodb"
import { BaseEntity } from './BaseEntity';

@Entity({ collection: "mkt_box_for_sale" })
export class MktBoxesForSale extends BaseEntity {
   @Property() boxId: string;
   @Property() originPrice: string;
   @Property() price: string;
   @Property() avatar: string;
   @Property() status: "0" | "1";
   @Property() name: string;
   @Property() symbol: string;
}