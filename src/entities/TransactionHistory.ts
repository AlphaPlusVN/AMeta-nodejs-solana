import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';

@Entity({ collection: "transaction_history" })
export class TransactionHistory extends BaseEntity {
    @Property() requestId: string;
    @Property() transactionNumber: number;
    @Property() createdBy: string;
    @Property() transactionData: any;
    @Property() from: string;
    @Property() to: string;
    @Property() description: string;
    @Property() refId: string;
    @Property() transType: string;
}

@Entity({ collection: "transaction_token" })
export class TransactionToken extends BaseEntity {
    @Property() transactionId: string;
    @Property() transactionNumber: number;
    @Property() from: string;
    @Property() to: string;
    @Property() token: number;
}

@Entity({ collection: "transaction_item" })
export class TransactionItem extends BaseEntity {
    @Property() transactionId: string;
    @Property() transactionNumber: number;
    @Property() from: string;
    @Property() to: string;
    @Property() items: Array<any>;
}

@Entity({ collection: "transaction_gold" })
export class TransactionGold extends BaseEntity {
    @Property() transactionId: string;
    @Property() transactionNumber: number;
    @Property() from: string;
    @Property() to: string;
    @Property() gold: number;
}