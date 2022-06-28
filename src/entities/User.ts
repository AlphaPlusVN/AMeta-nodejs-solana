import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from './BaseEntity';

@Entity()
export class User extends BaseEntity{
    @Property() activeSessionId: string;
    @Property() username?: string;
    @Property() password?: string;
    @Property() nonce?: string;
    @Property() walletAddress: string;
    @Property() email?: string;
}