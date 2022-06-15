import { BaseEntity } from './BaseEntity';
import { Entity, Property } from '@mikro-orm/core';

@Entity({collection : "wallet_cache"})
export class WalletCache extends BaseEntity
{
    @Property() walletAddress: string;
    @Property() secretKey: string;
}