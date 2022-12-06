import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
@Entity({ collection: "token_wallet_holder" })
export class TokenWalletHolder extends BaseEntity {
    @Property() walletAddress: string;
    @Property() balance: string;
    @Property() contractAddress: string;
    @Property() updateStatus: number = 0;
}