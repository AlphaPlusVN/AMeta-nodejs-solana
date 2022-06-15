import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';

@Entity({collection:"mkt_cnf"})
export class MarKetConfig extends BaseEntity
{
    @Property()
    nftCount:number;
}