import { BaseEntity } from './BaseEntity';
import { Entity } from '@mikro-orm/core';

@Entity({collection : "wallet_cache"})
export class WalletCache extends BaseEntity
{
    walletAddress: string;
    secretKey: string;
}