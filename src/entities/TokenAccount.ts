import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { TokenCode } from '../commons/Constants';

@Entity({collection:"bl_token_account"})
export class TokenAccount extends BaseEntity
{
    @Property() walletAddress:string;
    @Property() tokenCode: TokenCode;
    @Property() tokenAddress: string;
    @Property() inactive: number = 0;
}