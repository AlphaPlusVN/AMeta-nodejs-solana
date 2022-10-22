import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from './BaseEntity';

@Entity()
export class User extends BaseEntity {
    @Property() username!: string;
    @Property() email: string;
    @Property() password!: string;
    @Property() pendingSessionId: string;
    @Property() pendingSessionTimestamp: number;
    @Property() activeSessionId: string;
    @Property() progress: string = "0,0";
    @Property() prevGrid: string = "0,0";
    @Property() position: any;
    @Property() mapId: number = 0;
    @Property() mapCode: string;
    @Property() rotation: any;
    @Property() outfit: any;
    @Property() profileDeco: any;
    @Property() gem: number = 0;
    @Property() token: number = 0;
    @Property() rewardToken: number = 0;
    @Property() lastLogin: Date;
    @Property() fistLogin: boolean;
    @Property() equipment: string;
    @Property() currentAction: number;
    @Property() userCode: number = 0;
    @Property() walletAddress: string;
    @Property() chainCode: string;
    @Property() ametaBalance: number;
    @Property() userServiceId: string;
    @Property() displayName: string;
    @Property() shortDesc: string;
    @Property() mapTicket: string;
}