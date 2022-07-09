import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';

@Entity({collection:"bl_token_account"})
export class TokenAccount extends BaseEntity
{
    @Property() userId:string;
    @Property() tokenCode: string;
    @Property() tokenAddress: string;
    @Property() inactive: number = 0;
}