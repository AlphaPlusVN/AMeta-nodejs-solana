import { Entity } from "@mikro-orm/core";
import { BaseEntity } from './BaseEntity';

@Entity()
export class User extends BaseEntity{
    username?: string;
    password?: string;
    nonce?: string;
    walletAddress: string;
    email?: string;
}