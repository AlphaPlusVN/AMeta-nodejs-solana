import { Entity, Property } from "@mikro-orm/core";
import { Document } from "mongodb"
import { BaseEntity } from './BaseEntity';

@Entity({ collection: "mkt_transaction" })
export class MktTransaction extends BaseEntity {
    @Property() txSignature: string;
    @Property() transactionResponse: string;
    @Property() isHandled: boolean;
    @Property() created: string;
}