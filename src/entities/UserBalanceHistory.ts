import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';

@Entity({ collection: "user_balance_history" })
export class UserBalanceHistory extends BaseEntity {
    @Property() userId: string;
    @Property() gold: number;
    @Property() token: number;
    @Property() goldChange: number;
    @Property() tokenChange: number;
    @Property() transactionNumber: number;
}