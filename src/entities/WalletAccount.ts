import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from './BaseEntity';

@Entity({ collection: "wallet_account" })
export class WalletAccount extends BaseEntity {
    @Property() walletAddress: string;
    @Property() userEmail: string;
    @Property() userId: string;
    @Property() tokenOnPool: number = 0;
    @Property() inactive: number = 0;
}